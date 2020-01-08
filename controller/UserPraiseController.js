"use strict"
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('UserPraiseController');

const {UserPraiseModel} = require('../modules');
const {MsgModel} = require('../modules');
const {MsgCommentModel} = require('../modules');

const getUserPraise = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = UserPraiseModel.find({});

    if(path.userId){
        if(path.userId.length == 24){
            query.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getUserPraise  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.userPraiseId){
        if(params.userPraiseId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userPraiseId));
        }else{
            logger.info('getUserPraise  userPraiseId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.PRAISE_RECORD_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.msgId){
        if(params.msgId.length == 24){
            query.where('_msg_id').equals(mongoose.mongo.ObjectId(params.msgId));
        }else{
            logger.info('getUserPraise  msgId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MSG_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.msgComId){
        if(params.MsgCommentId.length == 24){
            query.where('_msg_com_id').equals(mongoose.mongo.ObjectId(params.MsgCommentId));
        }else{
            logger.info('getUserPraise  MsgCommentId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENT_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.type){
        query.where('type').equals(params.type);
    }
    if(params.readStatus){
        query.where('read_status').equals(params.readStatus);
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getUserPraise ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getUserPraise ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getUserBePraise = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let aggregate_limit = [];
    let matchObj = {};
    aggregate_limit.push({
        $lookup: {
            from: "user_details",
            localField: "_user_id",
            foreignField: "_user_id",
            as: "user_detail_info"
        }
    });
    aggregate_limit.push({
        $lookup: {
            from: "msg_infos",
            localField: "_msg_id",
            foreignField: "_id",
            as: "msg_info"
        }
    });
    aggregate_limit.push({
        $lookup: {
            from: "msg_comments",
            localField: "_msg_com_id",
            foreignField: "_id",
            as: "msg_comment"
        }
    });
    if(params.readStatus){
        matchObj.read_status = Number(params.readStatus);
    }
    aggregate_limit.push({
        $match: matchObj
    });
    if (params.start && params.size) {
        aggregate_limit.push(
            {
                $skip : Number(params.start)
            },{
                $limit : Number(params.size)
            }
        );
    };
    UserPraiseModel.aggregate(aggregate_limit).exec((error,rows)=> {
        if (error) {
            logger.error(' getUserBePraise ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            let arrAttributeSort = [];
            for(let i=0; i<rows.length; i++){
                if (path.userId){
                    if (path.userId.length == 24) {
                        if(rows[i].type == sysConsts.COMMENT.level.firstCom){
                            //一级评论
                            if(rows[i].msg_info.length > 0 ){
                                if(rows[i].msg_info[0]._user_id.equals(mongoose.mongo.ObjectId(path.userId))){
                                    arrAttributeSort.push(rows[i]);
                                }
                            }
                        }
                        if(rows[i].type == sysConsts.COMMENT.level.twoCom){
                            //二级评论
                            if(rows[i].msg_comment.length > 0 ){
                                if(rows[i].msg_comment[0]._user_id.equals(mongoose.mongo.ObjectId(path.userId))){
                                    arrAttributeSort.push(rows[i]);
                                }
                            }
                        }
                    } else {
                        logger.info('getUserBePraise userID format incorrect!');
                        resUtil.resetQueryRes(res, [], null);
                        return next();
                    }
                }
            }
            logger.info(' getUserBePraise ' + 'success');
            resUtil.resetQueryRes(res, arrAttributeSort);
            return next();
        }
    });
}
const createUserPraise = (req, res, next) => {
    let path = req.params;
    let bodyParams = req.body;
    let returnMessage;
    //保存点赞数据
    const savePraise =()=>{
        return new Promise((resolve, reject) => {
            let userPraiseObj = bodyParams;
            if(path.userId){
                if(path.userId.length == 24){
                    userPraiseObj._user_id = mongoose.mongo.ObjectId(path.userId);
                }else{
                    logger.info('createUserPraise savePraise userID format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
                    return next();
                }
            }
            if(bodyParams.msgId){
                bodyParams._msg_id = bodyParams.msgId;
            }
            if(bodyParams.msgUserId){
                bodyParams._msg_user_id = bodyParams.msgUserId;
            }
            if(bodyParams.msgComId){
                bodyParams._msg_com_id = bodyParams.msgComId;
            }
            if(bodyParams.msgComUserId){
                bodyParams._msg_com_user_id = bodyParams.msgComUserId;
            }
            userPraiseObj.read_status = sysConsts.INFO.read_status.unread;
            let userPraiseModel = new UserPraiseModel(userPraiseObj);
            userPraiseModel.save(function(error,result){
                if (error) {
                    logger.error(' createUserPraise savePraise ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' createUserPraise savePraise ' + 'success');
                    returnMessage = result;
                    resolve();
                }
            })
        });
    }
    const updateMessageNum = () =>{
        return new Promise((resolve, reject) => {
            let query = MsgModel.find({});
            if(bodyParams.msgId){
                if(bodyParams.msgId.length == 24){
                    query.where('_id').equals(mongoose.mongo.ObjectId(bodyParams.msgId));
                }else{
                    logger.info('createUserPraise updateMessageNum messageId format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.MSG_ID_NULL_ERROR);
                    return next();
                }
            }
            MsgModel.findOneAndUpdate(query,{ $inc: { agree_num: 1 } }).exec((error,rows)=> {
                if (error) {
                    logger.error(' createUserPraise updateMessageNum ' + error.message);
                    resUtil.resInternalError(error,res);
                } else {
                    logger.info(' createUserPraise updateMessageNum ' + 'success');
                    if(bodyParams.type == sysConsts.COMMENT.level.firstCom){
                        resUtil.resetQueryRes(res, returnMessage);
                        return next();
                    }else{
                        resolve();
                    }
                }
            });
        });
    }
    const updateMsgCommentNum = () =>{
        return new Promise(() => {
            let queryComment = MsgCommentModel.find({});
            if(bodyParams.msgComId){
                if(bodyParams.msgComId.length == 24){
                    queryComment.where('_id').equals(mongoose.mongo.ObjectId(bodyParams.msgComId));
                }else{
                    logger.info('createUserPraise updateMsgCommentNum msgComId format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.COMMENT_ID_NULL_ERROR);
                    return next();
                }
            }
            MsgCommentModel.findOneAndUpdate(queryComment,{ $inc: { agree_num: 1 } }).exec((error,rows)=> {
                if (error) {
                    logger.error(' createUserPraise updateMsgCommentNum ' + error.message);
                    resUtil.resInternalError(error,res);
                } else {
                    logger.info(' createUserPraise updateMsgCommentNum ' + 'success');
                    resUtil.resetQueryRes(res, returnMessage);
                    return next();
                }
            });
        });
    }
    savePraise()
        .then(updateMessageNum)
        .then(updateMsgCommentNum)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }
        })
}
const updateReadStatus = (req, res, next) => {
    let bodyParams = req.body;
    let path = req.params;
    let query = UserPraiseModel.find({});
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('updateReadStatus  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.userPraiseId){
        if(path.userPraiseId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.userPraiseId));
        }else{
            logger.info('updateReadStatus  userPraiseId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.PRAISE_RECORD_ID_NULL_ERROR);
            return next();
        }
    }
    if(bodyParams.readStatus) {
        bodyParams.read_status = bodyParams.readStatus;
    }
    UserPraiseModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateReadStatus ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateReadStatus ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
const getUserPraiseByAdmin = (req, res, next) => {
    let params = req.query;
    let query = UserPraiseModel.find({});

    if(params.userId){
        if(params.userId.length == 24){
            query.where('_user_id').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('getUserPraiseByAdmin  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.userPraiseId){
        if(params.userPraiseId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userPraiseId));
        }else{
            logger.info('getUserPraiseByAdmin  userPraiseId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.PRAISE_RECORD_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.msgId){
        if(params.msgId.length == 24){
            query.where('_msg_id').equals(mongoose.mongo.ObjectId(params.msgId));
        }else{
            logger.info('getUserPraiseByAdmin  messagesId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MSG_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.msgComId){
        if(params.msgComId.length == 24){
            query.where('_msg_com_id').equals(mongoose.mongo.ObjectId(params.msgComId));
        }else{
            logger.info('getUserPraiseByAdmin  MsgCommentId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENT_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.type){
        query.where('type').equals(params.type);
    }
    if(params.readStatus){
        query.where('read_status').equals(params.readStatus);
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getUserPraiseByAdmin ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getUserPraiseByAdmin ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
module.exports = {
    getUserPraise,
    getUserBePraise,
    createUserPraise,
    updateReadStatus,
    getUserPraiseByAdmin
};
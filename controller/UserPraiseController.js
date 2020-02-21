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
const {InfoModel} = require('../modules');
const {UserDetailModel} = require('../modules');

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
    //判断是否已点赞
    const getPraise =()=>{
        return new Promise((resolve, reject) => {
            let query = UserPraiseModel.find({});
            if(path.userId){
                if(path.userId.length == 24){
                    query.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
                }else{
                    logger.info(' createUserPraise getPraise  userID format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
                    return next();
                }
            }
            if(bodyParams.msgId){
                if(bodyParams.msgId.length == 24){
                    query.where('_msg_id').equals(mongoose.mongo.ObjectId(bodyParams.msgId));
                }else{
                    logger.info(' createUserPraise getPraise  msgId format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.MSG_ID_NULL_ERROR);
                    return next();
                }
            }
            if(bodyParams.type == 2){
                query.where('type').equals(sysConsts.USERPRAISE.type.comment);
                if(bodyParams.msgComId){
                    if(bodyParams.msgComId.length == 24){
                        query.where('_msg_com_id').equals(mongoose.mongo.ObjectId(bodyParams.msgComId));
                    }else{
                        logger.info(' createUserPraise getPraise  msgComId format incorrect!');
                        resUtil.resetUpdateRes(res,null,systemMsg.COMMENT_ID_NULL_ERROR);
                        return next();
                    }
                }
            }else{
                query.where('type').equals(sysConsts.USERPRAISE.type.msg);
            }
            query.exec((error,rows)=> {
                if (error) {
                    logger.error(' createUserPraise getPraise ' + error.message);
                    reject({err:error});
                } else {
                    logger.info(' createUserPraise getPraise ' + 'success');
                    if(rows.length > 0){
                        if(bodyParams.type ==1){
                            resUtil.resetUpdateRes(res,null,systemMsg.PRAISE_MSG_CREATE_ERROR);
                            return next();
                        }else{
                            resUtil.resetUpdateRes(res,null,systemMsg.PRAISE_COM_CREATE_ERROR);
                            return next();
                        }
                    }else{
                        resolve();
                    }
                }
            });
        });
    }
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
            });
        });
    }
    //查询用户昵称
    const getNickName = () =>{
        return new Promise((resolve, reject) => {
            let queryUserDetail = UserDetailModel.find({},{nick_name:1});
            if(path.userId){
                if(path.userId.length == 24){
                    queryUserDetail.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
                }else{
                    logger.info('createUserPraise getNickName  userID format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
                    return next();
                }
            }
            queryUserDetail.exec((error,rows)=> {
                if (error) {
                    logger.error(' createUserPraise getNickName ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' createUserPraise getNickName ' + 'success');
                    if(rows.length > 0){
                        resolve(rows[0]._doc.nick_name);
                    }else{
                        reject({msg:systemMsg.CUST_ID_NULL_ERROR});
                    }
                }
            });
        });
    }
    //添加消息提醒
    const createInfo = (nickName) =>{
        return new Promise((resolve, reject)=>{
            let infoObj = bodyParams;
            let content ={};
            if(bodyParams.msgComUserId){
                //如果一级评论用户存在 则提示一级评论用户
                if(bodyParams.msgComUserId.length == 24){
                    content._user_id = mongoose.mongo.ObjectId(bodyParams.msgComUserId);
                    content.txt = nickName + " 赞了你的评论";
                }else{
                    logger.info('createUserPraise createInfo msgComUserId format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.COMMENT_ID_NULL_ERROR);
                    return next();
                }
            }else{
                //如果一级评论用户不存在 则通知文章用户
                if(bodyParams.msgUserId.length == 24){
                    content._user_id = mongoose.mongo.ObjectId(bodyParams.msgUserId);
                    content.txt = nickName + " 赞了你的文章";
                }else{
                    logger.info('createUserPraise createInfo msgUserId format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.MSG_ID_NULL_ERROR);
                    return next();
                }
            }
            infoObj.type = sysConsts.INFO.type.praise;
            infoObj.status = sysConsts.INFO.status.unread;
            infoObj.content = content;
            let infoModel = new InfoModel(infoObj);
            infoModel.save(function(error,result){
                if (error) {
                    logger.error(' createUserPraise createInfo ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' createUserPraise createInfo ' + 'success');
                    resolve();
                }
            });
        });
    }
    //更新文章点赞数
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
    //更新评论点赞数
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
                    resUtil.resetCreateRes(res, returnMessage);
                    return next();
                }
            });
        });
    }
    getPraise()
        .then(savePraise)
        .then(getNickName)
        .then(createInfo)
        .then(updateMessageNum)
        .then(updateMsgCommentNum)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }else{
                resUtil.resetFailedRes(res,reject.msg);
            }
        })
}
const getUserPraiseByAdmin = (req, res, next) => {
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
    if(params.userId){
        if(params.userId.length == 24){
            matchObj._user_id = mongoose.mongo.ObjectId(params.userId);
        }else{
            logger.info('getUserPraiseByAdmin  userID format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(params.userPraiseId){
        if(params.userPraiseId.length == 24){
            matchObj._id = mongoose.mongo.ObjectId(params.userPraiseId);
        }else{
            logger.info('getUserPraiseByAdmin  userPraiseId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(params.msgId){
        if(params.msgId.length == 24){
            matchObj._msg_id = mongoose.mongo.ObjectId(params.msgId);
        }else{
            logger.info('getUserPraiseByAdmin  messagesId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(params.msgComId){
        if(params.msgComId.length == 24){
            matchObj._msg_com_id = mongoose.mongo.ObjectId(params.msgComId);
        }else{
            logger.info('getUserPraiseByAdmin  MsgCommentId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(params.type){
        matchObj.type = mongoose.mongo.ObjectId(params.type);
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
    getUserPraiseByAdmin
};
"use strict"
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const moment = require('moment');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('MsgCommentController');

const {MsgCommentModel} = require('../modules');
const {MsgModel} = require('../modules');
const {UserModel} = require('../modules');
const {UserDetailModel} = require('../modules');

const getUserMsgComment = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = MsgCommentModel.find({});

    if(path.userId){
        if(path.userId.length == 24){
            query.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getUserMsgComment  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.msgId){
        if(params.msgId.length == 24){
            query.where('_msg_id').equals(mongoose.mongo.ObjectId(params.msgId));
        }else{
            logger.info('getUserMsgComment  _msg_id format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MSG_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.msgComId){
        if(params.msgComId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.msgComId));
        }else{
            logger.info('getUserMsgComment  msgComId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENT_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.msgType){
        query.where('msg_type').equals(params.msgType);
    }
    if(params.level){
        query.where('level').equals(params.level);
    }
    if(params.readStatus){
        query.where('read_status').equals(params.readStatus);
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getUserMsgComment ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getUserMsgComment ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getUserBeMsgComment = (req, res, next) => {
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
            from: "user_details",
            localField: "_msg_user_id",
            foreignField: "_user_id",
            as: "msg_user_detail_info"
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
    if(params.msgType){
        matchObj.msg_type = Number(params.msgType);
    }
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
    MsgCommentModel.aggregate(aggregate_limit).exec((error,rows)=> {
        if (error) {
            logger.error(' getUserBeMsgComment ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            // console.log('rows:',rows);
            let arrAttributeSort = [];
            for(let i=0; i<rows.length; i++){
                if (path.userId){
                    if (path.userId.length == 24) {
                        if(rows[i].level == sysConsts.COMMENT.level.firstCom){
                            //一级评论
                            if(rows[i].msg_info.length > 0 ){
                                if(rows[i].msg_info[0]._user_id.equals(mongoose.mongo.ObjectId(path.userId))){
                                    arrAttributeSort.push(rows[i]);
                                }
                            }
                        }
                        if(rows[i].level == sysConsts.COMMENT.level.twoCom){
                            //二级评论
                            if(rows[i].msg_comment.length > 0 ){
                                if(rows[i].msg_comment[0]._user_id.equals(mongoose.mongo.ObjectId(path.userId))){
                                    arrAttributeSort.push(rows[i]);
                                }
                            }
                        }
                    } else {
                        logger.info('getUserBeMsgComment userID format incorrect!');
                        resUtil.resetQueryRes(res, [], null);
                        return next();
                    }
                }
            }
            logger.info(' getUserBeMsgComment ' + 'success');
            resUtil.resetQueryRes(res, arrAttributeSort);
            return next();
        }
    });
}
const getAllMsgComment = (req, res, next) => {
    let params = req.query;
    let query = MsgCommentModel.find({});
    if(params.msgId){
        if(params.msgId.length == 24){
            query.where('_msg_id').equals(mongoose.mongo.ObjectId(params.msgId));
        }else{
            logger.info('getAllMsgComment  msgId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MSG_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.msgComId){
        if(params.msgComId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.msgComId));
        }else{
            logger.info('getAllMsgComment  msgComId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENT_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.level){
        query.where('level').equals(params.level);
    }
    if(params.readStatus){
        query.where('read_status').equals(params.readStatus);
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getAllMsgComment ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getAllMsgComment ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createMsgComment = (req, res, next) => {
    let path = req.params;
    let bodyParams = req.body;
    let returnMessage;
    //保存新评论信息
    const saveMsgComment = ()=>{
        return new Promise((resolve, reject) => {
            let msgCommentObj = bodyParams;
            if(bodyParams.msgType){
                msgCommentObj.msg_type = bodyParams.msgType ;
            }
            if(bodyParams.msgId){
                msgCommentObj._msg_id = bodyParams.msgId ;
            }
            if(bodyParams.msgUserId){
                msgCommentObj._msg_user_id = bodyParams.msgUserId ;
            }
            if(bodyParams.msgComId){
                msgCommentObj._msg_com_id = bodyParams.msgComId ;
            }
            if(bodyParams.msgComUserId){
                msgCommentObj._msg_com_user_id = bodyParams.msgComUserId ;
            }
            msgCommentObj.status = sysConsts.COMMENT.status.normal;
            msgCommentObj.read_status = sysConsts.INFO.read_status.unread;
            msgCommentObj.comment_num = 0;
            msgCommentObj.agree_num = 0;
            if(path.userId){
                if(path.userId.length == 24){
                    msgCommentObj._user_id = mongoose.mongo.ObjectId(path.userId);
                }else{
                    logger.info('createMsgComment userID format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
                    return next();
                }
            }
            let msgCommentModel = new MsgCommentModel(msgCommentObj);
            msgCommentModel.save(function(error,result){
                if (error) {
                    logger.error(' createMsgComment saveMsgComment ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' createMsgComment saveMsgComment ' + 'success');
                    returnMessage = result;
                    resolve();
                }
            });
        });
    }
    //更新用户的评论数
    const updateUserNumber =()=>{
        return new Promise((resolve, reject) => {
            let queryUser = UserDetailModel.find({});
            if(path.userId){
                if(path.userId.length == 24){
                    queryUser.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
                }else{
                    logger.info('createMsgComment updateUserNumber _user_id format incorrect!');
                    return next();
                }
            }
            if(bodyParams.level == 1){
                //文章评论数加一
                UserDetailModel.findOneAndUpdate(queryUser,{ $inc: { comment_num: 1 } }).exec((error,rows)=> {
                    if (error) {
                        logger.error(' createMsgComment updateUserNumber ' + error.message);
                    } else {
                        logger.info(' createMsgComment updateUserNumber ' + 'success');
                        resolve();
                    }
                });
            }else{
                //回复评论数加一
                UserDetailModel.findOneAndUpdate(queryUser,{ $inc: { comment_reply_num: 1 } }).exec((error,rows)=> {
                    if (error) {
                        logger.error(' createMsgComment updateUserNumber ' + error.message);
                    } else {
                        logger.info(' createMsgComment updateUserNumber ' + 'success');
                        resolve();
                    }
                });
            }

        });
    }
    //更新动态的评论数（一级评论）
    const updateMessageNum = () =>{
        return new Promise(() => {
            let query = MsgModel.find({});
            if(bodyParams.msgId){
                if(bodyParams.msgId.length == 24){
                    query.where('_id').equals(mongoose.mongo.ObjectId(bodyParams.msgId));
                }else{
                    logger.info('createMsgComment updateMessageNum msgId format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.MSG_ID_NULL_ERROR);
                    return next();
                }
            }
            MsgModel.findOneAndUpdate(query,{ $inc: { comment_num: 1 } },).exec((error,rows)=> {
                if (error) {
                    logger.error(' createMsgComment updateMessageNum ' + error.message);
                    resUtil.resInternalError(error,res);
                } else {
                    logger.info(' createMsgComment updateMessageNum ' + 'success');
                    resUtil.resetCreateRes(res, returnMessage);
                    return next();
                }
            });
        });
    }
    //更新评论的评论数（二级评论）
    const updateMsgCommentNum = () =>{
        return new Promise((() => {
            let query = MsgCommentModel.find({});
            if(bodyParams.msgComId){
                if(bodyParams.msgComId.length == 24){
                    query.where('_id').equals(mongoose.mongo.ObjectId(bodyParams.msgComId));
                }else{
                    logger.info('createMsgComment updateMsgCommentNum msgComId format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.COMMENT_ID_NULL_ERROR);
                    return next();
                }
            }
            MsgCommentModel.findOneAndUpdate(query,{ $inc: { comment_num: 1 } }).exec((error,rows)=> {
                if (error) {
                    logger.error(' createMsgComment updateMsgCommentNum ' + error.message);
                    resUtil.resInternalError(error,res);
                } else {
                    logger.info(' createMsgComment updateMsgCommentNum ' + 'success');
                    resUtil.resetCreateRes(res,returnMessage);
                    return next();
                }
            });
        }));
    }
    saveMsgComment()
        .then(updateUserNumber)
        .then(()=>{
            if(bodyParams.level == sysConsts.COMMENT.level.firstCom){
                //一级评论
                updateMessageNum();
            }else{
                //二级评论
                updateMsgCommentNum();
            }
        })
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }else{
                resUtil.resetFailedRes(res,reject.msg);
            }
        })
}
const updateReadStatus = (req, res, next) => {
    let bodyParams = req.body;
    let path = req.params;
    let query = MsgCommentModel.find({});

    if(path.userId){
        if(path.userId.length == 24){
            query.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('updateReadStatus  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.msgComId){
        if(path.msgComId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.msgComId));
        }else{
            logger.info('updateReadStatus  msgComId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENT_ID_NULL_ERROR);
            return next();
        }
    }
    MsgCommentModel.updateOne(query,bodyParams,function(error,result){
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
const deleteComments = (req, res, next) => {
    let path = req.params;
    let query = MsgModel.find({});
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('deleteComments userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.msgComId){
        if(path.msgComId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.msgComId));
        }else{
            logger.info('deleteComments msgComId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MSG_ID_NULL_ERROR);
            return next();
        }
    }
    MsgCommentModel.deleteOne(query,function(error,result){
        if(error){
            logger.error('deleteComments ' + error.message);
            resUtil.resInternalError(error,res,next);
        }else{
            logger.info('deleteComments ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
const getMsgCommentByAdmin = (req, res, next) => {
    let params = req.query;
    let aggregate_limit = [];
    let matchObj = {};
    aggregate_limit.push(
        {
            $lookup: {
                from: "msg_infos",
                localField: "_msg_id",
                foreignField: "_id",
                as: "msg_info"
            }
        },
        {
            $lookup: {
                from: "user_infos",
                localField: "_user_id",
                foreignField: "_id",
                as: "user_login_info"
            }
        },
        {
            $lookup: {
                from: "user_details",
                localField: "_user_id",
                foreignField: "_user_id",
                as: "user_detail_info"
            }
        }
    );

    if(params.msgComId){
        if(params.msgComId.length == 24){
            matchObj._id = mongoose.mongo.ObjectId(params.msgComId);
        }else{
            logger.info('getMsgCommentByAdmin  msgComId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENT_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.msgId){
        if(params.msgId.length == 24){
            matchObj._msg_id = mongoose.mongo.ObjectId(params.msgId);
        }else{
            logger.info('getMsgCommentByAdmin  msgComId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MSG_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.userId && (params.phone == '' || params.phone == null ||  params.phone == "undefined")){
        if(params.userId.length == 24){
            matchObj._user_id = mongoose.mongo.ObjectId(params.userId);
        }else{
            logger.info('getMsgCommentByAdmin  _user_id format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if (params.msgType){
        matchObj.msg_type = Number(params.msgType);
    }
    if (params.status){
        matchObj.status = Number(params.status);
    }
    if (params.createDateStart && params.createDateEnd) {
        matchObj["created_at"] = {$gte: new Date(params.createDateStart), $lte: new Date(params.createDateEnd)};
    }
    //根据phone查询用户ID
    const getUserId = () =>{
        return new Promise((resolve, reject) => {
            //判断查询条件中 是否存在电话号
            if(params.phone){
                let query = UserModel.find({});
                if(params.phone){
                    query.where('phone').equals(params.phone);
                }
                query.exec((error,rows)=> {
                    if (error) {
                        logger.error(' getMsgCommentByAdmin getUserId ' + error.message);
                        resUtil.resInternalError(error,res);
                    } else {
                        logger.info(' getMsgCommentByAdmin getUserId ' + 'success');
                        if(params.userId){
                            if(mongoose.mongo.ObjectId(params.userId) == rows[0]._doc._id){
                                matchObj._user_id = mongoose.mongo.ObjectId(params.userId);
                            }
                        }else{
                            matchObj._user_id = mongoose.mongo.ObjectId(rows[0]._doc._id);
                        }
                        resolve();
                    }
                });
            }else{
                resolve();
            }
        });
    }
    const getComment =()=>{
        return new Promise(() => {
            aggregate_limit.push({
                $match: matchObj
            });

            if (params.start && params.size){
                aggregate_limit.push(
                    {
                        $skip : Number(params.start)
                    },{
                        $limit : Number(params.size)
                    }
                );
            };

            aggregate_limit.push({
                $project: {
                    "user_login_info.password": 0
                }
            });

            MsgCommentModel.aggregate(aggregate_limit).exec((error,rows)=> {
                if (error) {
                    logger.error(' getMsgCommentByAdmin getComment ' + error.message);
                    resUtil.resInternalError(error,res);
                } else {
                    logger.info(' getMsgCommentByAdmin getComment ' + 'success');
                    resUtil.resetQueryRes(res, rows);
                    return next();
                }
            });
        });
    }
    getUserId()
        .then(getComment)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }
        })

}
const getMsgCommentCountByAdmin = (req, res, next) => {
    let query = MsgCommentModel.find({});
    query.countDocuments().exec((error,rows)=> {
        if (error) {
            logger.error(' getMsgCommentCountByAdmin ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getMsgCommentCountByAdmin ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getMsgCommentTodayCountByAdmin = (req, res, next) => {
    let aggregate_limit = [];
    let today = new Date();
    let startDay = new Date(moment(today).format('YYYY-MM-DD'));
    let endDay = new Date(moment(today).add(1, 'days').format('YYYY-MM-DD'));
    aggregate_limit.push(
        {
            $lookup: {
                from: "msg_infos",
                localField: "_msg_id",
                foreignField: "_id",
                as: "msg_info"
            }
        }
    );
    if(startDay && endDay){
        aggregate_limit.push({
            $match: {
                created_at :  {$gte: startDay,$lt: endDay}
            }
        });
    }
    aggregate_limit.push({
        $group: {
            _id: {type:"$msg_info.type"},
            count:{$sum:1}
        }
    });
    MsgCommentModel.aggregate(aggregate_limit).exec((error,rows)=> {
        if (error) {
            logger.error(' getMsgCommentTodayCountByAdmin getComment ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            console.log('rows:',rows);
            logger.info(' getMsgCommentTodayCountByAdmin getComment ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });

}
const updateStatusByAdmin = (req, res, next) => {
    let bodyParams = req.body;
    let path = req.params;
    let query = MsgCommentModel.find({});
    if(path.msgComId){
        if(path.msgComId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.msgComId));
        }else{
            logger.info('updateStatusByAdmin  msgComId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENT_ID_NULL_ERROR);
            return next();
        }
    }
    MsgCommentModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateStatusByAdmin ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateStatusByAdmin ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
const deleteCommentsByAdmin = (req, res, next) => {
    let path = req.params;
    let query = MsgCommentModel.find({});
    if(path.msgComId){
        if(path.msgComId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.msgComId));
        }else{
            logger.info('deleteCommentsByAdmin msgComId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENT_ID_NULL_ERROR);
            return next();
        }
    }
    MsgCommentModel.deleteOne(query,function(error,result){
        if(error){
            logger.error('deleteCommentsByAdmin ' + error.message);
            resUtil.resInternalError(error,res,next);
        }else{
            logger.info('deleteCommentsByAdmin ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
module.exports = {
    getUserMsgComment,
    getUserBeMsgComment,
    getAllMsgComment,
    createMsgComment,
    updateReadStatus,
    deleteComments,
    getMsgCommentByAdmin,
    getMsgCommentCountByAdmin,
    getMsgCommentTodayCountByAdmin,
    updateStatusByAdmin,
    deleteCommentsByAdmin
};
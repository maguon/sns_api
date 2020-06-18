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
const {InfoModel} = require('../modules');

const getUserMsgComment = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let aggregate_limit = [];
    let matchObj = {};
    aggregate_limit.push(
        {
            $lookup: {
                from: "user_details",
                localField: "_user_id",
                foreignField: "_user_id",
                as: "user_detail_info"
            }
        },
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
                from: "user_details",
                localField: "_msg_user_id",
                foreignField: "_user_id",
                as: "msg_user_detail_info"
            }
        },
        {
            $lookup: {
                from: "msg_comments",
                localField: "_msg_com_id",
                foreignField: "_id",
                as: "msg_com_info"
            }
        },
        {
            $lookup: {
                from: "user_details",
                localField: "_msg_com_user_id",
                foreignField: "_user_id",
                as: "msg_com_user_detail_info"
            }
        }
    );
    //我的评论
    if(path.userId ){
        if(path.userId.length == 24){
            matchObj._user_id = mongoose.mongo.ObjectId(path.userId);
        }else{
            logger.info('getUserMsgComment  userId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    //消息ID
    if(params.msgId){
        if(params.msgId.length == 24){
            matchObj._msg_id = mongoose.mongo.ObjectId(params.msgId);
        }else{
            logger.info('getUserMsgComment  msgId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MSG_ID_NULL_ERROR);
            return next();
        }
    }
    //评论ID  查询一级评论下的所有二级评论
    if(params.msgComId){
        if(params.msgComId.length == 24){
            matchObj._msg_com_id = mongoose.mongo.ObjectId(params.msgComId);
        }else{
            logger.info('getUserMsgComment  msgComId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENT_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.msgType){
        matchObj.msg_type = Number(params.msgType);
    }
    if(params.level){
        matchObj.level = Number(params.level);
    }
    aggregate_limit.push({
        $match: matchObj
    });
    aggregate_limit.push({
        $sort: { "created_at": -1 }
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
    aggregate_limit.push(
        {
            $lookup: {
                from: "user_details",
                localField: "_user_id",
                foreignField: "_user_id",
                as: "user_detail_info"
            }
        },
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
                from: "user_details",
                localField: "_msg_user_id",
                foreignField: "_user_id",
                as: "msg_user_detail_info"
            }
        },
        {
            $lookup: {
                from: "msg_comments",
                localField: "_msg_com_id",
                foreignField: "_id",
                as: "msg_com_info"
            }
        },
        {
            $lookup: {
                from: "user_details",
                localField: "_msg_com_user_id",
                foreignField: "_user_id",
                as: "msg_com_user_detail_info"
            }
        }
    );
    //消息ID
    if(params.msgId){
        if(params.msgId.length == 24){
            matchObj._msg_id = mongoose.mongo.ObjectId(params.msgId);
        }else{
            logger.info('getUserBeMsgComment  msgId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MSG_ID_NULL_ERROR);
            return next();
        }
    }
    //我发布的文章
    if(path.userId ){
        if(path.userId.length == 24){
            matchObj["$or"]= [{"_msg_user_id" : mongoose.mongo.ObjectId(path.userId)},{"_msg_com_user_id" : mongoose.mongo.ObjectId(path.userId)}];
        }else{
            logger.info('getUserBeMsgComment  userId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    //评论ID
    if(params.msgComId){
        if(params.msgComId.length == 24){
            matchObj._msg_com_id = mongoose.mongo.ObjectId(params.msgComId);
        }else{
            logger.info('getUserBeMsgComment  msgComId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENT_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.msgType){
        matchObj.msg_type = Number(params.msgType);
    }
    if(params.level){
        matchObj.level = Number(params.level);
    }
    aggregate_limit.push({
        $match: matchObj
    });
    aggregate_limit.push({
        $sort: { "created_at": -1 }
    });
    if (params.start && params.size) {
        aggregate_limit.push(
            {
                $skip : Number(params.start)
            },
            {
                $limit : Number(params.size)
            }
        );
    };
    MsgCommentModel.aggregate(aggregate_limit).exec((error,rows)=> {
        if (error) {
            logger.error(' getUserBeMsgComment ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getUserBeMsgComment ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getAllMsgComment = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let aggregate_limit = [];
    let matchObj = {};
    aggregate_limit.push(
        {
            $lookup: {
                from: "user_details",
                localField: "_user_id",
                foreignField: "_user_id",
                as: "user_detail_info"
            }
        }
    );
    //用户点赞记录
    aggregate_limit.push(
        {
            $lookup: {
                from: "user_praises",
                let: { id: "$_id"},
                pipeline: [
                    { $match:
                            { $expr:
                                    {$and:[
                                            { $eq: [ "$_msg_com_id",  "$$id" ] },
                                            { $eq: [ "$_user_id",  mongoose.mongo.ObjectId(path.userId) ] },
                                            { $eq: [ "$type",  Number(sysConsts.USERPRAISE.type.comment) ] }
                                        ]}

                            }
                    },
                    { $project: { _id: 0 } }
                ],
                as: "user_praises"
            }
        }
    );
    //消息ID
    if(params.msgId){
        if(params.msgId.length == 24){
            matchObj._msg_id = mongoose.mongo.ObjectId(params.msgId);
        }else{
            logger.info('getAllMsgComment  msgId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MSG_ID_NULL_ERROR);
            return next();
        }
    }
    //评论ID
    if(params.msgComId){
        if(params.msgComId.length == 24){
            matchObj._msg_com_id = mongoose.mongo.ObjectId(params.msgComId);
        }else{
            logger.info('getAllMsgComment  msgComId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENT_ID_NULL_ERROR);
            return next();
        }
    }
    //获取单条评论编号
    if(params.oneMsgComId){
        if(params.oneMsgComId.length == 24){
            matchObj._id = mongoose.mongo.ObjectId(params.oneMsgComId);
        }else{
            logger.info('getAllMsgComment  oneMsgComId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENT_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.msgType){
        matchObj.msg_type = Number(params.msgType);
    }
    if(params.level){
        matchObj.level = Number(params.level);
    }
    aggregate_limit.push({
        $match: matchObj
    });
    aggregate_limit.push({
        $sort: { "created_at": -1 }
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
    //查询用户昵称
    const getNickName = () =>{
        return new Promise((resolve, reject) => {
            let queryUserDetail = UserDetailModel.find({},{nick_name:1});
            if(path.userId){
                if(path.userId.length == 24){
                    queryUserDetail.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
                }else{
                    logger.info('createMsgComment getNickName  userID format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
                    return next();
                }
            }
            queryUserDetail.exec((error,rows)=> {
                if (error) {
                    logger.error(' createMsgComment getNickName ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' createMsgComment getNickName ' + 'success');
                    if(rows.length == 0){
                        reject({msg:systemMsg.CUST_ID_NULL_ERROR});
                    }else{
                        resolve(rows[0]._doc.nick_name);
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
                    content.txt = nickName + " 评论了你的评论";
                }else{
                    logger.info('createUserPraise createInfo msgComUserId format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.COMMENT_ID_NULL_ERROR);
                    return next();
                }
            }else{
                //如果一级评论用户不存在 则通知文章用户
                if(bodyParams.msgUserId.length == 24){
                    content._user_id = mongoose.mongo.ObjectId(bodyParams.msgUserId);
                    content.txt = nickName + " 评论了你的文章";
                }else{
                    logger.info('createUserPraise createInfo msgUserId format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.MSG_ID_NULL_ERROR);
                    return next();
                }
            }
            infoObj.type = sysConsts.INFO.type.com;
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
            MsgModel.findOneAndUpdate(query,{ $inc: { comment_num: 1 } }).exec((error,rows)=> {
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
        return new Promise(() => {
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
        });
    }
    saveMsgComment()
        .then(getNickName)
        .then(createInfo)
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
const deleteComment = (req, res, next) => {
    let path = req.params;
    let query = MsgModel.find({});
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('deleteComment userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.msgComId){
        if(path.msgComId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.msgComId));
        }else{
            logger.info('deleteComment msgComId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MSG_ID_NULL_ERROR);
            return next();
        }
    }
    MsgCommentModel.deleteOne(query,function(error,result){
        if(error){
            logger.error('deleteComment ' + error.message);
            resUtil.resInternalError(error,res,next);
        }else{
            logger.info('deleteComment ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    });
}
const getMsgCommentByAdmin = (req, res, next) => {
    let params = req.query;
    let aggregate_limit = [];
    let matchObj = {};
    aggregate_limit.push(
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
        },
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
                from: "user_details",
                localField: "_msg_user_id",
                foreignField: "_user_id",
                as: "msg_user_detail_info"
            }
        },
        {
            $lookup: {
                from: "msg_comments",
                localField: "_msg_com_id",
                foreignField: "_id",
                as: "msg_com_info"
            }
        },
        {
            $lookup: {
                from: "user_details",
                localField: "_msg_com_user_id",
                foreignField: "_user_id",
                as: "msg_com_user_detail_info"
            }
        }
    );
    //评论用户
    if(params.userId ){
        if(params.userId.length == 24){
            matchObj._user_id = mongoose.mongo.ObjectId(params.userId);
        }else{
            logger.info('getUserMsgComment  userId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(params.Id){
        if(params.Id.length == 24){
            matchObj._id = mongoose.mongo.ObjectId(params.Id);
        }else{
            logger.info('getMsgCommentByAdmin  Id format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    //查询一级评论下所有二级
    if(params.msgComId){
        if(params.msgComId.length == 24){
            matchObj._msg_com_id = mongoose.mongo.ObjectId(params.msgComId);
        }else{
            logger.info('getMsgCommentByAdmin  msgComId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(params.msgId){
        if(params.msgId.length == 24){
            matchObj._msg_id = mongoose.mongo.ObjectId(params.msgId);
        }else{
            logger.info('getMsgCommentByAdmin  msgComId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(params.userId && (params.phone == '' || params.phone == null ||  params.phone == "undefined")){
        if(params.userId.length == 24){
            matchObj._user_id = mongoose.mongo.ObjectId(params.userId);
        }else{
            logger.info('getMsgCommentByAdmin  _user_id format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if (params.msgType){
        matchObj.msg_type = Number(params.msgType);
    }
    if (params.level){
        matchObj.level = Number(params.level);
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
                $sort: { "created_at": -1 }
            });
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
        $sort: { "created_at": -1 }
    });
    aggregate_limit.push({
        $group: {
            _id: "$msg_type",
            count:{$sum:1}
        }
    });
    MsgCommentModel.aggregate(aggregate_limit).exec((error,rows)=> {
        if (error) {
            logger.error(' getMsgCommentTodayCountByAdmin getComment ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            if(rows.length >1){
                logger.info(' getMsgCommentTodayCountByAdmin getComment ' + 'success');
                resUtil.resetQueryRes(res, rows);
                return next();
            }else{
                let resObj = [];
                if(rows.length == 0){
                    //添加文章
                    let articleObj = {};
                    articleObj._id = 1;
                    articleObj.count = 0;
                    resObj.push(articleObj);
                    //添加求助
                    let help = {};
                    help._id = 2;
                    help.count = 0;
                    resObj.push(help);
                }else{
                    if(rows[0]._id == 1){
                        //添加求助
                        let help = {};
                        help._id = 2;
                        help.count = 0;
                        resObj.push(rows[0]);
                        resObj.push(help);
                    }else{

                        if(rows[0]._id == 2){
                            //添加文章
                            let articleObj = {};
                            articleObj._id = 1;
                            articleObj.count = 0;
                            resObj.push(articleObj);
                            resObj.push(rows[0]);
                        }else{
                            //添加文章
                            let articleObj = {};
                            articleObj._id = 1;
                            articleObj.count = 0;
                            resObj.push(articleObj);
                            //添加求助
                            let help = {};
                            help._id = 2;
                            help.count = 0;
                            resObj.push(help);
                        }
                    }
                }

                logger.info(' getMsgCommentTodayCountByAdmin getComment ' + 'success');
                resUtil.resetQueryRes(res, resObj);
                return next();
            }
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
    });
}
const deleteCommentByAdmin = (req, res, next) => {
    let path = req.params;
    let query = MsgCommentModel.find({});
    if(path.msgComId){
        if(path.msgComId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.msgComId));
        }else{
            logger.info('deleteCommentByAdmin msgComId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.COMMENT_ID_NULL_ERROR);
            return next();
        }
    }
    MsgCommentModel.deleteOne(query,function(error,result){
        if(error){
            logger.error('deleteCommentByAdmin ' + error.message);
            resUtil.resInternalError(error,res,next);
        }else{
            logger.info('deleteCommentByAdmin ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    });
}
module.exports = {
    getUserMsgComment,
    getUserBeMsgComment,
    getAllMsgComment,
    createMsgComment,
    deleteComment,
    getMsgCommentByAdmin,
    getMsgCommentCountByAdmin,
    getMsgCommentTodayCountByAdmin,
    updateStatusByAdmin,
    deleteCommentByAdmin
};
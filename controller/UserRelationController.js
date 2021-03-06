"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('UserRelationController');

const {UserRelationModel} = require('../modules');
const {UserDetailModel} = require('../modules');
const {InfoModel} = require('../modules');

const getFriend = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let aggregate_limit = [];
    let matchObj = {};
    aggregate_limit.push(
        {
            $lookup: {
                from: "user_infos",
                localField: "_user_id",
                foreignField: "_id",
                as: "follow_login_info"
            }
        },
        {
            $lookup: {
                from: "user_details",
                localField: "_user_id",
                foreignField: "_user_id",
                as: "follow_detail_info"
            }
        },
        {
            $lookup: {
                from: "user_infos",
                localField: "_user_by_id",
                foreignField: "_id",
                as: "attention_login_info"
            }
        },
        {
            $lookup: {
                from: "user_details",
                localField: "_user_by_id",
                foreignField: "_user_id",
                as: "attention_detail_info"
            }
        }
    )
    if(params.followId){
        if(params.followId.length == 24){
            matchObj._user_id = mongoose.mongo.ObjectId(params.followId);
        }else{
            logger.info('getFriend followId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    //被关注用户编号
    if(params.attentionId){
        if(params.attentionId.length == 24){
            matchObj._user_by_id = mongoose.mongo.ObjectId(params.attentionId);
        }else{
            logger.info('getFriend attentionId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    //关注类型
    if(params.type){
        matchObj.type = Number(params.type);
    }
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
            "_user_id": 0,
            "_user_by_id": 0,
            "__v": 0,

            "follow_login_info.password": 0,
            "follow_login_info.auth_time": 0,
            "follow_login_info.last_login_on": 0,
            "follow_login_info.type": 0,
            "follow_login_info.status": 0,
            "follow_login_info.auth_status": 0,
            "follow_login_info.created_at": 0,
            "follow_login_info.updated_at": 0,
            "follow_login_info.__v": 0,
            "follow_login_info._user_detail_id": 0,
            "follow_login_info._user_drive_id": 0,

            "follow_detail_info._id": 0,
            "follow_detail_info.sex": 0,
            "follow_detail_info.city_name": 0,
            "follow_detail_info.avatar": 0,
            "follow_detail_info.intro": 0,
            "follow_detail_info.created_at": 0,
            "follow_detail_info.updated_at": 0,
            "follow_detail_info.__v": 0,
            "follow_detail_info.msg_num": 0,
            "follow_detail_info.msg_help_num": 0,
            "follow_detail_info.follow_num": 0,
            "follow_detail_info.attention_num": 0,
            "follow_detail_info.vote_num": 0,
            "follow_detail_info.msg_coll_num": 0,
            "follow_detail_info.loca_coll_num": 0,
            "follow_detail_info._user_id": 0,
            "follow_detail_info.comment_num": 0,
            "follow_detail_info.comment_reply_num": 0,

            "attention_login_info.password": 0,
            "attention_login_info.auth_time": 0,
            "attention_login_info.last_login_on": 0,
            "attention_login_info.type": 0,
            "attention_login_info.status": 0,
            "attention_login_info.auth_status": 0,
            "attention_login_info.created_at": 0,
            "attention_login_info.updated_at": 0,
            "attention_login_info.__v": 0,
            "attention_login_info._user_detail_id": 0,
            "attention_login_info._user_drive_id": 0,

            "attention_detail_info._id": 0,
            "attention_detail_info.sex": 0,
            "attention_detail_info.city_name": 0,
            "attention_detail_info.avatar": 0,
            "attention_detail_info.intro": 0,
            "attention_detail_info.created_at": 0,
            "attention_detail_info.updated_at": 0,
            "attention_detail_info.__v": 0,
            "attention_detail_info.msg_num": 0,
            "attention_detail_info.msg_help_num": 0,
            "attention_detail_info.follow_num": 0,
            "attention_detail_info.attention_num": 0,
            "attention_detail_info.vote_num": 0,
            "attention_detail_info.msg_coll_num": 0,
            "attention_detail_info.loca_coll_num": 0,
            "attention_detail_info._user_id": 0,
            "attention_detail_info.comment_num": 0,
            "attention_detail_info.comment_reply_num": 0,
        }
    });
    UserRelationModel.aggregate(aggregate_limit).exec((error,rows)=> {
        if (error) {
            logger.error(' getFriend ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getFriend ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}

const getFollow = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = UserRelationModel.find({});
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getFollow userID format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(params.userRelationId){
        if(params.userRelationId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userRelationId));
        }else{
            logger.info('getFollow userRelationId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    //被关注用户编号
    if(params.userById){
        if(params.userById.length == 24){
            query.where('_user_by_id').equals(mongoose.mongo.ObjectId(params.userById));
        }else{
            logger.info('getFollow userById format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getFollow ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getFollow ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getFollowCount = (req, res, next) => {
    let path = req.params;
    let query = UserRelationModel.find({});
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getFollowCount userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    query.countDocuments().exec((error,rows)=> {
        if (error) {
            logger.error(' getFollowCount ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getFollowCount ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getFollowUserInfo = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let aggregate_limit = [];
    let matchObj = {};
    aggregate_limit.push(
        {
            $lookup: {
                from: "user_infos",
                localField: "_user_by_id",
                foreignField: "_id",
                as: "follow_user_login_info"
            }
        },
        {
            $lookup: {
                from: "user_details",
                localField: "_user_by_id",
                foreignField: "_user_id",
                as: "follow_user_detail_info"
            }
        }
    )
    if(path.userId){
        if(path.userId.length == 24){
            matchObj._user_id = mongoose.mongo.ObjectId(path.userId);
        }else{
            logger.info('getFollowUserInfo userId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(params.userRelationId){
        if(params.userRelationId.length == 24){
            matchObj._id = mongoose.mongo.ObjectId(params.userRelationId);
        }else{
            logger.info('getFollowUserInfo userRelationId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    //被关注用户编号
    if(params.userById){
        if(params.userById.length == 24){
            matchObj._user_by_id = mongoose.mongo.ObjectId(params.userById);
        }else{
            logger.info('getFollow userById format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
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
            "follow_user_login_info.password": 0
        }
    });
    UserRelationModel.aggregate(aggregate_limit).exec((error,rows)=> {
        if (error) {
            logger.error(' getFollowUserInfo UserRelationModel ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getFollowUserInfo UserRelationModel ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getAttention = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = UserRelationModel.find({});
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_user_by_id').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getAttention userID format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(params.userRelationId){
        if(params.userRelationId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userRelationId));
        }else{
            logger.info('getAttention userRelationId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
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
            logger.error(' getAttention ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getAttention ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getAttentionCount = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = UserRelationModel.find({});
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_user_by_id').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getAttentionCount userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    query.countDocuments().exec((error,rows)=> {
        if (error) {
            logger.error(' getAttentionCount ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getAttentionCount ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getAttentionUserInfo = (req, res, next) => {
    let path = req.params;
    let params = req.query;

    let aggregate_limit = [];
    let matchObj = {};
    aggregate_limit.push(
        {
            $lookup: {
                from: "user_infos",
                localField: "_user_id",
                foreignField: "_id",
                as: "attention_user_login_info"
            }
        },
        {
            $lookup: {
                from: "user_details",
                localField: "_user_id",
                foreignField: "_user_id",
                as: "attention_user_detail_info"
            }
        }
    )
    if(path.userId){
        if(path.userId.length == 24){
            matchObj._user_by_id = mongoose.mongo.ObjectId(path.userId);
        }else{
            logger.info('getAttentionUserInfo userId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(params.userRelationId){
        if(params.userRelationId.length == 24){
            matchObj._id = mongoose.mongo.ObjectId(params.userRelationId);
        }else{
            logger.info('getAttentionUserInfo userRelationId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
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
            "attention_user_login_info.password": 0
        }
    });
    UserRelationModel.aggregate(aggregate_limit).exec((error,rows)=> {
        if (error) {
            logger.error(' getAttentionUserInfo UserRelationModel ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getAttentionUserInfo UserRelationModel ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createUserRelation = (req, res, next) => {
    let path = req.params;
    let bodyParams = req.body;
    let userRelationObj = bodyParams;
    userRelationObj.type = 0;
    let returnMessage;
    let nick_name;
    //判断是否重复关注
    const getRelInfo =()=>{
        return new Promise((resolve, reject) => {
            let query = UserRelationModel.find({});
            if(path.userId){
                if(path.userId.length == 24){
                    query.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
                }else{
                    logger.info(' createUserRelation getRelInfo userID format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
                    return next();
                }
            }
            if(bodyParams.userById){
                if(bodyParams.userById.length == 24){
                    query.where('_user_by_id').equals(mongoose.mongo.ObjectId(bodyParams.userById));
                }else{
                    logger.info(' createUserRelation getRelInfo userById format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
                    return next();
                }
            }
            query.exec((error,rows)=> {
                if (error) {
                    logger.error(' createUserRelation getRelInfo ' + error.message);
                    reject({err:error.message});
                    resUtil.resInternalError(error,res);
                } else {
                    logger.info(' createUserRelation getRelInfo ' + 'success');
                    if(rows.length == 0){
                        resolve();
                    }else{
                        reject({msg:systemMsg.RELATION_ID_ERROR});
                    }
                }
            });
        })
    }
    //判断是否已关注自己
    const friendJudgement =()=>{
        return new Promise((resolve, reject) => {
            let query = UserRelationModel.find({});
            if(path.userId){
                if(path.userId.length == 24){
                    query.where('_user_by_id').equals(mongoose.mongo.ObjectId(path.userId));
                }else{
                    logger.info(' createUserRelation friendJudgement userID format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
                    return next();
                }
            }
            if(bodyParams.userById){
                if(bodyParams.userById.length == 24){
                    query.where('_user_id').equals(mongoose.mongo.ObjectId(bodyParams.userById));
                }else{
                    logger.info(' createUserRelation friendJudgement userById format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
                    return next();
                }
            }
            query.exec((error,rows)=> {
                if (error) {
                    logger.error(' createUserRelation friendJudgement ' + error.message);
                    reject({err:error.message});
                    resUtil.resInternalError(error,res);
                } else {
                    logger.info(' createUserRelation friendJudgement ' + 'success');
                    resolve(rows);
                }
            });
        })
    }
    //更新关注数
    const updateFollowNum =(relationInfo)=>{
        return new Promise((resolve, reject) => {
            let queryUser = UserDetailModel.find({});
            if(path.userId){
                if(path.userId.length == 24){
                    queryUser.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
                }else{
                    logger.info('createUserRelation updateFollowNum _user_id format incorrect!');
                    return next();
                }
            }
            UserDetailModel.findOneAndUpdate(queryUser,{ $inc: { follow_num: 1 } }).exec((error,rows)=> {
                if (error) {
                    logger.error(' createUserRelation updateFollowNum ' + error.message);
                } else {
                    logger.info(' createUserRelation updateFollowNum ' + 'success');
                    resolve(relationInfo);
                }
            });
        });
    }
    //更新被关注数
    const updateAttentionNum =(relationInfo)=>{
        return new Promise((resolve, reject) => {
            let queryUser = UserDetailModel.find({});
            if(bodyParams.userById){
                if(bodyParams.userById.length == 24){
                    queryUser.where('_user_id').equals(mongoose.mongo.ObjectId(bodyParams.userById));
                }else{
                    logger.info('createUserRelation updateAttentionNum userById format incorrect!');
                    return next();
                }
            }
            UserDetailModel.findOneAndUpdate(queryUser,{ $inc: { attention_num: 1 } }).exec((error,rows)=> {
                if (error) {
                    logger.error(' createUserRelation updateAttentionNum ' + error.message);
                } else {
                    logger.info(' createUserRelation updateAttentionNum ' + 'success');
                    resolve(relationInfo);;
                }
            });
        });
    }
    //查询用户昵称
    const getNickName = (relationInfo) =>{
        return new Promise((resolve, reject) => {
            let queryUserDetail = UserDetailModel.find({},{nick_name:1});
            if(path.userId){
                if(path.userId.length == 24){
                    queryUserDetail.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
                }else{
                    logger.info('createUserRelation getNickName  userID format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
                    return next();
                }
            }
            queryUserDetail.exec((error,rows)=> {
                if (error) {
                    logger.error(' createUserRelation getNickName ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' createUserRelation getNickName ' + 'success');
                    if(rows.length == 0){
                        reject({msg:systemMsg.CUST_ID_NULL_ERROR});
                    }else{
                        nick_name = rows[0]._doc.nick_name;
                        resolve(relationInfo);
                    }
                }
            });
        });
    }
    //添加消息提醒
    const createInfo = (relationInfo) =>{
        return new Promise((resolve, reject)=>{
            let infoObj = bodyParams;
            let content ={};
            if(bodyParams.userById){
                if(bodyParams.userById.length == 24){
                    content._user_id = mongoose.mongo.ObjectId(bodyParams.userById);
                    content.txt = nick_name + " 关注了你";
                }else{
                    logger.info(' createUserRelation userByID format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
                    return next();
                }
            }
            infoObj.type = sysConsts.INFO.type.follow;
            infoObj.status = sysConsts.INFO.status.unread;
            infoObj.content = content;
            let infoModel = new InfoModel(infoObj);
            infoModel.save(function(error,result){
                if (error) {
                    logger.error(' createUserRelation createInfo ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' createUserRelation createInfo ' + 'success');
                    resolve(relationInfo);
                }
            });
        });
    }
    //保存新关注信息
    const saveRelation = (relationInfo) =>{
        return new Promise((resolve, reject) => {
            if(relationInfo.length == 0){
                userRelationObj.type = 0;
            }else{
                userRelationObj.type = 1;
            }
            if(path.userId){
                if(path.userId.length == 24){
                    userRelationObj._user_id = mongoose.mongo.ObjectId(path.userId);
                }else{
                    logger.info(' createUserRelation userID format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
                    return next();
                }
            }
            if(bodyParams.userById){
                if(bodyParams.userById.length == 24){
                    bodyParams._user_by_id = mongoose.mongo.ObjectId(bodyParams.userById);
                }else{
                    logger.info(' createUserRelation userByID format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
                    return next();
                }
            }
            //保存新关注信息
            let userRelationModel = new UserRelationModel(userRelationObj);
            userRelationModel.save(function(error,result){
                if (error) {
                    logger.error(' createUserRelation saveRelation ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' createUserRelation saveRelation ' + 'success');
                    if(relationInfo.length == 0){
                        resUtil.resetCreateRes(res, result);
                        return next();
                    }else{
                        returnMessage = result;
                        resolve(relationInfo);
                    }
                }
            });
        });
    }
    //更新原关注信息
    const updateRelation =(relationInfo)=>{
        return new Promise((resolve, reject) => {
            UserRelationModel.updateOne({_id:relationInfo[0]._doc._id},{type:1},function(error,result){
                if (error) {
                    logger.error(' createUserRelation updateRelation ' + error.message);
                    resUtil.resInternalError(error);
                } else {
                    logger.info(' createUserRelation updateRelation ' + 'success');
                    resUtil.resetCreateRes(res, returnMessage);
                    return next();
                }
            });
        });
    }
    getRelInfo()
        .then(friendJudgement)
        .then(updateFollowNum)
        .then(updateAttentionNum)
        .then(getNickName)
        .then(createInfo)
        .then(saveRelation)
        .then(updateRelation)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resInternalError(reject.err,res,next);
            }else{
                resUtil.resetFailedRes(res,reject.msg) ;
            }
        })
}
const deleteUserRelation = (req, res, next) => {
    let path = req.params;
    let returnMessage;
    //判断是否已关注自己
    const friendJudgement =()=>{
        return new Promise((resolve, reject) => {
            let query = UserRelationModel.find({});
            if(path.userId){
                if(path.userId.length == 24){
                    query.where('_user_by_id').equals(mongoose.mongo.ObjectId(path.userId));
                }else{
                    logger.info(' deleteUserRelation friendJudgement userID format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
                    return next();
                }
            }
            if(path.followUserId){
                if(path.followUserId.length == 24){
                    query.where('_user_id').equals(mongoose.mongo.ObjectId(path.followUserId));
                }else{
                    logger.info(' deleteUserRelation friendJudgement userById format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
                    return next();
                }
            }
            query.exec((error,rows)=> {
                if (error) {
                    logger.error(' deleteUserRelation friendJudgement ' + error.message);
                    reject({err:error.message});
                    resUtil.resInternalError(error,res);
                } else {
                    logger.info(' deleteUserRelation friendJudgement ' + 'success');
                    resolve(rows);
                }
            });
        })
    }
    //删除关注关系
    const delRelation =(relationInfo)=>{
        return new Promise((resolve, reject) => {
            let queryRel = UserRelationModel.find({});
            if(path.userId){
                if(path.userId.length == 24){
                    queryRel.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
                }else{
                    logger.info(' deleteUserRelation delRelation userID format incorrect!');
                    reject({err:error.message});
                }
            }
            if(path.followUserId){
                if(path.followUserId.length == 24){
                    queryRel.where('_user_by_id').equals(mongoose.mongo.ObjectId(path.followUserId));
                }else{
                    logger.info(' deleteUserRelation delRelation followUserId format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.MSG_ID_NULL_ERROR);
                    return next();
                }
            }
            UserRelationModel.deleteOne(queryRel,function(error,result){
                if(error){
                    logger.error(' deleteUserRelation delRelation ' + error.message);
                    reject({err:error.message});
                }else{
                    logger.info(' deleteUserRelation delRelation ' + 'success');
                    if(relationInfo.length == 0){
                        resUtil.resetUpdateRes(res,result,null);
                        return next();
                    }else{
                        resolve(relationInfo);
                        returnMessage = result;
                    }
                }
            });
        });
    }
    //更新好友状态
    const updateRelation =(relationInfo)=>{
        return new Promise(() => {
            UserRelationModel.updateOne({_id:relationInfo[0]._doc._id},{type:0},function(error,result){
                if (error) {
                    logger.error(' deleteUserRelation updateRelation ' + error.message);
                    resUtil.resInternalError(error);
                } else {
                    logger.info(' deleteUserRelation updateRelation ' + 'success');
                    resUtil.resetUpdateRes(res,returnMessage,null);
                    return next();
                }
            });
        });
    }
    friendJudgement()
        .then(delRelation)
        .then(updateRelation)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resInternalError(reject.err,res,next);
            }else{
                resUtil.resetFailedRes(res,reject.msg) ;
            }
        })
}
module.exports = {
    getFriend,
    getFollow,
    getFollowCount,
    getFollowUserInfo,
    getAttention,
    getAttentionCount,
    getAttentionUserInfo,
    createUserRelation,
    deleteUserRelation
};
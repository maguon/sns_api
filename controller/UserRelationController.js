"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const logger = serverLogger.createLogger('UserRelationController');

const {UserRelationModel} = require('../modules');
const {UserDetailModel} = require('../modules');

const getFollow = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = UserRelationModel.find({});
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getFollow userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.userRelationId){
        if(params.userRelationId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userRelationId));
        }else{
            logger.info('getFollow userRelationId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.RELATION_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.read_status){
        query.where('read_status').equals(params.read_status);
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
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
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
                localField: "_userById",
                foreignField: "_id",
                as: "follow_user_login_info"
            }
        },
        {
            $lookup: {
                from: "user_details",
                localField: "_userById",
                foreignField: "_userId",
                as: "follow_user_detail_info"
            }
        }
    )
    if(path.userId){
        if(path.userId.length == 24){
            matchObj._userId = mongoose.mongo.ObjectId(path.userId);
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
            resUtil.resetUpdateRes(res,null,systemMsg.RELATION_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.read_status){
        matchObj.read_status = Number(params.read_status);
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
    let params = req.params;
    let query = UserRelationModel.find({});
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userById').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getAttention userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.userRelationId){
        if(params.userRelationId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userRelationId));
        }else{
            logger.info('getAttention userRelationId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.RELATION_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.type){
        query.where('type').equals(params.type);
    }
    if(params.read_status){
        query.where('read_status').equals(params.read_status);
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
    let params = req.params;
    let query = UserRelationModel.find({});
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userById').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getAttentionCount userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.read_status){
        query.where('read_status').equals(params.read_status);
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
    let params = req.params;

    let aggregate_limit = [];
    let matchObj = {};
    aggregate_limit.push(
        {
            $lookup: {
                from: "user_infos",
                localField: "_userId",
                foreignField: "_id",
                as: "attention_user_login_info"
            }
        },
        {
            $lookup: {
                from: "user_details",
                localField: "_userId",
                foreignField: "_userId",
                as: "attention_user_detail_info"
            }
        }
    )
    if(path.userId){
        if(path.userId.length == 24){
            matchObj._userById = mongoose.mongo.ObjectId(path.userId);
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
            resUtil.resetUpdateRes(res,null,systemMsg.RELATION_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.read_status){
        matchObj.read_status = Number(params.read_status);
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
    //判断是否已关注自己
    const friendJudgement =()=>{
        return new Promise((resolve, reject) => {
            let query = UserRelationModel.find({});
            if(path.userId){
                if(path.userId.length == 24){
                    query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
                }else{
                    logger.info(' createUserRelation friendJudgement userID format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
                    return next();
                }
            }
            if(bodyParams._userById){
                if(bodyParams._userById.length == 24){
                    query.where('_userById').equals(mongoose.mongo.ObjectId(bodyParams._userById));
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
                    queryUser.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
                }else{
                    logger.info('createUserRelation updateFollowNum _userId format incorrect!');
                    return next();
                }
            }
            UserDetailModel.findOneAndUpdate(queryUser,{ $inc: { followNum: 1 } }).exec((error,rows)=> {
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
            if(bodyParams._userById){
                if(bodyParams._userById.length == 24){
                    queryUser.where('_userId').equals(mongoose.mongo.ObjectId(bodyParams._userById));
                }else{
                    logger.info('createUserRelation updateAttentionNum _userById format incorrect!');
                    return next();
                }
            }
            UserDetailModel.findOneAndUpdate(queryUser,{ $inc: { attentionNum: 1 } }).exec((error,rows)=> {
                if (error) {
                    logger.error(' createUserRelation updateAttentionNum ' + error.message);
                } else {
                    logger.info(' createUserRelation updateAttentionNum ' + 'success');
                    resolve(relationInfo);;
                }
            });
        });
    }
    //保存新关注信息
    const saveRelation = (relationInfo) =>{
        return new Promise((resolve, reject) => {
            bodyParams._userById;
            if(relationInfo.length > 0){
                userRelationObj.type = 1;
            }
            if(path.userId){
                if(path.userId.length == 24){
                    userRelationObj._userId = mongoose.mongo.ObjectId(path.userId);
                }else{
                    logger.info(' createUserRelation userID format incorrect!');
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
                    if(relationInfo.length > 0){
                        resolve(relationInfo);
                        returnMessage = result;
                    }else{
                        resUtil.resetCreateRes(res, result);
                        return next();
                    }
                }
            })
        });
    }
    //更新原关注信息
    const updateRelation =(relationInfo)=>{
        return new Promise(() => {
            UserRelationModel.updateOne({_id:relationInfo[0]._doc._id},{type:1},function(error,result){
                if (error) {
                    logger.error(' createUserRelation updateRelation ' + error.message);
                    resUtil.resInternalError(error);
                } else {
                    logger.info(' createUserRelation updateRelation ' + 'success');
                    resUtil.resetCreateRes(res, returnMessage);
                    return next();
                }
            })
        });
    }
    friendJudgement()
        .then(updateFollowNum)
        .then(updateAttentionNum)
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
const updateUserRelationReadStatus = (req, res, next) => {
    let bodyParams = req.body;
    let query = UserRelationModel.find({});
    let params = req.params;
    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userById').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('updateUserRelationReadStatus userById format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.userRelationId) {
        if (params.userRelationId.length == 24) {
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userRelationId));
        } else {
            logger.info('updateUserRelationReadStatus userRelationId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.RELATION_ID_NULL_ERROR);
            return next();
        }
    }
    UserRelationModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateUserRelationReadStatus ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateUserRelationReadStatus ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
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
                    query.where('_userById').equals(mongoose.mongo.ObjectId(path.userId));
                }else{
                    logger.info(' deleteUserRelation friendJudgement userID format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
                    return next();
                }
            }
            if(path.followUserId){
                if(path.followUserId.length == 24){
                    query.where('_userId').equals(mongoose.mongo.ObjectId(path.followUserId));
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
    const delRelation =(relationInfo)=>{
        return new Promise((resolve, reject) => {
            let query = UserRelationModel.find({});
            if(path.userId){
                if(path.userId.length == 24){
                    query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
                }else{
                    logger.info(' deleteUserRelation delRelation userID format incorrect!');
                    reject({err:error.message});
                }
            }
            if(path.followUserId){
                if(path.followUserId.length == 24){
                    query.where('_userById').equals(mongoose.mongo.ObjectId(path.followUserId));
                }else{
                    logger.info(' deleteUserRelation delRelation followUserId format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_ID_NULL_ERROR);
                    return next();
                }
            }
            UserRelationModel.deleteOne(query,function(error,result){
                if(error){
                    logger.error(' deleteUserRelation delRelation ' + error.message);
                    reject({err:error.message});
                }else{
                    logger.info(' deleteUserRelation delRelation ' + 'success');
                    if(relationInfo.length > 0){
                        resolve(relationInfo);
                        returnMessage = result;
                    }else{
                        resUtil.resetUpdateRes(res,result,null);
                        return next();
                    }
                }
            })
        });
    }
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
            })
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
    getFollow,
    getFollowCount,
    getFollowUserInfo,
    getAttention,
    getAttentionCount,
    getAttentionUserInfo,
    createUserRelation,
    updateUserRelationReadStatus,
    deleteUserRelation
};
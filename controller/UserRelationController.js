"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const logger = serverLogger.createLogger('UserRelationController');

const {UserRelationModel} = require('../modules');

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
    query.count().exec((error,rows)=> {
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
    let query = UserRelationModel.find({});
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getFollowUserInfo userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.userRelationId){
        if(params.userRelationId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userRelationId));
        }else{
            logger.info('getFollowUserInfo userRelationId format incorrect!');
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
    query.populate({path:'_userId'}).exec((error,rows)=> {
        if (error) {
            logger.error(' getFollowUserInfo ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getFollowUserInfo ' + 'success');
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
    query.count().exec((error,rows)=> {
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
    let query = UserRelationModel.find({});
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userById').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getAttentionUserInfo userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.userRelationId){
        if(params.userRelationId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userRelationId));
        }else{
            logger.info('getAttentionUserInfo userRelationId format incorrect!');
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
    query.populate({path:'_userById'}).exec((error,rows)=> {
        if (error) {
            logger.error(' getAttentionUserInfo ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getAttentionUserInfo ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createUserRelation = (req, res, next) => {
    let path = req.params;
    let params = req.params;
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
                    query.where('_userById').equals(mongoose.mongo.ObjectId(path.userId));
                }else{
                    logger.info(' createUserRelation friendJudgement userID format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
                    return next();
                }
            }
            if(bodyParams._userById){
                if(bodyParams._userById.length == 24){
                    query.where('_userId').equals(mongoose.mongo.ObjectId(bodyParams._userById));
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
    const saveRelation = (relationInfo) =>{
        return new Promise((resolve, reject) => {
            bodyParams._userById;
            if(relationInfo.length > 0){
                userRelationObj.type = 1;
            }
            if(params.userId){
                if(params.userId.length == 24){
                    userRelationObj._userId = mongoose.mongo.ObjectId(params.userId);
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
module.exports = {
    getFollow,
    getFollowCount,
    getFollowUserInfo,
    getAttention,
    getAttentionCount,
    getAttentionUserInfo,
    createUserRelation,
    updateUserRelationReadStatus
};
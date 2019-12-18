"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('UserMessageCollectionsController');

const {UserMessageCollectionsModel} = require('../modules');
const {UserDetailModel} = require('../modules');

const getUserMessageCollections = (req, res, next) => {
    let params = req.query;
    let path = req.params;
    let query = UserMessageCollectionsModel.find({status:sysConsts.INFO.status.available});
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getUserMessageCollections  userId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.userMessageCollectionsId){
        if(params.userMessageCollectionsId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userMessageCollectionsId));
        }else{
            logger.info('getUserMessageCollections  userMessageCollectionsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MESSAGE_COLLECTIONS_ID_NULL);
            return next();
        }
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getUserMessageCollections ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getUserMessageCollections ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createUserMessageCollections = (req, res, next) => {
    let path = req.params;
    let bodyParams = req.body;
    let userMessageCollectionsObj = bodyParams;
    const saveCollections =()=>{
        return new Promise((resolve, reject) => {
            if(path.userId){
                if(path.userId.length == 24){
                    userMessageCollectionsObj._userId = mongoose.mongo.ObjectId(path.userId);
                }else{
                    logger.info('createUserMessageCollections  userID format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
                    return next();
                }
            }
            let userMessageCollectionsModel = new UserMessageCollectionsModel(userMessageCollectionsObj);
            userMessageCollectionsModel.save(function(error,result){
                if (error) {
                    logger.error(' createUserMessageCollections ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' createUserMessageCollections ' + 'success');
                    resolve(result);
                }
            })
        });
    }
    //更新用户投票数
    const updateCollectionNum =(result)=>{
        return new Promise(() => {
            let queryUser = UserDetailModel.find({});
            if(path.userId){
                if(path.userId.length == 24){
                    queryUser.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
                }else{
                    logger.info('createUserMessageCollections updateCollectionNum _userId format incorrect!');
                    return next();
                }
            }
            //文章收藏数加一
            UserDetailModel.findOneAndUpdate(queryUser,{ $inc: { messageCollectionNum: 1 } }).exec((error,rows)=> {
                if (error) {
                    logger.error(' createUserMessageCollections updateCollectionNum ' + error.message);
                } else {
                    logger.info(' createUserMessageCollections updateCollectionNum ' + 'success');
                    resUtil.resetCreateRes(res, result);
                    return next();
                }
            });
        });
    }
    saveCollections()
        .then(updateCollectionNum)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }
        })
}
module.exports = {
    getUserMessageCollections,
    createUserMessageCollections
};
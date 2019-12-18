"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('UserLocationCollectionsController');

const {UserLocationCollectionsModel} = require('../modules');
const {UserDetailModel} = require('../modules');

const getUserLocationCollections = (req, res, next) => {
    let params = req.query;
    let path = req.params;
    let query = UserLocationCollectionsModel.find({status:sysConsts.INFO.status.available});
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getUserLocationCollections  userId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.userLocationCollectionsId){
        if(params.userLocationCollectionsId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userLocationCollectionsId));
        }else{
            logger.info('getUserLocationCollections  userLocationCollectionsId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.ADDRESS_COLLECTIONS_ID_NULL);
            return next();
        }
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getUserLocationCollections ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getUserLocationCollections ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createUserLocationCollections = (req, res, next) => {
    let path = req.params;
    let bodyParams = req.body;
    let userLocationCollectionsObj = bodyParams;
    const saveCollections =()=>{
        return new Promise((resolve, reject) => {
            if(path.userId){
                if(path.userId.length == 24){
                    userLocationCollectionsObj._userId = mongoose.mongo.ObjectId(path.userId);
                }else{
                    logger.info('createUserLocationCollections  userID format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
                    return next();
                }
            }
            let userLocationCollectionsModel = new UserLocationCollectionsModel(userLocationCollectionsObj);
            userLocationCollectionsModel.save(function(error,result){
                if (error) {
                    logger.error(' createUserLocationCollections ' + error.message);
                    reject({err:reject.err});
                } else {
                    logger.info(' createUserLocationCollections ' + 'success');
                    resolve(result);
                }
            })
        });
    }
    //更新用户地理位置收藏数
    const updateCollectionNum =(result)=>{
        return new Promise(() => {
            let queryUser = UserDetailModel.find({});
            if(path.userId){
                if(path.userId.length == 24){
                    queryUser.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
                }else{
                    logger.info('createUserLocationCollections updateCollectionNum _userId format incorrect!');
                    return next();
                }
            }
            //投票数数加一
            UserDetailModel.findOneAndUpdate(queryUser,{ $inc: { locationCollectionNum: 1 } }).exec((error,rows)=> {
                if (error) {
                    logger.error(' createUserLocationCollections updateCollectionNum ' + error.message);
                } else {
                    logger.info(' createUserLocationCollections updateCollectionNum ' + 'success');
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
    getUserLocationCollections,
    createUserLocationCollections
};
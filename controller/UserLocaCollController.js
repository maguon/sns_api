"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const logger = serverLogger.createLogger('UserLocaCollController');

const {UserLocaCollModel} = require('../modules');
const {UserDetailModel} = require('../modules');

const getUserLocaColl = (req, res, next) => {
    let params = req.query;
    let path = req.params;
    let query = UserLocaCollModel.find({});
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getUserLocaColl  userId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(params.userLocaCollId){
        if(params.userLocaCollId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userLocaCollId));
        }else{
            logger.info('getUserLocaColl  userLocaCollId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getUserLocaColl ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getUserLocaColl ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createUserLocaColl = (req, res, next) => {
    let path = req.params;
    let bodyParams = req.body;
    let userLocaCollObj = bodyParams;
    const saveCollections =()=>{
        return new Promise((resolve, reject) => {
            if(path.userId){
                if(path.userId.length == 24){
                    userLocaCollObj._user_id = mongoose.mongo.ObjectId(path.userId);
                }else{
                    logger.info('createUserLocaColl  userID format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
                    return next();
                }
            }
            if(bodyParams.addressName){
                userLocaCollObj.address_name = bodyParams.addressName;
            }
            if(bodyParams.addressReal){
                userLocaCollObj.address_real = bodyParams.addressReal;
            }
            let userLocaCollModel = new UserLocaCollModel(userLocaCollObj);
            userLocaCollModel.save(function(error,result){
                if (error) {
                    logger.error(' createUserLocaColl ' + error.message);
                    reject({err:reject.err});
                } else {
                    logger.info(' createUserLocaColl ' + 'success');
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
                    queryUser.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
                }else{
                    logger.info('createUserLocaColl updateCollectionNum _user_id format incorrect!');
                    return next();
                }
            }
            //投票数数加一
            UserDetailModel.findOneAndUpdate(queryUser,{ $inc: { loca_coll_num: 1 } }).exec((error,rows)=> {
                if (error) {
                    logger.error(' createUserLocaColl updateCollectionNum ' + error.message);
                } else {
                    logger.info(' createUserLocaColl updateCollectionNum ' + 'success');
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
const deleteLocaColl = (req, res, next) => {
    let path = req.params;
    let query = UserLocaCollModel.find({});
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('deleteLocaColl userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.userLocaCollId ){
        if(path.userLocaCollId .length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.userLocaCollId ));
        }else{
            logger.info('deleteLocaColl userMsgCollId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.LOCA_COLL_ID_NULL);
            return next();
        }
    }
    UserLocaCollModel.deleteOne(query,function(error,result){
        if(error){
            logger.error('deleteLocaColl ' + error.message);
            resUtil.resInternalError(error,res,next);
        }else{
            logger.info('deleteLocaColls ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
    module.exports = {
    getUserLocaColl,
    createUserLocaColl,
    deleteLocaColl
};
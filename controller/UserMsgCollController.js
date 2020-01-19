"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const logger = serverLogger.createLogger('UserMsgCollController');

const {UserMsgCollModel} = require('../modules');
const {UserDetailModel} = require('../modules');

const getUserMsgColl = (req, res, next) => {
    let params = req.query;
    let path = req.params;
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
                from: "user_details",
                localField: "_msg_user_id",
                foreignField: "_user_id",
                as: "msg_user_detail_info"
            }
        }
    );
    if(path.userId){
        if(path.userId.length == 24){
            matchObj._user_id = mongoose.mongo.ObjectId(path.userId);
        }else{
            logger.info('getUserMsgColl  userId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(params.userMsgCollId){
        if(params.userMsgCollId.length == 24){
            matchObj._id = mongoose.mongo.ObjectId(params.userMsgCollId);
        }else{
            logger.info('getUserMsgColl  userMsgCollId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
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
    UserMsgCollModel.aggregate(aggregate_limit).exec((error,rows)=> {
        if (error) {
            logger.error(' getUserMsgColl ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getUserMsgColl ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createUserMsgColl = (req, res, next) => {
    let path = req.params;
    let bodyParams = req.body;
    let userMsgCollObj = bodyParams;
    const saveCollections =()=>{
        return new Promise((resolve, reject) => {
            if(path.userId){
                if(path.userId.length == 24){
                    userMsgCollObj._user_id = mongoose.mongo.ObjectId(path.userId);
                }else{
                    logger.info('createUserMsgColl  userID format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
                    return next();
                }
            }
            if(bodyParams.msgId){
                userMsgCollObj._msg_id = bodyParams.msgId;
            }
            if(bodyParams.msgUserId){
                userMsgCollObj._msg_user_id = bodyParams.msgUserId;
            }
            let userMsgCollModel = new UserMsgCollModel(userMsgCollObj);
            userMsgCollModel.save(function(error,result){
                if (error) {
                    logger.error(' createUserMsgColl ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' createUserMsgColl ' + 'success');
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
                    queryUser.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
                }else{
                    logger.info('createUserMsgColl updateCollectionNum _user_id format incorrect!');
                    return next();
                }
            }
            //文章收藏数加一
            UserDetailModel.findOneAndUpdate(queryUser,{ $inc: { msg_coll_num: 1 } }).exec((error,rows)=> {
                if (error) {
                    logger.error(' createUserMsgColl updateCollectionNum ' + error.message);
                } else {
                    logger.info(' createUserMsgColl updateCollectionNum ' + 'success');
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
const deleteMsgColl = (req, res, next) => {
    let path = req.params;
    let query = UserMsgCollModel.find({});
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('deleteMsgColl userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.userMsgCollId){
        if(path.userMsgCollId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.userMsgCollId));
        }else{
            logger.info('deleteMsgColl userMsgCollId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.LOCA_COLL_ID_NULL);
            return next();
        }
    }
    UserMsgCollModel.deleteOne(query,function(error,result){
        if(error){
            logger.error('deleteMsgColl ' + error.message);
            resUtil.resInternalError(error,res,next);
        }else{
            logger.info('deleteMsgColl ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
module.exports = {
    getUserMsgColl,
    createUserMsgColl,
    deleteMsgColl
};
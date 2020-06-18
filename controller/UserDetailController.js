"use strict"
const mongoose = require('mongoose');
const systemMsg = require('../util/SystemMsg');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const logger = serverLogger.createLogger('UserDetailController');

const {UserDetailModel} = require('../modules');
const {UserRelationModel} = require('../modules');

const getUserDetail = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let query = UserDetailModel.find({});
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getUserDetail  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.userDetailId){
        if(params.userDetailId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.userDetailId));
        }else{
            logger.info('getUserDetail  userDetailID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.USER_DETAIL_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.sex){
        query.where('sex').equals(params.sex);
    }
    if(params.nickName){
        query.where('nick_name').equals({"$regex" : params.nickName,"$options":"$ig"});
    }
    if(params.realName){
        query.where('real_name').equals({"$regex" : params.realName,"$options":"$ig"});
    }
    if(params.cityName){
        query.where('city_name').equals({"$regex" : params.cityName,"$options":"$ig"});
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getUserDetail ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getUserDetail ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const updateUserDetailInfo = (req, res, next) => {
    let bodyParams = req.body;
    let query = UserDetailModel.find({});
    let path = req.params;
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('updateUserDetailInfo  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.userDetailId){
        if(path.userDetailId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.userDetailId));
        }else{
            logger.info('updateUserDetailInfo  userDetailID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.USER_ID_NULL_ERROR);
            return next();
        }
    }
    if(bodyParams.nickName){
        bodyParams.nick_name = bodyParams.nickName;
    }
    if(bodyParams.realName){
        bodyParams.real_name = bodyParams.realName;
    }
    if(bodyParams.cityName){
        bodyParams.city_name = bodyParams.cityName;
    }
    UserDetailModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateUserDetailInfo ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateUserDetailInfo ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    });
}
const updateAvatarImage = (req, res, next) => {
    let bodyParams = req.body;
    let query = UserDetailModel.find({});
    let path = req.params;
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('updateAvatarImage  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    UserDetailModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateAvatarImage ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateAvatarImage ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    });
}
const createBlockList = (req, res, next) => {
    let path = req.params;
    let returnMsg = {};

    //加入黑名单
    const createBlockUser = () =>{
        return new Promise((resolve, reject) => {
            let queryDetail = UserDetailModel.find({});
            let blockUser = {};
            if(path.userId){
                if(path.userId.length == 24){
                    queryDetail.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
                }else{
                    logger.info('createBlockList createBlockUser userID format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
                    return next();
                }
            }
            if(path.blockUserId){
                if(path.blockUserId.length == 24){
                    blockUser = mongoose.mongo.ObjectId(path.blockUserId);
                }else{
                    logger.info('createBlockList createBlockUser userID format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
                    return next();
                }
            }

            UserDetailModel.updateOne(queryDetail,{ $addToSet : { block_list : blockUser}},function(error,result){
                    if (error) {
                        logger.error(' createBlockList createBlockUser ' + error.message);
                        reject({err:error});
                    } else {
                        logger.info(' createBlockList createBlockUser ' + 'success');
                        returnMsg = result;
                        resolve();
                    }
                }
            );
        });
    }
    //查询是否关注
    const getRelation = () =>{
        return new Promise((resolve, reject) => {
            let queryRelation = UserRelationModel.find({});
            if(path.userId){
                if(path.userId.length == 24){
                    queryRelation.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
                }else{
                    logger.info('createBlockList createBlockUser userID format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
                    return next();
                }
            }
            if(path.blockUserId){
                if(path.blockUserId.length == 24){
                    queryRelation.where('_user_by_id').equals(mongoose.mongo.ObjectId(path.blockUserId));
                }else{
                    logger.info('createBlockList createBlockUser blockUserId format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
                    return next();
                }
            }
            queryRelation.exec((error,rows)=> {
                if (error) {
                    logger.error(' createBlockList getRelation ' + error.message);
                    reject({err:error.message});
                    resUtil.resInternalError(error,res);
                } else {
                    logger.info(' createBlockList getRelation ' + 'success');
                    resolve(rows);
                }
            });

        });
    }
    //删除关注信息
    const delRelation = (relationList) =>{
        return new Promise((resolve, reject) => {
            let updateFlag = 0;
            if(relationList[0].type == 1){
                updateFlag = 1;
            }
            UserRelationModel.deleteOne({_id:relationList[0]._id},function(error,result){
                if (error) {
                    logger.error(' createBlockList delRelation ' + error.message);
                    reject({err:error.message});
                    resUtil.resInternalError(error,res);
                } else {
                    logger.info(' createBlockList delRelation ' + 'success');
                    if(updateFlag == 1){
                        updateRelation();
                    }else{
                        logger.info(' createBlockList delRelation relationList null!');
                        resUtil.resetUpdateRes(res, returnMsg);
                        return next();
                    }
                }
            });

        });
    }
    //更新互相关注信息
    const updateRelation = () =>{
        return new Promise((resolve, reject) => {
            let updateRelation = UserRelationModel.find({});
            if(path.userId){
                if(path.userId.length == 24){
                    updateRelation.where('_user_by_id').equals(mongoose.mongo.ObjectId(path.userId));
                }else{
                    logger.info('createBlockList updateRelation userID format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
                    return next();
                }
            }
            if(path.blockUserId){
                if(path.blockUserId.length == 24){
                    updateRelation.where('_user_id').equals(mongoose.mongo.ObjectId(path.blockUserId));
                }else{
                    logger.info('createBlockList updateRelation blockUserId format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
                    return next();
                }
            }
            UserRelationModel.updateOne(updateRelation,{type:0},function(error,result){
                if (error) {
                    logger.error(' createBlockList updateRelation ' + error.message);
                    reject({err:error});
                    resUtil.resInternalError(error,res);
                } else {
                    logger.info(' createBlockList updateRelation ' + 'success');
                    resUtil.resetUpdateRes(res, returnMsg);
                    return next();
                }
            });


        });
    }

    createBlockUser()
        .then(getRelation)
        .then((relationList)=>{
            if(relationList.length == 0){
                logger.info(' createBlockList relationList null!');
                resUtil.resetUpdateRes(res, returnMsg);
                return next();
            }else{
                delRelation(relationList);
            }
        })
        .catch((reject)=>{
            if(reject.err){
                resUtil.resInternalError(reject.err,res,next);
            }else{
                resUtil.resetFailedRes(res,reject.msg) ;
            }
        })
}
const getBlockList = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let aggregate_limit = [];
    let matchObj = {};
    aggregate_limit.push({
        $lookup: {
            "from": "user_details",
            "let": { "block_list": "$block_list" },
            "pipeline": [
                { "$match": { "$expr": { "$in": [ "$_user_id", "$$block_list" ] } } }
            ],
            "as": "block_user_list"
        }
    });

    if(path.userId){
        if(path.userId.length == 24){
            matchObj._user_id = mongoose.mongo.ObjectId(path.userId);
        }else{
            logger.info('getBlockList userId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(!(params.start && params.size)){
        aggregate_limit.push({
            $project: {
                "_id": 0,
                "sex": 0,
                "nick_name": 0,
                "real_name": 0,
                "city_name": 0,
                "intro": 0,
                "avatar": 0,
                "msg_num": 0,
                "msg_help_num": 0,
                "follow_num": 0,
                "attention_num": 0,
                "comment_num": 0,
                "comment_reply_num": 0,
                "vote_num": 0,
                "msg_coll_num": 0,
                "loca_coll_num": 0,
                "created_at": 0,
                "updated_at": 0,
                "__v": 0,
                "block_list": 0,
            }
        })
    }
    aggregate_limit.push({
        $project: {
            "block_user_list._id": 0,
            "block_user_list.sex": 0,
            "block_user_list.city_name": 0,
            "block_user_list.intro": 0,
            "block_user_list.msg_num": 0,
            "block_user_list.msg_help_num": 0,
            "block_user_list.follow_num": 0,
            "block_user_list.attention_num": 0,
            "block_user_list.comment_num": 0,
            "block_user_list.comment_reply_num": 0,
            "block_user_list.vote_num": 0,
            "block_user_list.msg_coll_num": 0,
            "block_user_list.loca_coll_num": 0,
            "block_user_list.created_at": 0,
            "block_user_list.updated_at": 0,
            "block_user_list.__v": 0,
            "block_user_list.block_list": 0,
        }
    })
    aggregate_limit.push({
        $match: matchObj
    });
    if (params.start && params.size) {
        aggregate_limit.push({
            $project: {
                block_user_list: { $slice: [ "$block_user_list",Number(params.start), Number(params.size)] },
            }
        })
    };

    UserDetailModel.aggregate(aggregate_limit).exec((error,rows)=> {
        if (error) {
            logger.error(' getBlockList ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getBlockList ' + 'success');
            resUtil.resetQueryRes(res, rows);
            // resUtil.resetQueryRes(res, rows[0].block_user_list);
        }
    });
}
const delBlockList = (req, res, next) => {
    let query = UserDetailModel.find({});
    let path = req.params;
    let blockUser = {};
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('delBlockList  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.blockUserId){
        if(path.blockUserId.length == 24){
            blockUser = mongoose.mongo.ObjectId(path.blockUserId);
        }else{
            logger.info('delBlockList  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }

    UserDetailModel.updateOne(query,{ $pull : { block_list : blockUser}},function(error,result){
            if (error) {
                logger.error(' delBlockList ' + error.message);
                resUtil.resInternalError(error);
            } else {
                logger.info(' delBlockList ' + 'success');
                resUtil.resetUpdateRes(res,result,null);
                return next();
            }
        }
    );
}
const getBlockListByAdmin = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let aggregate_limit = [];
    let matchObj = {};
    aggregate_limit.push({
        $lookup: {
            "from": "user_details",
            "let": { "block_list": "$block_list" },
            "pipeline": [
                { "$match": { "$expr": { "$in": [ "$_user_id", "$$block_list" ] } } }
            ],
            "as": "block_user_list"
        }
    });

    if(path.userId){
        if(params.userId.length == 24){
            matchObj._user_id = mongoose.mongo.ObjectId(path.userId);
        }else{
            logger.info('getBlockListByAdmin userId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(!(params.start && params.size)){
        aggregate_limit.push({
            $project: {
                "_id": 0,
                "sex": 0,
                "nick_name": 0,
                "real_name": 0,
                "city_name": 0,
                "intro": 0,
                "avatar": 0,
                "msg_num": 0,
                "msg_help_num": 0,
                "follow_num": 0,
                "attention_num": 0,
                "comment_num": 0,
                "comment_reply_num": 0,
                "vote_num": 0,
                "msg_coll_num": 0,
                "loca_coll_num": 0,
                "created_at": 0,
                "updated_at": 0,
                "__v": 0,
                "block_list": 0,
            }
        })
    }
    aggregate_limit.push({
        $project: {
            "block_user_list._id": 0,
            "block_user_list.sex": 0,
            "block_user_list.city_name": 0,
            "block_user_list.intro": 0,
            "block_user_list.msg_num": 0,
            "block_user_list.msg_help_num": 0,
            "block_user_list.follow_num": 0,
            "block_user_list.attention_num": 0,
            "block_user_list.comment_num": 0,
            "block_user_list.comment_reply_num": 0,
            "block_user_list.vote_num": 0,
            "block_user_list.msg_coll_num": 0,
            "block_user_list.loca_coll_num": 0,
            "block_user_list.created_at": 0,
            "block_user_list.updated_at": 0,
            "block_user_list.__v": 0,
            "block_user_list.block_list": 0,
        }
    })
    aggregate_limit.push({
        $match: matchObj
    });
    if (params.start && params.size) {
        aggregate_limit.push({
            $project: {
                block_user_list: { $slice: [ "$block_user_list",Number(params.start), Number(params.size)] },
            }
        })
    };
    UserDetailModel.aggregate(aggregate_limit).exec((error,rows)=> {
        if (error) {
            logger.error(' getBlockListByAdmin ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getBlockListByAdmin ' + 'success');
            resUtil.resetQueryRes(res, rows[0].block_user_list);
        }
    });
}

module.exports = {
    getUserDetail,
    updateUserDetailInfo,
    updateAvatarImage,
    createBlockList,
    getBlockList,
    delBlockList,
    getBlockListByAdmin
};
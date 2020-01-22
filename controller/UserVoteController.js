"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const logger = serverLogger.createLogger('UserVoteController');

const {UserVoteModel} = require('../modules');
const {UserDetailModel} = require('../modules');
const {VoteModel} = require('../modules');

const getUserVote = (req, res, next) => {
    let path = req.params;
    let params = req.query;
    let aggregate_limit = [];
    let matchObj = {};
    aggregate_limit.push({
        $lookup: {
            from: "vote_infos",
            localField: "voteId",
            foreignField: "_id",
            as: "vote_info"
        }
    });
    if (path.userId) {
        if (path.userId.length == 24) {
            matchObj._user_id = mongoose.mongo.ObjectId(path.userId);
        } else {
            logger.info('getUserVote userID format incorrect!');
            resUtil.resetQueryRes(res, [], null);
            return next();
        }
    }
    if(params.voteId){
        if(params.voteId.length == 24){
            matchObj._vote_id = mongoose.mongo.ObjectId(params.voteId);
        }else{
            logger.info('getUserVote  voteId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.VOTE_ID_NULL_ERROR);
            return next();
        }
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
    UserVoteModel.aggregate(aggregate_limit).exec((error,rows)=> {
        if (error) {
            logger.error(' getUserVote ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getUserVote ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getUserVoteByAdmin = (req, res, next) => {
    let params = req.query;
    const getUserVoteId =()=>{
        return new Promise((resolve, reject) => {
            let aggregate_limit = [];
            let matchObj = {};
            aggregate_limit.push({
                $lookup: {
                    from: "user_details",
                    localField: "_user_id",
                    foreignField: "_user_id",
                    as: "user_detail_info"
                }
            },{
                $lookup: {
                    from: "user_infos",
                    localField: "_user_id",
                    foreignField: "_id",
                    as: "user_login_info"
                }
            });

            if(params.userId){
                if(params.userId.length == 24){
                    matchObj._user_id = mongoose.mongo.ObjectId(params.userId);
                }else{
                    logger.info('getUserVoteByAdmin  getUserVoteId userID format incorrect!');
                    resUtil.resetQueryRes(res,[],null);
                    return next();
                }
            }
            if(params.voteId){
                if(params.voteId.length == 24){
                    matchObj._vote_id = mongoose.mongo.ObjectId(params.voteId);
                }else{
                    logger.info('getUserVoteByAdmin  getUserVoteId voteId format incorrect!');
                    resUtil.resetQueryRes(res,[],null);
                    return next();
                }
            }
            if(params.phone){
                matchObj['user_login_info.phone']  = params.phone;
            }
            let queryIndex =[];
            if(params.optionIndex){
                var result = params.optionIndex.split(",");
                for(var i=0;i<result.length;i++){
                    queryIndex[i] = Number(result[i]);
                }
                matchObj["option_item.index"] = { "$in" : queryIndex};
            }
            aggregate_limit.push({
                $match: matchObj
            });
            aggregate_limit.push({
                $project: {
                    "user_login_info.password": 0
                }
            });
            aggregate_limit.push({
                $group:{
                    _id: "$_id"
                }
            });
            UserVoteModel.aggregate(aggregate_limit).exec((error,rows)=> {
                if (error) {
                    logger.error(' getUserVoteByAdmin getUserVoteId ' + error.message);
                    resUtil.resInternalError(error,res);
                } else {
                    logger.info(' getUserVoteByAdmin getUserVoteId ' + 'success');
                    if(rows.length>0){
                        resolve(rows);
                    }else{
                        resUtil.resetQueryRes(res, []);
                        return next();
                    }
                }
            });
        });
    }
    const getUserVoteInfo =(userVoteIds)=>{
        return new Promise(()=>{
            let aggregate_limit_info = [];
            let matchObjInfo = {};
            aggregate_limit_info.push({
                $lookup: {
                    from: "user_details",
                    localField: "_user_id",
                    foreignField: "_user_id",
                    as: "user_detail_info"
                }
            },{
                $lookup: {
                    from: "user_infos",
                    localField: "_user_id",
                    foreignField: "_id",
                    as: "user_login_info"
                }
            });
            let queryId =[];
            for(let i=0; i < userVoteIds.length; i++ ){
                queryId[i] = mongoose.mongo.ObjectId(userVoteIds[i]._id);
            }
            if(userVoteIds.length > 0){
                matchObjInfo._id = {$in : queryId};
            }
            aggregate_limit_info.push({
                $sort: { "created_at": -1 }
            });
            aggregate_limit_info.push({
                $match: matchObjInfo
            });
            aggregate_limit_info.push({
                $project: {
                    "user_login_info.password": 0
                }
            });
            if (params.start && params.size) {
                aggregate_limit_info.push(
                    {
                        $skip : Number(params.start)
                    },{
                        $limit : Number(params.size)
                    }
                );
            };
            UserVoteModel.aggregate(aggregate_limit_info).exec((error,rows)=> {
                if (error) {
                    logger.error(' getUserVoteByAdmin getUserVoteId ' + error.message);
                    resUtil.resInternalError(error,res);
                } else {
                    logger.info(' getUserVoteByAdmin getUserVoteId ' + 'success');
                    resUtil.resetQueryRes(res, rows);
                    return next();
                }
            });
        });
    }
    getUserVoteId()
        .then(getUserVoteInfo)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }else{
                resUtil.resetFailedRes(res,reject.msg);
            }
        })

}
const createUserVote = (req, res, next) => {
    let path = req.params;
    let bodyParams = req.body;
    let userVoteObj = bodyParams;
    let returnMsg;
    //判断用户是否已经投票
    const getUserVoteInfo =()=>{
        return new Promise((resolve, reject) => {
            let queryUserVote = UserVoteModel.find({});
            if(path.userId){
                if(path.userId.length == 24){
                    queryUserVote.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
                }else{
                    logger.info(' createUserVote getUserVoteInfo  userID format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
                    return next();
                }
            }
            if(bodyParams.voteId){
                if(bodyParams.voteId.length == 24){
                    queryUserVote.where('_vote_id').equals(mongoose.mongo.ObjectId(bodyParams.voteId));
                }else{
                    logger.info(' createUserVote getUserVoteInfo  voteId format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.VOTE_ID_NULL_ERROR);
                    return next();
                }
            }
            queryUserVote.exec((error,rows)=> {
                if (error) {
                    logger.error(' createUserVote getUserVoteInfo ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' createUserVote getUserVoteInfo ' + 'success');
                    if(rows.length > 0){
                        reject({msg:systemMsg.USER_VOTE_CREATE_ERROR});
                    }else{
                        resolve();
                    }
                }
            });
        });
    }
    //保存用户投票信息
    const saveUserVote =()=>{
        return new Promise((resolve, reject) => {
            if(path.userId){
                if(path.userId.length == 24){
                    userVoteObj._user_id = mongoose.mongo.ObjectId(path.userId);
                }else{
                    logger.info('createUserVote saveUserVote userID format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
                    return next();
                }
            }
            if(bodyParams.voteId){
                userVoteObj._vote_id = bodyParams.voteId;
            }
            if(bodyParams.optionItem){
                userVoteObj.option_item = bodyParams.optionItem;
            }
            let userVoteModel = new UserVoteModel(userVoteObj);
            userVoteModel.save(function(error,result){
                if (error) {
                    logger.error(' createUserVote saveUserVote ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' createUserVote saveUserVote ' + 'success');
                    returnMsg = result;
                    resolve();
                }
            });
        });
    }
    //查询投票信息
    const getVoteInfo =()=>{
        return new Promise((resolve, reject) => {
            let queryVote = VoteModel.find({});
            if(bodyParams.voteId){
                if(path.userId.length == 24){
                    queryVote.where('_id').equals(mongoose.mongo.ObjectId(bodyParams.voteId));
                }else{
                    logger.info('createUserVote getVoteInfo _user_id format incorrect!');
                    return next();
                }
            }
            queryVote.exec((error,rows)=> {
                if (error) {
                    logger.error(' createUserVote getVoteInfo ' + error.message);
                    resUtil.resInternalError(error, res);
                } else {
                    logger.info(' createUserVote getVoteInfo ' + 'success');
                    if(rows.length > 0 ){
                        resolve(rows[0]._doc);
                    }
                }
            });
        });
    }
    //更新选项投票数
    const updateOptionVoteNum =(voteInfo)=>{
        return new Promise((resolve, reject) => {

            let optionArray = bodyParams.optionItem;
            for (let i = 0; i < optionArray.length; i++) {

                for (let index = 0; index < voteInfo.option.length; index++) {
                    if (index == optionArray[i].index) {
                        //更新选项投票数
                        voteInfo.option[index].num = voteInfo.option[index].num + 1;
                        VoteModel.updateOne({"option.txt" : optionArray[i].txt},{$set:{"option.$.num":voteInfo.option[index].num}}).exec((error,result)=> {
                            if (error) {
                                logger.error(' createUserVote updateOptionVoteNum ' + error.message);
                            } else {
                                logger.info(' createUserVote updateOptionVoteNums ' + 'success');
                            }
                        });
                    }
                }

            }
            resolve();
        });
    }
    //更新投票信息中的总参与人数
    const updateVoteNum =()=>{
        return new Promise((resolve, reject) => {
            let queryVote = VoteModel.find({});
            if(bodyParams.voteId){
                if(path.userId.length == 24){
                    queryVote.where('_id').equals(mongoose.mongo.ObjectId(bodyParams.voteId));
                }else{
                    logger.info('createUserVote updateVoteNum _user_id format incorrect!');
                    return next();
                }
            }
            //投票数数加一
            VoteModel.findOneAndUpdate(queryVote,{ $inc: { participants_num: 1 } }).exec((error,rows)=> {
                if (error) {
                    logger.error(' createUserVote updateVoteNum ' + error.message);
                } else {
                    logger.info(' createUserVote updateVoteNum ' + 'success');
                    resolve();
                }
            });
        });
    }
    //更新用户参与投票数
    const updateUserVoteNum =()=>{
        return new Promise(() => {
            let queryUser = UserDetailModel.find({});
            if(path.userId){
                if(path.userId.length == 24){
                    queryUser.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
                }else{
                    logger.info('createUserVote updateUserVoteNum _user_id format incorrect!');
                    return next();
                }
            }
            //投票数数加一
            UserDetailModel.findOneAndUpdate(queryUser,{ $inc: { vote_num: 1 } }).exec((error,rows)=> {
                if (error) {
                    logger.error(' createUserVote updateUserVoteNum ' + error.message);
                } else {
                    logger.info(' createUserVote updateUserVoteNum ' + 'success');
                    resUtil.resetCreateRes(res, returnMsg);
                    return next();
                }
            });
        });
    }
    getUserVoteInfo()
        .then(saveUserVote)
        .then(getVoteInfo)
        .then(updateOptionVoteNum)
        .then(updateVoteNum)
        .then(updateUserVoteNum)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }else{
                resUtil.resetFailedRes(res,reject.msg);
            }
        })
}
module.exports = {
    getUserVote,
    getUserVoteByAdmin,
    createUserVote
};
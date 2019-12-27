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
    let query = UserVoteModel.find({});

    if(path.userId){
        if(path.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getUserVote  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.voteId){
        if(params.voteId.length == 24){
            query.where('_voteId').equals(mongoose.mongo.ObjectId(params.voteId));
        }else{
            logger.info('getUserVote  voteId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.VOTE_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
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
    let query = UserVoteModel.find({});

    if(params.userId){
        if(params.userId.length == 24){
            query.where('_userId').equals(mongoose.mongo.ObjectId(params.userId));
        }else{
            logger.info('getUserVote  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.voteId){
        if(params.voteId.length == 24){
            query.where('_voteId').equals(mongoose.mongo.ObjectId(params.voteId));
        }else{
            logger.info('getUserVote  voteId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.VOTE_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
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
const createUserVote = (req, res, next) => {
    let path = req.params;
    let bodyParams = req.body;
    let userVoteObj = bodyParams;
    let returnMsg;
    //保存用户投票信息
    const saveUserVote =()=>{
        return new Promise((resolve, reject) => {
            if(path.userId){
                if(path.userId.length == 24){
                    userVoteObj._userId = mongoose.mongo.ObjectId(path.userId);
                }else{
                    logger.info('createUserVote saveUserVote userID format incorrect!');
                    resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
                    return next();
                }
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
            })
        });
    }
    //查询投票信息
    const getVoteInfo =()=>{
        return new Promise((resolve, reject) => {
            let queryVote = VoteModel.find({});
            if(bodyParams._voteId){
                if(path.userId.length == 24){
                    queryVote.where('_id').equals(mongoose.mongo.ObjectId(bodyParams._voteId));
                }else{
                    logger.info('createUserVote getVoteInfo _userId format incorrect!');
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
                        // //更新选项投票数
                        voteInfo.option[index].voteNum = voteInfo.option[index].voteNum + 1;
                        VoteModel.updateOne({"option.txt" : optionArray[i].txt},{$set:{"option.$.voteNum":voteInfo.option[index].voteNum}}).exec((error,result)=> {
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
            if(bodyParams._voteId){
                if(path.userId.length == 24){
                    queryVote.where('_id').equals(mongoose.mongo.ObjectId(bodyParams._voteId));
                }else{
                    logger.info('createUserVote updateVoteNum _userId format incorrect!');
                    return next();
                }
            }
            //投票数数加一
            VoteModel.findOneAndUpdate(queryVote,{ $inc: { participantsNum: 1 } }).exec((error,rows)=> {
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
                    queryUser.where('_userId').equals(mongoose.mongo.ObjectId(path.userId));
                }else{
                    logger.info('createUserVote updateUserVoteNum _userId format incorrect!');
                    return next();
                }
            }
            //投票数数加一
            UserDetailModel.findOneAndUpdate(queryUser,{ $inc: { voteNum: 1 } }).exec((error,rows)=> {
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
    saveUserVote()
        .then(getVoteInfo)
        .then(updateOptionVoteNum)
        .then(updateVoteNum)
        .then(updateUserVoteNum)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }
        })
}
module.exports = {
    getUserVote,
    getUserVoteByAdmin,
    createUserVote
};
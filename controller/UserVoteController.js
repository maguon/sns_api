"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('UserVoteController');

const {UserVoteModel} = require('../modules');

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
    let params = req.params;
    let bodyParams = req.body;
    let userVoteObj = bodyParams;
    if(params.userId){
        if(params.userId.length == 24){
            userVoteObj._userId = mongoose.mongo.ObjectId(params.userId);
        }else{
            logger.info('createUserVote userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    let userVoteModel = new UserVoteModel(userVoteObj);
    userVoteModel.save(function(error,result){
        if (error) {
            logger.error(' createUserVote ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' createUserVote ' + 'success');
            resUtil.resetCreateRes(res, result);
            return next();
        }
    })
}
module.exports = {
    getUserVote,
    getUserVoteByAdmin,
    createUserVote
};
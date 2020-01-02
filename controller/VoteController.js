"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('VoteController');

const {VoteModel} = require('../modules');

const getVote = (req, res, next) => {
    let params = req.query;
    let query = VoteModel.find({});
    if(params.voteId){
        if(params.voteId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(params.voteId));
        }else{
            logger.info('getVote voteId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.VOTE_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.status){
        query.where('status').equals(params.status);
    }
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getVote ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getVote ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getVoteByAdmin = (req, res, next) => {
    let params = req.query;
    let aggregate_limit = [];
    let matchObj = {};
    aggregate_limit.push({
        $lookup: {
            from: "admin_users",
            localField: "_adminId",
            foreignField: "_id",
            as: "admin_info"
        }
    });
    if (params.adminId ) {
        if (params.adminId .length == 24) {
            matchObj._adminId  = mongoose.mongo.ObjectId(params.adminId );
        } else {
            logger.info('getVoteByAdmin adminId format incorrect!');
            resUtil.resetQueryRes(res, [], null);
            return next();
        }
    }
    if(params.title){
        matchObj["title"] = {"$regex": params.title, "$options": "$ig"};
    }
    if(params.info){
        matchObj["info"] = {"$regex": params.info, "$options": "$ig"};
    }
    if (params.maxNum) {
        matchObj.maxNum = Number(params.maxNum);
    }
    if (params.status) {
        matchObj.status = Number(params.status);
    }
    if (params.createDateStart && params.createDateEnd) {
        matchObj["created_at"] = {$gte: new Date(params.createDateStart), $lte: new Date(params.createDateEnd)};
    }
    aggregate_limit.push({
        $match: matchObj
    });
    aggregate_limit.push({
        $project: {
            "admin_info.password":0
        }
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
    VoteModel.aggregate(aggregate_limit).exec((error,rows)=> {
        if (error) {
            logger.error(' getVoteByAdmin ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            console.log('rows:',rows);
            logger.info(' getVoteByAdmin ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const createVote = (req, res, next) => {
    let path = req.params;
    let bodyParams = req.body;
    let voteObj = bodyParams;
    voteObj.participantsNum = 0;
    if(path.adminId){
        if(path.adminId.length == 24){
            voteObj._adminId = mongoose.mongo.ObjectId(path.adminId);
        }else{
            logger.info('createVote adminID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    let voteModel = new VoteModel(voteObj);
    voteModel.save(function(error,result){
        if (error) {
            logger.error(' createVote ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' createVote ' + 'success');
            resUtil.resetCreateRes(res, result);
            return next();
        }
    })
}
const updateVote = (req, res, next) =>{
    let bodyParams = req.body;
    let query = VoteModel.find();
    let queryStatus = VoteModel.find({});
    let path = req.params;
    if(path.voteId){
        if(path.voteId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.voteId ));
            queryStatus.where('_id').equals(mongoose.mongo.ObjectId(path.voteId));
        }else{
            logger.info('getVote voteId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.VOTE_ID_NULL_ERROR);
            return next();
        }
    }
    const queryConditionalStatus =()=>{
        return new Promise((resolve, reject) => {
            queryStatus.exec((error,rows)=> {
                if (error) {
                    logger.error(' getVote ' + error.message);
                    resUtil.resInternalError(error,res);
                } else {
                    logger.info(' getVote ' + 'success');
                    if(rows[0]._doc.status != sysConsts.VOTE.status.not_open){
                        //投票进行中不允许修改信息
                        resUtil.resetFailedRes(res,systemMsg.VOTE_STATUS_NULL_ERROR);
                    }else{
                        resolve();
                    }
                }
            });
        });
    }

    const updateInfo =()=>{
        return new Promise(() => {
            VoteModel.updateOne(query,bodyParams,function(error,result){
                if (error) {
                    logger.error(' updateVote ' + error.message);
                    resUtil.resInternalError(error);
                } else {
                    logger.info(' updateVote ' + 'success');
                    console.log('rows:',result);
                    resUtil.resetUpdateRes(res,result,null);
                    return next();
                }
            })
        });
    }
    queryConditionalStatus()
        .then(updateInfo)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }else{
                resUtil.resetFailedRes(res,reject.msg);
            }
        })
}
const updateStatusByAdmin = (req, res, next) => {
    let bodyParams = req.body;
    let path = req.params;
    let query = VoteModel.find({});
    if(path.voteId){
        if(path.voteId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.voteId));
        }else{
            logger.info('updateStatusByAdmin  voteId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.VOTE_ID_NULL_ERROR);
            return next();
        }
    }
    VoteModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateStatusByAdmin ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateStatusByAdmin ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
const deleteVoteByAdmin = (req, res, next) => {
    var path = req.params;
    let query = VoteModel.find({});
    if(path.voteId){
        if(path.voteId .length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.voteId ));
        }else{
            logger.info('deleteVoteByAdmin vodeId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.VOTE_ID_NULL_ERROR);
            return next();
        }
    }
    VoteModel.deleteOne(query,function(error,result){
        if(error){
            logger.error('deleteVoteByAdmin ' + error.message);
            resUtil.resInternalError(error,res,next);
        }else{
            logger.info('deleteVoteByAdmin ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
module.exports = {
    getVote,
    getVoteByAdmin,
    createVote,
    updateVote,
    updateStatusByAdmin,
    deleteVoteByAdmin
};
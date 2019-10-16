"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const logger = serverLogger.createLogger('VoteDetailController');

const {VoteDetailModel} = require('../modules');

const getVoteDetail = (req, res, next) => {
    let params = req.query;
    let query = VoteDetailModel.find({});
    if(params.voteId){
        if(params.voteId.length == 24){
            query.where('_voteId').equals(mongoose.mongo.ObjectId(params.voteId));
        }else{
            logger.info('getVoteDetail voteId format incorrect!');
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
            logger.error(' getVoteDetail ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getVoteDetail ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
module.exports = {
    getVoteDetail
};
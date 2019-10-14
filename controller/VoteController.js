"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const logger = serverLogger.createLogger('VoteController');

const {VoteModel} = require('../modules');
const {VoteDetailModel} = require('../modules');

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
const createVote = (req, res, next) => {
    let params = req.params;
    let bodyParams = req.body;
    let voteObj = bodyParams;
    voteObj.participantsNum = 0;
    if(params.userId){
        if(params.userId.length == 24){
            voteObj._userId = mongoose.mongo.ObjectId(params.userId);
        }else{
            logger.info('createVote userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    const createVote =()=>{
        return new Promise((resolve, reject)=>{
            let voteModel = new VoteModel(voteObj);
            voteModel.save(function(error,result){
                if (error) {
                    logger.error(' createVote ' + error.message);
                    reject({err:error.message});
                } else {
                    logger.info(' createVote ' + 'success');
                    resolve(result);
                }
            })
        });
    }

    const createVoteDetail =(voteInfo)=>{
        return new Promise(()=>{
            var optionArray = bodyParams.VoteDetail;

            var voteDetailArray = new Array();
            for(let i=0;i<optionArray.length;i++){
                let voteDetailObj={
                    option:optionArray[i].option,
                    voteNum:0,
                    _voteId:voteInfo.id
                }
                voteDetailArray.push(voteDetailObj);
            }

            VoteDetailModel.insertMany(voteDetailArray,function(error,result){
                    if (error) {
                        logger.error(' createVoteDetail ' + error.message);
                        resUtil.resInternalError(error,res);
                    } else {
                        logger.info(' createVoteDetail ' + 'success');
                        resUtil.resetCreateRes(res, voteInfo);
                        return next();
                    }
            });
        });
    }

    createVote()
        .then(createVoteDetail)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }else{
                resUtil.resetFailedRes(res,reject.msg);
            }
        })
}
module.exports = {
    getVote,
    createVote
};
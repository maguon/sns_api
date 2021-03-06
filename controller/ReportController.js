"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const moment = require('moment');
const logger = serverLogger.createLogger('ReportController');

const {ReportModel} = require('../modules');

const createReport = (req, res, next) => {
    let path = req.params;
    let bodyParams = req.body;
    let reportObj = bodyParams;
    if(path.userId){
        if(path.userId .length == 24){
            reportObj._user_id = mongoose.mongo.ObjectId(path.userId );
        }else{
            logger.info('createReport userId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(path.msgId){
        if(path.msgId .length == 24){
            reportObj._msg_id = mongoose.mongo.ObjectId(path.msgId );
        }else{
            logger.info('createReport msgId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    let reportModel = new ReportModel(reportObj);
    reportModel.save(function(error,result){
        if (error) {
            logger.error(' createReport ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' createReport ' + 'success');
            resUtil.resetCreateRes(res, result);
        }
    });
}
const getReport = (req, res, next) => {
    let path = req.params;
    let query = ReportModel.find({});

    if(path.userId){
        if(path.userId.length == 24){
            query.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('getReport userId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(path.msgId){
        if(path.msgId .length == 24){
            query.where('_msg_id').equals(mongoose.mongo.ObjectId(path.msgId ));
        }else{
            logger.info('getReport msgId  format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getReport ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getReport ' + 'success');
            resUtil.resetQueryRes(res, rows);
        }
    });
}
const getReportByAdmin = (req, res, next) => {
    let params = req.query;
    let aggregate_limit = [];
    let matchObj = {};
    aggregate_limit.push({
        $lookup: {
            from: "user_details",
            localField: "_user_id",
            foreignField: "_user_id",
            as: "user_detail_info"
        }
    });
    aggregate_limit.push({
        $lookup: {
            from: "admin_users",
            localField: "_admin_id",
            foreignField: "_id",
            as: "admin_info"
        }
    });
    if(params.reportId){
        if(params.reportId.length == 24){
            matchObj._id = mongoose.mongo.ObjectId(params.reportId);
        }else{
            logger.info('updateReportByAdmin reportId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if (params.status) {
        matchObj.status = Number(params.status);
    }
    if (params.validResults) {
        matchObj.valid_results = Number(params.validResults);
    }
    if (params.createDateStart && params.createDateEnd) {
        matchObj.created_at = {$gte: new Date(params.createDateStart), $lte: new Date(params.createDateEnd)};
    }
    if (params.reviewDateStart && params.reviewDateEnd) {
        matchObj.review_time = {$gte: new Date(params.reviewDateStart), $lte: new Date(params.reviewDateEnd)};
    }
    aggregate_limit.push({
        $project: {
            "user_detail_info.sex": 0,
            "user_detail_info.intro": 0,
            "user_detail_info.msg_num": 0,
            "user_detail_info.msg_help_num": 0,
            "user_detail_info.follow_num": 0,
            "user_detail_info.attention_num": 0,
            "user_detail_info.comment_num": 0,
            "user_detail_info.comment_reply_num": 0,
            "user_detail_info.vote_num": 0,
            "user_detail_info.msg_coll_num": 0,
            "user_detail_info.loca_coll_num": 0,
            "user_detail_info.black_list": 0,
            "user_detail_info._user_id": 0,
            "user_detail_info.created_at": 0,
            "user_detail_info.updated_at": 0,
            "user_detail_info.__v": 0,

            "admin_info.phone": 0,
            "admin_info.password": 0,
            "admin_info.gender": 0,
            "admin_info.status": 0,
            "admin_info.created_at": 0,
            "admin_info.updated_at": 0,
            "admin_info.__v": 0
        }
    });
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
            },{
                $limit : Number(params.size)
            }
        );
    };
    ReportModel.aggregate(aggregate_limit).exec((error,rows)=> {
        if (error) {
            logger.error(' getReportByAdmin ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getReportByAdmin ' + 'success');
            resUtil.resetQueryRes(res, rows);
        }
    });
}
const updateReportByAdmin = (req, res, next) =>{
    let bodyParams = req.body;
    let today = new Date();

    let query = ReportModel.find();
    let path = req.params;
    if(path.reportId){
        if(path.reportId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.reportId));
        }else{
            logger.info('updateReportByAdmin reportId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    if(path.adminId){
        if(path.adminId.length == 24){
            bodyParams._admin_id = mongoose.mongo.ObjectId(path.adminId);
        }else{
            logger.info('updateReportByAdmin adminId format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    bodyParams.status = Number(2);
    bodyParams.review_time = today;
    if(bodyParams.validResults){
        bodyParams.valid_results = bodyParams.validResults;
    }

    ReportModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateReportByAdmin ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateReportByAdmin ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    });
}

module.exports = {
    createReport,
    getReport,
    getReportByAdmin,
    updateReportByAdmin
};
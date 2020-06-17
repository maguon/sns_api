"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
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
const getReportByAdmin = (req, res, next) => {
    let params = req.query;
    let aggregate_limit = [];
    let matchObj = {};
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
    if (params.result) {
        matchObj.result = Number(params.result);
    }
    if (params.createDateStart && params.createDateEnd) {
        matchObj.created_at = {$gte: new Date(params.createDateStart), $lte: new Date(params.createDateEnd)};
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
    getReportByAdmin,
    updateReportByAdmin
};
"use strict"

const mongoose = require('mongoose');
const moment = require('moment');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const logger = serverLogger.createLogger('DateCountController');

const {UserModel} = require('../modules');
const {MsgModel} = require('../modules');
const {MsgCommentModel} = require('../modules');
const {DateUserCountModel} = require('../modules');
const {DateMsgCountModel} = require('../modules');
const {DateComCountModel} = require('../modules');

const getNewUserByMonth = (req, res, next) => {
    let params = req.query;
    let aggregate_limit = [];
    if(params.startMonth  && params.endMonth){
        aggregate_limit.push({
            $match: {
                y_month :  {$gte: Number(params.startMonth), $lte: Number(params.endMonth)}
            }
        });
    }

    aggregate_limit.push({
        $group: {
            _id: { y_month : "$y_month"},
            newUserMonthCount: { $sum: "$new_user_num" },
        }
    });
    aggregate_limit.push({
        $group: {
            _id: null,
            monthList: { $push: { y_month: "$_id.y_month" ,new_user_num: "$newUserMonthCount"} }
        }
    });

    aggregate_limit.push({
        $project: { _id: 0, monthList: 1}
    });

    DateUserCountModel.aggregate(aggregate_limit).exec((error,rows)=> {
        if (error) {
            logger.error(' getNewUserByMonth ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getNewUserByMonth ' + 'success');
            if(rows.length == 0){
                resUtil.resetQueryRes(res, rows);
            }else{
                resUtil.resetQueryRes(res, rows[0].monthList);
            }
        }
    });

}
const getNewUserByWeek = (req, res, next) => {
    let params = req.query;

    //前几周计算
    let today = new Date();
    let date2 = today.getTime() - params.weekNum*7*24*60*60*1000;
    let date3 = new Date(date2);

    let beginDate = new Date(today.getFullYear(), 0, 1);
    let agoWeek = Math.ceil((parseInt((date3 - beginDate) / (24 * 60 * 60 * 1000)) + 1 + beginDate.getDay()) / 7);

    let aggregate_limit = [];
    if(agoWeek){
        aggregate_limit.push({
            $match: {
                week :  {$gte: Number(agoWeek)}
            }
        });
    }

    aggregate_limit.push({
        $group: {
            _id: { week : "$week"},
            newUserWeekCount: { $sum: "$new_user_num" },
        }
    });

    aggregate_limit.push({
        $group: {
            _id: null,
            weekList: { $push: { week: "$_id.week" ,new_user_num: "$newUserWeekCount"} }
        }
    });

    aggregate_limit.push({
        $project: { _id: 0, weekList: 1}
    });

    DateUserCountModel.aggregate(aggregate_limit).exec((error,rows)=> {
        if (error) {
            logger.error(' getNewUserByWeek ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getNewUserByWeek ' + 'success');
            if(rows.length == 0){
                resUtil.resetQueryRes(res, rows);
            }else{
                resUtil.resetQueryRes(res, rows[0].weekList);
            }

        }
    });
}
const getNewUserByDay = (req, res, next) => {
    let params = req.query;

    let aggregate_limit = [];
    if(params.startDay && params.endDay){
        aggregate_limit.push({
            $match: {
                date :  { $gte: Number(params.startDay), $lt: Number(params.endDay) }
            }
        });
    }

    aggregate_limit.push({
        $project: { _id:0, date: 1, new_user_num: 1}
    });

    DateUserCountModel.aggregate(aggregate_limit).exec((error,rows)=> {
        if (error) {
            logger.error(' getNewUserByDay ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getNewUserByDay ' + 'success');
            if(rows.length == 0){
                resUtil.resetQueryRes(res, rows);
            }else{
                resUtil.resetQueryRes(res, rows);
            }

        }
    });
}
const createDateUserCount = (req, res, next) => {
    let today = new Date();
    let startDay = new Date(moment(today).add(-1, 'days').format('YYYY-MM-DD'));
    let endDay = new Date(moment(today).format('YYYY-MM-DD'));
    let returnMsg = {};

    const getUserCount = () =>{
        return new Promise((resolve, reject) => {
            let queryUser = UserModel.find({});
            if(startDay && endDay){
                queryUser.where('created_at').equals({$gte: startDay,$lt: endDay});
            }
            queryUser.countDocuments().exec((error,rows)=> {
                if (error) {
                    logger.error(' createDateUserCount getUserCount ' + error.message);
                    reject({err:error});
                } else {
                    logger.info(' createDateUserCount getUserCount ' + 'success');
                    //新用户统计数
                    returnMsg.user = rows;
                    resolve();
                }
            });
        });
    }

    const createCountInfo = () =>{
        return new Promise((resolve, reject) => {
            let dateUserCountObj = {};

            //JS获取日期周数
            let beginDate = new Date(today.getFullYear(), 0, 1);

            //date
            let date = moment(today).format('YYYYMMDD');
            if(date){
                dateUserCountObj.date  = Number(date);
            }

            //日
            let day = moment(today).format('D');
            if(day){
                dateUserCountObj.day  = Number(day);
            }

            //周
            let week = Math.ceil((parseInt((today - beginDate) / (24 * 60 * 60 * 1000)) + 1 + beginDate.getDay()) / 7);
            if(week){
                dateUserCountObj.week  = Number(week);
            }

            //月
            let month = moment(today).format('M');
            if(month){
                dateUserCountObj.month  = Number(month);
            }

            //年
            let year = moment(today).format('YYYY');
            if(year){
                dateUserCountObj.year  = Number(year);
            }

            //年_月
            let y_month = today.getFullYear().toString() + moment(today).format('MM');
            if(y_month){
                dateUserCountObj.y_month  = Number(y_month);
            }

            //年_星期
            let y_week = today.getFullYear().toString() + ('0' + week).substr(-2);
            if(y_week){
                dateUserCountObj.y_week  = Number(y_week);
            }

            //新增用户统计
            if(returnMsg.user){
                dateUserCountObj.new_user_num  = Number(returnMsg.user);
            }else{
                dateUserCountObj.new_user_num  = 0;
            }

            //判断 date 是否唯一
            let queryDateUserCount = DateUserCountModel.find({});
            if(date){
                queryDateUserCount.where('date').equals(date);
            }

            //如果已存在 该日期，则更新信息
            //如果不存在，新建数据
            DateUserCountModel.findOneAndUpdate(queryDateUserCount,dateUserCountObj,{new: true, upsert: true}).exec((error,rows)=> {
                if (error) {
                    logger.error(' createDateUserCount createCountInfo ' + error.message);
                    reject({err:error});
                } else {
                    logger.info(' createDateUserCount createCountInfo ' + 'success');
                    resUtil.resetCreateRes(res, rows);
                    return next();
                }
            });
        });
    }

    getUserCount()
        .then(createCountInfo)
        .catch((reject) =>{
            if(reject.err) {
                resUtil.resetFailedRes(res, reject.err);
            }else{
                resUtil.resetFailedRes(res, reject.msg);
            }
        })
}
const createDateMsgCount = (req, res, next) => {
    let today = new Date();
    let startDay = new Date(moment(today).add(-1, 'days').format('YYYY-MM-DD'));
    let endDay = new Date(moment(today).format('YYYY-MM-DD'));
    let returnMsg = {};

    const getMsgCount = () =>{
        return new Promise((resolve, reject) => {
            let aggregate_limit = [];
            if(startDay && endDay){
                aggregate_limit.push({
                    $match: {
                        created_at :  {$gte: startDay,$lt: endDay}
                    }
                });
            }

            aggregate_limit.push({
                $group: {
                    _id: { type : "$type", carrier : "$carrier"},
                    msgList: { $push: { address_show: "$address_show", status: "$status" } }
                }
            });
            aggregate_limit.push({
                $group: {
                    _id: { type: "$_id.type", carrier: "$_id.carrier" },
                    msgCount: { $sum: { $size: "$msgList" } }
                }
            });
            aggregate_limit.push({
                $group: {
                    _id: { type: "$_id.type" },
                    newMsgCount: { $sum: "$msgCount"},
                    carrierList: { $push: { carrier: "$_id.carrier", msgCount: "$msgCount"} }
                }
            });
            aggregate_limit.push({
                $group: {
                    _id: null,
                    newMsgCount: { $sum: "$newMsgCount"},
                    typeList: { $push: { type: "$_id.type", carrier : "$_id.carrier", carrierList: "$carrierList" } }
                }
            });
            aggregate_limit.push({
                $project: { _id: 0, typeList: 1,newMsgCount:1}
            });

            aggregate_limit.push({
                $sort: { "type": 1 }
            });
            MsgModel.aggregate(aggregate_limit).exec((error,rows)=> {
                if (error) {
                    logger.error(' createDateMsgCount getMsgCount ' + error.message);
                    reject({err:error});
                } else {
                    logger.info(' createDateMsgCount getMsgCount ' + 'success');
                    returnMsg.msg = rows ;
                    resolve();
                }
            });
        });
    }

    const createCountInfo = () =>{
        return new Promise((resolve, reject) => {
            let dateMsgCountObj = {};

            //JS获取日期周数
            let beginDate = new Date(today.getFullYear(), 0, 1);

            //date
            let date = moment(today).format('YYYYMMDD');
            if(date){
                dateMsgCountObj.date  = Number(date);
            }

            //日
            let day = moment(today).format('D');
            if(day){
                dateMsgCountObj.day  = Number(day);
            }

            //周
            let week = Math.ceil((parseInt((today - beginDate) / (24 * 60 * 60 * 1000)) + 1 + beginDate.getDay()) / 7);
            if(week){
                dateMsgCountObj.week  = Number(week);
            }

            //月
            let month = moment(today).format('M');
            if(month){
                dateMsgCountObj.month  = Number(month);
            }

            //年
            let year = moment(today).format('YYYY');
            if(year){
                dateMsgCountObj.year  = Number(year);
            }

            //年_月
            let y_month = today.getFullYear().toString() +  moment(today).format('MM');
            if(y_month){
                dateMsgCountObj.y_month  = Number(y_month);
            }

            //年_星期
            let y_week = today.getFullYear().toString() + ('0' + week).substr(-2);
            if(y_week){
                dateMsgCountObj.y_week  = Number(y_week);
            }

            //文章统计数
            if(returnMsg.msg.length != 0 ){
                let msgCountInfo = returnMsg.msg;
                dateMsgCountObj.new_msg_num  = Number(msgCountInfo[0].newMsgCount);

                if(msgCountInfo[0].typeList != undefined){
                    let msgTypeList = msgCountInfo[0].typeList;
                    msgTypeList.forEach(function (v,i) {
                        if(v.type == 1){
                            //文章
                            let msgCarrierArtList = v.carrierList;
                            msgCarrierArtList.forEach(function (carrierArtInfo,item) {
                                if(carrierArtInfo.carrier == 1){
                                    //文章-文本
                                    dateMsgCountObj.msg_art_text = carrierArtInfo.msgCount;
                                }
                                if(carrierArtInfo.carrier == 2){
                                    //文章-图片
                                    dateMsgCountObj.msg_art_picture = carrierArtInfo.msgCount;
                                }
                                if(carrierArtInfo.carrier == 3){
                                    //文章-视频
                                    dateMsgCountObj.msg_art_video = carrierArtInfo.msgCount;
                                }
                                if(carrierArtInfo.carrier == 4){
                                    //文章-地理位置
                                    dateMsgCountObj.msg_art_position = carrierArtInfo.msgCount;
                                }
                            })
                        }

                        if(v.type == 2){
                            //求助
                            let msgCarrierHelpList = v.carrierList;
                            msgCarrierHelpList.forEach(function (carrierHelpInfo,item) {
                                if(carrierHelpInfo.carrier == 1){
                                    //求助-文本
                                    dateMsgCountObj.msg_help_text = carrierHelpInfo.msgCount;
                                }
                                if(carrierHelpInfo.carrier == 2){
                                    //求助-图片
                                    dateMsgCountObj.msg_help_picture = carrierHelpInfo.msgCount;
                                }
                                if(carrierHelpInfo.carrier == 3){
                                    //求助-视频
                                    dateMsgCountObj.msg_help_video = carrierHelpInfo.msgCount;
                                }
                                if(carrierHelpInfo.carrier == 4){
                                    //求助-地理位置
                                    dateMsgCountObj.msg_help_position = carrierHelpInfo.msgCount;
                                }
                            })
                        }
                    })

                }
            }else{
                dateMsgCountObj.new_msg_num = 0;
                //文章-文本
                dateMsgCountObj.msg_art_text = 0;
                //文章-图片
                dateMsgCountObj.msg_art_picture = 0;
                //文章-视频
                dateMsgCountObj.msg_art_video = 0;
                //文章-地理位置
                dateMsgCountObj.msg_art_position = 0;
                //求助-文本
                dateMsgCountObj.msg_help_text = 0;
                //求助-图片
                dateMsgCountObj.msg_help_picture = 0;
                //求助-视频
                dateMsgCountObj.msg_help_video = 0;
                //求助-地理位置
                dateMsgCountObj.msg_help_position = 0;
            }

            //判断 date 是否唯一
            let queryDateMsgCount = DateMsgCountModel.find({});
            if(date){
                queryDateMsgCount.where('date').equals(date);
            }

            //如果已存在 该日期，则更新信息
            //如果不存在，新建数据
            DateMsgCountModel.findOneAndUpdate(queryDateMsgCount,dateMsgCountObj,{new: true, upsert: true}).exec((error,rows)=> {
                if (error) {
                    logger.error(' createDateMsgCount createCountInfo ' + error.message);
                    reject({err:error});
                } else {
                    logger.info(' createDateMsgCount createCountInfo ' + 'success');
                    resUtil.resetCreateRes(res, rows);
                    return next();
                }
            });
        });
    }

    getMsgCount()
        .then(createCountInfo)
        .catch((reject) =>{
            if(reject.err) {
                resUtil.resetFailedRes(res, reject.err);
            }else{
                resUtil.resetFailedRes(res, reject.msg);
            }
        })
}
const createDateComCount = (req, res, next) => {
    let today = new Date();
    let startDay = new Date(moment(today).add(-1, 'days').format('YYYY-MM-DD'));
    let endDay = new Date(moment(today).format('YYYY-MM-DD'));
    let returnMsg = {};

    const getMsgComCount = () =>{
        return new Promise((resolve, reject) => {
            let aggregate_limit_com = [];
            if(startDay && endDay){
                aggregate_limit_com.push({
                    $match: {
                        created_at :  {$gte: startDay,$lt: endDay}
                    }
                });
            }

            aggregate_limit_com.push({
                $group: {
                    _id: { msg_type : "$msg_type", level : "$level"},
                    msgComList: { $push: { status: "$status" } }
                }
            });
            aggregate_limit_com.push({
                $group: {
                    _id: { msg_type: "$_id.msg_type", level: "$_id.level" },
                    msgComCount: { $sum: { $size: "$msgComList" } }
                }
            });
            aggregate_limit_com.push({
                $group: {
                    _id: { msg_type: "$_id.msg_type" },
                    newMsgComCount: { $sum: "$msgComCount"},
                    levelList: { $push: { level: "$_id.level", msgComCount: "$msgComCount"} }
                }
            });
            aggregate_limit_com.push({
                $group: {
                    _id: null,
                    newMsgComCount: { $sum: "$newMsgComCount"},
                    typeList: { $push: { msg_type: "$_id.msg_type", level : "$_id.level", levelList: "$levelList" } }
                }
            });
            aggregate_limit_com.push({
                $project: { _id: 0, typeList: 1,newMsgComCount:1}
            });

            aggregate_limit_com.push({
                $sort: { "msg_type": 1 }
            });
            MsgCommentModel.aggregate(aggregate_limit_com).exec((error,rows)=> {
                if (error) {
                    logger.error(' createDateComCount getMsgComCount ' + error.message);
                    reject({err:error});
                } else {
                    logger.info(' createDateComCount getMsgComCount ' + 'success');
                    returnMsg.com = rows;
                    resolve(returnMsg);
                }
            });
        });
    }

    const createCountInfo = () =>{
        return new Promise((resolve, reject) => {
            let dateCountComObj = {};

            //JS获取日期周数
            let beginDate = new Date(today.getFullYear(), 0, 1);

            //date
            let date = moment(today).format('YYYYMMDD');
            if(date){
                dateCountComObj.date  = Number(date);
            }

            //日
            let day = moment(today).format('D');
            if(day){
                dateCountComObj.day  = Number(day);
            }

            //周
            let week = Math.ceil((parseInt((today - beginDate) / (24 * 60 * 60 * 1000)) + 1 + beginDate.getDay()) / 7);
            if(week){
                dateCountComObj.week  = Number(week);
            }

            //月
            let month = moment(today).format('M');
            if(month){
                dateCountComObj.month  = Number(month);
            }

            //年
            let year = moment(today).format('YYYY');
            if(year){
                dateCountComObj.year  = Number(year);
            }

            //年_月
            let y_month = today.getFullYear().toString() +  moment(today).format('MM');
            if(y_month){
                dateCountComObj.y_month  = Number(y_month);
            }

            //年_星期
            let y_week = today.getFullYear().toString() + ('0' + week).substr(-2);
            if(y_week){
                dateCountComObj.y_week  = Number(y_week);
            }

            //评论统计数
            if(returnMsg.com.length != 0){
                let msgComCountInfo = returnMsg.com;
                dateCountComObj.new_com_num  = Number(msgComCountInfo[0].newMsgComCount);

                if(msgComCountInfo[0].typeList != undefined){
                    let msgTypeList = msgComCountInfo[0].typeList;
                    msgTypeList.forEach(function (v,i) {
                        if(v.msg_type == 1){
                            //文章评论
                            let msglevelArtList = v.levelList;
                            msglevelArtList.forEach(function (levelArtInfo,item) {
                                if(levelArtInfo.level == 1){
                                    //文章评论-文本
                                    dateCountComObj.com_art_first = levelArtInfo.msgComCount;
                                }
                                if(levelArtInfo.level == 2){
                                    //文章评论-图片
                                    dateCountComObj.com_art_two = levelArtInfo.msgComCount;
                                }
                            })
                        }

                        if(v.msg_type == 2){
                            //求助评论
                            let msglevelHelpList = v.levelList;
                            msglevelHelpList.forEach(function (levelHelpInfo,item) {
                                if(levelHelpInfo.level == 1){
                                    //求助评论-文本
                                    dateCountComObj.com_help_first = levelHelpInfo.msgComCount;
                                }
                                if(levelHelpInfo.level == 2){
                                    //求助评论-图片
                                    dateCountComObj.com_help_two = levelHelpInfo.msgComCount;
                                }
                            })
                        }
                    })

                }
            }else{
                dateCountComObj.new_com_num  = 0;
                //文章评论-文本
                dateCountComObj.com_art_first = 0;
                //文章评论-图片
                dateCountComObj.com_art_two = 0;
                //求助评论-文本
                dateCountComObj.com_help_first = 0;
                //求助评论-图片
                dateCountComObj.com_help_two = 0;
            }

            //判断 date 是否唯一
            let queryDateComCount = DateComCountModel.find({});
            if(date){
                queryDateComCount.where('date').equals(date);
            }

            //如果已存在 该日期，则更新信息
            //如果不存在，新建数据
            DateComCountModel.findOneAndUpdate(queryDateComCount,dateCountComObj,{new: true, upsert: true}).exec((error,rows)=> {
                if (error) {
                    logger.error(' createDateComCount createCountInfo ' + error.message);
                    reject({err:error});
                } else {
                    logger.info(' createDateComCount createCountInfo ' + 'success');
                    resUtil.resetCreateRes(res, rows);
                    return next();
                }
            });
        });
    }

    getMsgComCount()
        .then(createCountInfo)
        .catch((reject) =>{
            if(reject.err) {
                resUtil.resetFailedRes(res, reject.err);
            }else{
                resUtil.resetFailedRes(res, reject.msg);
            }
        })
}

module.exports = {
    getNewUserByMonth,
    getNewUserByWeek,
    getNewUserByDay,
    createDateUserCount,
    createDateMsgCount,
    createDateComCount
};
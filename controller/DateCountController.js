"use strict"
/**
 * Created by yym on 20-7-10.
 */
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const moment = require('moment');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemConst = require('../util/SystemConst');
const logger = serverLogger.createLogger('DateCountController');

const {UserModel} = require('../modules');
const {MsgModel} = require('../modules');
const {MsgCommentModel} = require('../modules');
const {DateUserCountModel} = require('../modules');
const {DateMsgCountModel} = require('../modules');
const {DateComCountModel} = require('../modules');

const getNewUserByMonth = (req, res, next) => {
    let params = req.query;
    let o = {};
    if(params.startMonth  && params.endMonth){
        o.query = {y_month:{$gte: Number(params.startMonth), $lte: Number(params.endMonth)}};
    }
    o.map = function() { emit(this.y_month,this.new_user_num); };
    o.reduce = function(key, values) {return Array.sum(values)};
    o.out = "user_month_count";

    DateUserCountModel.mapReduce(o, function (err, results) {
        results.model.find().sort({"_id": -1}).exec(function (err, docs) {
            if (err) {
                logger.error(' getNewUserByMonth ' + err);
                resUtil.resInternalError(err,res);
            } else {
                logger.info(' getNewUserByMonth ' + 'success');
                resUtil.resetQueryRes(res, docs);
            }
        });
    })
}
const getNewUserByWeek = (req, res, next) => {
    let params = req.query;

    let today = new Date();
    let beginDate = new Date(today.getFullYear(), 0, 1);

    let dateStart = new Date(params.startDay);
    let startWeek = Math.ceil((parseInt((dateStart - beginDate) / (24 * 60 * 60 * 1000)) + 1 + beginDate.getDay()) / 7);

    let dateEnd = new Date(params.endDay);
    let endWeek = Math.ceil((parseInt((dateEnd - beginDate) / (24 * 60 * 60 * 1000)) + 1 + beginDate.getDay()) / 7);

    let o = {};
    if( startWeek && endWeek ){
        o.query = { u_week :  { $gte: Number(startWeek), $lte: Number(endWeek) }};
    }
    o.map = function() { emit(this.u_week,this.new_user_num); };
    o.reduce = function(key, values) {return Array.sum(values)};
    o.out = "user_day_count";

    DateUserCountModel.mapReduce(o, function (err, results) {
        results.model.find().sort({"_id": -1}).exec(function (err, docs) {
            if (err) {
                logger.error(' getNewUserByWeek ' + err);
                resUtil.resInternalError(err,res);
            } else {
                logger.info(' getNewUserByWeek ' + 'success');
                resUtil.resetQueryRes(res, docs);
            }
        });
    })

}
const getNewUserByDay = (req, res, next) => {
    let paramsDay = req.query;
    let o = {};
    if(paramsDay.startDay && paramsDay.endDay){
        o.query = { u_date :  { $gte: Number(paramsDay.startDay), $lte: Number(paramsDay.endDay) }};
    }
    o.map = function() { emit(this.u_date,this.new_user_num); };
    o.reduce = function(key, values) {return Array.sum(values)};
    o.out = "user_day_count";

    DateUserCountModel.mapReduce(o, function (err, results) {
        results.model.find().sort({"_id": -1}).exec(function (err, docs) {
            if (err) {
                logger.error(' getNewUserByDay ' + err);
                resUtil.resInternalError(err,res);
            } else {
                logger.info(' getNewUserByDay ' + 'success');
                resUtil.resetQueryRes(res, docs);
            }
        });
    })
}
const getNewMsgByMonth = (req, res, next) => {
    let params = req.query;
    let queryObj = {};
    let o = {};
    //日期查询条件
    if(params.startMonth  && params.endMonth){
        queryObj.y_month = {$gte: Number(params.startMonth), $lte: Number(params.endMonth)};
    }

    if(params.type != undefined && params.carrier != undefined){

        if(params.type == 0 && params.carrier !=0){
            //按照载体类型分组 并统计
            queryObj.m_carrier = params.carrier;
            o.map = function() { emit( {y_month : this.y_month, m_carrier:this.m_carrier}, { m_count: this.m_count}); };
            o.reduce = function(key, values) {
                var con = 0;
                for(var i=0;i< values.length ; i++){
                    con  += values[i].m_count;
                }
                return con
            };
        }

        if(params.type != 0 && params.carrier ==0){
            //按照载体类型分组 并统计
            queryObj.m_type = params.type;
            o.map = function() { emit( {y_month : this.y_month, m_type:this.m_type}, { m_count: this.m_count}); };
            o.reduce = function(key, values) {
                var con = 0;
                for(var i=0;i< values.length ; i++){
                    con  += values[i].m_count;
                }
                return con
            };
        }

        if(params.type != 0 && params.carrier !=0){
            //根据 文章类型 + 载体类型 查询  不等于O的情况
            queryObj.m_carrier = params.carrier;
            queryObj.m_type = params.type;
            o.map = function() { emit( {y_month : this.y_month, m_type:this.m_type, m_carrier:this.m_carrier}, { m_count: this.m_count}); };
            o.reduce = function(key, values) {
                var con = {};
                for(var i=0;i< values.length ; i++){
                    con = values[i];
                }
                return con
            };
        }

        if(params.carrier == 0 && params.type == 0){
            o.map = function() { emit( {y_month : this.y_month}, { m_count: this.m_count}); };
            o.reduce = function(key, values) {
                var con = 0;
                for(var i=0;i< values.length ; i++){
                    con  += values[i].m_count;
                }
                return con
            };
        }
    }else{
        if(params.type == undefined ){
            if(params.carrier != 0 && params.carrier != undefined) {
                //载体类型不为0
                queryObj.m_carrier = params.carrier;
                o.map = function() { emit( {y_month : this.y_month,m_type:this.m_type, m_carrier:this.m_carrier}, { m_count: this.m_count}); };
                o.reduce = function(key, values) {
                    var con = {};
                    for(var i=0;i< values.length ; i++){
                        con = values[i];
                    }
                    return con
                };
            }
            if(params.carrier == 0 && params.carrier != undefined) {
                //载体类型为0
                //按照载体类型分组 并统计
                o.map = function() { emit( {y_month : this.y_month, m_type:this.m_type}, { m_count: this.m_count}); };
                o.reduce = function(key, values) {
                    var con = 0;
                    for(var i=0;i< values.length ; i++){
                        con  += values[i].m_count;
                    }
                    return con
                };
            }
        }

        if(params.carrier == undefined ){
            if(params.type != 0 && params.type != undefined) {
                //文章类型不为0
                queryObj.m_type = params.type;
                o.map = function() { emit( {y_month : this.y_month,m_type:this.m_type, m_carrier:this.m_carrier}, { m_count: this.m_count}); };
                o.reduce = function(key, values) {
                    var con = {};
                    for(var i=0;i< values.length ; i++){
                        con = values[i];
                    }
                    return con
                };
            }
            if(params.type == 0 && params.type != undefined) {
                //文章类型为0
                //按照载体类型分组 并统计
                o.map = function() { emit( {y_month : this.y_month, m_carrier:this.m_carrier}, { m_count: this.m_count}); };
                o.reduce = function(key, values) {
                    var con = 0;
                    for(var i=0;i< values.length ; i++){
                        con  += values[i].m_count;
                    }
                    return con
                };
            }
        }
        //都为空时，根据日期查询
        if(params.carrier == undefined && params.type == undefined){
            o.map = function() { emit( {y_month : this.y_month,m_type:this.m_type, m_carrier:this.m_carrier}, { m_count: this.m_count}); };
            o.reduce = function(key, values) {
                var con = {};
                for(var i=0;i< values.length ; i++){
                    con = values[i];
                }
                return con
            };
        }
    }

    o.query = queryObj;
    o.out = "msg_month_count";

    DateMsgCountModel.mapReduce(o, function (err, results) {
        results.model.find().sort({"_id.y_month": -1}).exec(function (err, docs) {
            if (err) {
                logger.error(' getNewMsgByMonth ' + err);
                resUtil.resInternalError(err,res);
            } else {
                logger.info(' getNewMsgByMonth ' + 'success');
                resUtil.resetQueryRes(res, docs);
            }
        });
    })

}
const getNewMsgByDay = (req, res, next) => {
    let params = req.query;
    let queryObj = {};
    let o = {};
    //日期查询条件
    if(params.startDay && params.endDay){
        queryObj.m_date = { $gte: Number(params.startDay), $lte: Number(params.endDay) };
    }

    if(params.type != undefined && params.carrier != undefined){

        if(params.type == 0 && params.carrier !=0){
            //按照载体类型分组 并统计
            queryObj.m_carrier = params.carrier;
            o.map = function() { emit( {m_date : this.m_date, m_carrier:this.m_carrier}, { m_count: this.m_count}); };
            o.reduce = function(key, values) {
                var con = 0;
                for(var i=0;i< values.length ; i++){
                    con  += values[i].m_count;
                }
                return con
            };
        }

        if(params.type != 0 && params.carrier ==0){
            //按照载体类型分组 并统计
            queryObj.m_type = params.type;
            o.map = function() { emit( {m_date : this.m_date, m_type:this.m_type}, { m_count: this.m_count}); };
            o.reduce = function(key, values) {
                var con = 0;
                for(var i=0;i< values.length ; i++){
                    con  += values[i].m_count;
                }
                return con
            };
        }

        if(params.type != 0 && params.carrier !=0){
            //根据 文章类型 + 载体类型 查询  不等于O的情况
            queryObj.m_carrier = params.carrier;
            queryObj.m_type = params.type;
            o.map = function() { emit( {m_date : this.m_date, m_type:this.m_type, m_carrier:this.m_carrier}, { m_count: this.m_count}); };
            o.reduce = function(key, values) {
                var con = {};
                for(var i=0;i< values.length ; i++){
                    con = values[i];
                }
                return con
            };
        }

        if(params.carrier == 0 && params.type == 0){
            o.map = function() { emit( {m_date : this.m_date}, { m_count: this.m_count}); };
            o.reduce = function(key, values) {
                var con = 0;
                for(var i=0;i< values.length ; i++){
                    con  += values[i].m_count;
                }
                return con
            };
        }
    }else{
        if(params.type == undefined ){
            if(params.carrier != 0 && params.carrier != undefined) {
                //载体类型不为0
                queryObj.m_carrier = params.carrier;
                o.map = function() { emit( {m_date : this.m_date,m_type:this.m_type, m_carrier:this.m_carrier}, { m_count: this.m_count}); };
                o.reduce = function(key, values) {
                    var con = {};
                    for(var i=0;i< values.length ; i++){
                        con = values[i];
                    }
                    return con
                };
            }
            if(params.carrier == 0 && params.carrier != undefined) {
                //载体类型为0
                //按照载体类型分组 并统计
                o.map = function() { emit( {m_date : this.m_date, m_type:this.m_type}, { m_count: this.m_count}); };
                o.reduce = function(key, values) {
                    var con = 0;
                    for(var i=0;i< values.length ; i++){
                        con  += values[i].m_count;
                    }
                    return con
                };
            }
        }

        if(params.carrier == undefined ){
            if(params.type != 0 && params.type != undefined) {
                //文章类型不为0
                queryObj.m_type = params.type;
                o.map = function() { emit( {m_date : this.m_date,m_type:this.m_type, m_carrier:this.m_carrier}, { m_count: this.m_count}); };
                o.reduce = function(key, values) {
                    var con = {};
                    for(var i=0;i< values.length ; i++){
                        con = values[i];
                    }
                    return con
                };
            }
            if(params.type == 0 && params.type != undefined) {
                //文章类型为0
                //按照 载体类型分组 并统计
                o.map = function() { emit( {m_date : this.m_date, m_carrier:this.m_carrier}, { m_count: this.m_count}); };
                o.reduce = function(key, values) {
                    var con = 0;
                    for(var i=0;i< values.length ; i++){
                        con  += values[i].m_count;
                    }
                    return con
                };
            }
        }
        //都为空时，根据日期查询
        if(params.carrier == undefined && params.type == undefined){
            o.map = function() { emit( {m_date : this.m_date,m_type:this.m_type, m_carrier:this.m_carrier}, { m_count: this.m_count}); };
            o.reduce = function(key, values) {
                var con = {};
                for(var i=0;i< values.length ; i++){
                    con = values[i];
                }
                return con
            };
        }
    }

    o.query = queryObj;
    o.out = "msg_day_count";

    DateMsgCountModel.mapReduce(o, function (err, results) {
        results.model.find().sort({"_id.m_date": -1}).exec(function (err, docs) {
            if (err) {
                logger.error(' getNewMsgByDay ' + err);
                resUtil.resInternalError(err,res);
            } else {
                logger.info(' getNewMsgByDay ' + 'success');
                resUtil.resetQueryRes(res, docs);
            }
        });
    })

}
const getNewComByMonth = (req, res, next) => {
    let params = req.query;
    let queryObj = {};
    let o = {};
    //月查询条件
    if(params.startMonth  && params.endMonth){
        queryObj.y_month = {$gte: Number(params.startMonth), $lte: Number(params.endMonth)};
    }

    if(params.type != undefined && params.level != undefined){

        if(params.type == 0 && params.level !=0){
            //按照 评论类型分组 并统计
            queryObj.c_level = params.level;
            o.map = function() { emit( {y_month : this.y_month, c_level:this.c_level}, { c_count: this.c_count}); };
            o.reduce = function(key, values) {
                var con = 0;
                for(var i=0;i< values.length ; i++){
                    con  += values[i].c_count;
                }
                return con
            };
        }

        if(params.type != 0 && params.level ==0){
            //按照 文章类型分组 并统计
            queryObj.c_type = params.type;
            o.map = function() { emit( {y_month : this.y_month, c_type:this.c_type}, { c_count: this.c_count}); };
            o.reduce = function(key, values) {
                var con = 0;
                for(var i=0;i< values.length ; i++){
                    con  += values[i].c_count;
                }
                return con
            };
        }

        if(params.type != 0 && params.level !=0){
            //根据 文章类型 + 评论类型 查询  不等于O的情况
            queryObj.c_level = params.level;
            queryObj.c_type = params.type;
            o.map = function() { emit( {y_month : this.y_month, c_type:this.c_type, c_level:this.c_level }, { c_count: this.c_count}); };
            o.reduce = function(key, values) {
                var con = {};
                for(var i=0;i< values.length ; i++){
                    con = values[i];
                }
                return con
            };
        }

        if(params.level == 0 && params.type == 0){
            o.map = function() { emit( {y_month : this.y_month}, { c_count: this.c_count}); };
            o.reduce = function(key, values) {
                var con = 0;
                for(var i=0;i< values.length ; i++){
                    con  += values[i].c_count;
                }
                return con
            };
        }
    }else{
        if(params.type == undefined ){
            if(params.level != 0 && params.level != undefined) {
                //评论类型不为0
                queryObj.c_level = params.level;
                o.map = function() { emit( {y_month : this.y_month,c_type:this.c_type, c_level:this.c_level}, { c_count: this.c_count}); };
                o.reduce = function(key, values) {
                    var con = {};
                    for(var i=0;i< values.length ; i++){
                        con = values[i];
                    }
                    return con
                };
            }
            if(params.level == 0 && params.level != undefined) {
                //评论类型为0
                //按照 文章类型分组 并统计
                o.map = function() { emit( {y_month : this.y_month, c_type:this.c_type}, { c_count: this.c_count}); };
                o.reduce = function(key, values) {
                    var con = 0;
                    for(var i=0;i< values.length ; i++){
                        con  += values[i].c_count;
                    }
                    return con
                };
            }
        }

        if(params.level == undefined ){
            if(params.type != 0 && params.type != undefined) {
                //文章类型不为0
                queryObj.c_type = params.type;
                o.map = function() { emit( {y_month : this.y_month, c_type:this.c_type, c_level:this.c_level}, { c_count: this.c_count}); };
                o.reduce = function(key, values) {
                    var con = {};
                    for(var i=0;i< values.length ; i++){
                        con = values[i];
                    }
                    return con
                };
            }
            if(params.type == 0 && params.type != undefined) {
                //文章类型为0
                //按照评论类型分组 并统计
                o.map = function() { emit( {y_month : this.y_month, c_level:this.c_level}, { c_count: this.c_count}); };
                o.reduce = function(key, values) {
                    var con = 0;
                    for(var i=0;i< values.length ; i++){
                        con  += values[i].c_count;
                    }
                    return con
                };
            }
        }
        //都为空时，根据月查询
        if(params.level == undefined && params.type == undefined){
            o.map = function() { emit( {y_month : this.y_month,c_type:this.c_type, c_level:this.c_level}, { c_count: this.c_count}); };
            o.reduce = function(key, values) {
                var con = 0;
                for(var i=0;i< values.length ; i++){
                    con  += values[i].c_count;
                }
                return con
            };
        }
    }

    o.query = queryObj;
    o.out = "com_month_count";

    DateComCountModel.mapReduce(o, function (err, results) {
        results.model.find().sort({"_id.y_month": -1}).exec(function (err, docs) {
            if (err) {
                logger.error(' getNewComByMonth ' + err);
                resUtil.resInternalError(err,res);
            } else {
                logger.info(' getNewComByMonth ' + 'success');
                resUtil.resetQueryRes(res, docs);
            }
        });
    })

}
const getNewComByDay = (req, res, next) => {
    let params = req.query;
    let queryObj = {};
    let o = {};
    //日期查询条件
    if(params.startDay && params.endDay){
        queryObj.c_date = { $gte: Number(params.startDay), $lte: Number(params.endDay) };
    }

    if(params.type != undefined && params.level != undefined){

        if(params.type == 0 && params.level !=0){
            //按照 评论类型分组 并统计
            queryObj.c_level = params.level;
            o.map = function() { emit( {c_date : this.c_date, c_level:this.c_level}, { c_count: this.c_count}); };
            o.reduce = function(key, values) {
                var con = 0;
                for(var i=0;i< values.length ; i++){
                    con  += values[i].c_count;
                }
                return con
            };
        }

        if(params.type != 0 && params.level ==0){
            //按照 文章类型分组 并统计
            queryObj.c_type = params.type;
            o.map = function() { emit( {c_date : this.c_date, c_type:this.c_type}, { c_count: this.c_count}); };
            o.reduce = function(key, values) {
                var con = 0;
                for(var i=0;i< values.length ; i++){
                    con  += values[i].c_count;
                }
                return con
            };
        }

        if(params.type != 0 && params.level !=0){
            //根据 文章类型 + 评论类型 查询  不等于O的情况
            queryObj.c_level = params.level;
            queryObj.c_type = params.type;
            o.map = function() { emit( {c_date : this.c_date, c_type:this.c_type, c_level:this.c_level }, { c_count: this.c_count}); };
            o.reduce = function(key, values) {
                var con = {};
                for(var i=0;i< values.length ; i++){
                    con = values[i];
                }
                return con
            };
        }

        if(params.level == 0 && params.type == 0){
            o.map = function() { emit( {c_date : this.c_date}, { c_count: this.c_count}); };
            o.reduce = function(key, values) {
                var con = 0;
                for(var i=0;i< values.length ; i++){
                    con  += values[i].c_count;
                }
                return con
            };
        }
    }else{
        if(params.type == undefined ){
            if(params.level != 0 && params.level != undefined) {
                //评论类型不为0
                queryObj.c_level = params.level;
                o.map = function() { emit( {c_date : this.c_date,c_type:this.c_type, c_level:this.c_level}, { c_count: this.c_count}); };
                o.reduce = function(key, values) {
                    var con = {};
                    for(var i=0;i< values.length ; i++){
                        con = values[i];
                    }
                    return con
                };
            }
            if(params.level == 0 && params.level != undefined) {
                //评论类型为0
                //按照文章类型分组 并统计
                o.map = function() { emit( {c_date : this.c_date, c_type:this.c_type}, { c_count: this.c_count}); };
                o.reduce = function(key, values) {
                    var con = 0;
                    for(var i=0;i< values.length ; i++){
                        con  += values[i].c_count;
                    }
                    return con
                };
            }
        }

        if(params.level == undefined ){
            if(params.type != 0 && params.type != undefined) {
                //文章类型不为0
                queryObj.c_type = params.type;
                o.map = function() { emit( {c_date : this.c_date, c_type:this.c_type, c_level:this.c_level}, { c_count: this.c_count}); };
                o.reduce = function(key, values) {
                    var con = {};
                    for(var i=0;i< values.length ; i++){
                        con = values[i];
                    }
                    return con
                };
            }
            if(params.type == 0 && params.type != undefined) {
                //文章类型为0
                //按照 评论类型分组 并统计
                o.map = function() { emit( {c_date : this.c_date, c_level:this.c_level}, { c_count: this.c_count}); };
                o.reduce = function(key, values) {
                    var con = 0;
                    for(var i=0;i< values.length ; i++){
                        con  += values[i].c_count;
                    }
                    return con
                };
            }
        }
        //都为空时，根据日期查询
        if(params.level == undefined && params.type == undefined){
            o.map = function() { emit( {c_date : this.c_date,c_type:this.c_type, c_level:this.c_level}, { c_count: this.c_count}); };
            o.reduce = function(key, values) {
                var con = 0;
                for(var i=0;i< values.length ; i++){
                    con  += values[i].c_count;
                }
                return con
            };
        }
    }

    o.query = queryObj;
    o.out = "com_day_count";

    DateComCountModel.mapReduce(o, function (err, results) {
        results.model.find().sort({"_id.c_date": -1}).exec(function (err, docs) {
            if (err) {
                logger.error(' getNewComByDay ' + err);
                resUtil.resInternalError(err,res);
            } else {
                logger.info(' getNewComByDay ' + 'success');
                resUtil.resetQueryRes(res, docs);
            }
        });
    })

}
const createDateUserCount = (params, callback) => {
    let today = new Date();
    let startDay = new Date(moment(today).add(-1, 'days').format('YYYY-MM-DD'));
    let endDay = new Date(moment(today).format('YYYY-MM-DD'));
    let insterDate = new Date(startDay);
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
            let date = moment(insterDate).format('YYYYMMDD');
            if(date){
                dateUserCountObj.u_date  = Number(date);
            }

            //日
            let day = moment(insterDate).format('D');
            if(day){
                dateUserCountObj.u_day  = Number(day);
            }

            //周
            let week = Math.ceil((parseInt((insterDate - beginDate) / (24 * 60 * 60 * 1000)) + 1 + beginDate.getDay()) / 7);
            if(week){
                dateUserCountObj.u_week  = Number(week);
            }

            //月
            let month = moment(insterDate).format('M');
            if(month){
                dateUserCountObj.u_month  = Number(month);
            }

            //年
            let year = moment(insterDate).format('YYYY');
            if(year){
                dateUserCountObj.u_year  = Number(year);
            }

            //年_月
            let y_month = insterDate.getFullYear().toString() + moment(insterDate).format('MM');
            if(y_month){
                dateUserCountObj.y_month  = Number(y_month);
            }

            //年_星期
            let y_week = insterDate.getFullYear().toString() + ('0' + week).substr(-2);
            if(y_week){
                dateUserCountObj.y_week  = Number(y_week);
            }

            //新增用户类型-新建
            dateUserCountObj.u_type  = systemConst.DateCount.u_type.newUser;

            //新增用户统计
            if(returnMsg.user){
                dateUserCountObj.u_count  = Number(returnMsg.user);
            }else{
                dateUserCountObj.u_count  = 0;
            }

            //判断 date 是否唯一
            let queryDateUserCount = DateUserCountModel.find({});
            if(date){
                queryDateUserCount.where('u_date').equals(date);
            }

            //如果已存在 该日期，则更新信息
            //如果不存在，新建数据
            DateUserCountModel.findOneAndUpdate(queryDateUserCount,dateUserCountObj,{new: true, upsert: true}).exec((error,rows)=> {
                if (error) {
                    logger.error(' createDateUserCount createCountInfo ' + error.message);
                    reject({err:error});
                } else {
                    logger.info(' createDateUserCount createCountInfo ' + 'success');
                    resolve(rows);
                }
            });
        });
    }
    const returnPushMsg = (result)=>{
        return new Promise(()=>{
            callback(null, result);
        });
    }
    getUserCount()
        .then(createCountInfo)
        .then(returnPushMsg)
        .catch((reject) =>{
            callback(null,null);
            return null;
        })
}
const createDateMsgCount = (params, callback) => {
    let today = new Date();
    let startDay = new Date(moment(today).add(-1, 'days').format('YYYY-MM-DD'));
    let endDay = new Date(moment(today).format('YYYY-MM-DD'));
    let insterDate = new Date(startDay);
    let returnMsg = [];

    //删除所有前一天数据
    const delCountInfo = () =>{
        return new Promise((resolve, reject) => {
            let query = DateMsgCountModel.find({});
            if(insterDate){
                let date = moment(insterDate).format('YYYYMMDD');
                query.where('m_date').equals(date);
            }

            DateMsgCountModel.deleteMany(query,function(error,result){
                if(error){
                    logger.error(' createDateMsgCount delCountInfo ' + error.message);
                    reject({err:error});
                }else{
                    logger.info(' createDateMsgCount delCountInfo ' + 'success');
                    resolve();
                }
            });

        });
    }

    //创建全部类型数据为0
    const createCountInfo = () =>{
        return new Promise((resolve, reject) => {
            let dateMsgCountArr = [];
            for(let type_i=1; type_i<3; type_i++) {
                for (let carrier_j = 1; carrier_j < 5; carrier_j++) {
                    let dateMsgCountObj = {};

                    //JS获取日期周数
                    let beginDate = new Date(insterDate.getFullYear(), 0, 1);

                    //date
                    let date = moment(insterDate).format('YYYYMMDD');
                    if(date){
                        dateMsgCountObj.m_date  = Number(date);
                    }

                    //日
                    let day = moment(insterDate).format('D');
                    if(day){
                        dateMsgCountObj.m_day  = Number(day);
                    }

                    //周
                    let week = Math.ceil((parseInt((insterDate - beginDate) / (24 * 60 * 60 * 1000)) + 1 + beginDate.getDay()) / 7);
                    if(week){
                        dateMsgCountObj.m_week  = Number(week);
                    }

                    //月
                    let month = moment(insterDate).format('M');
                    if(month){
                        dateMsgCountObj.m_month  = Number(month);
                    }

                    //年
                    let year = moment(insterDate).format('YYYY');
                    if(year){
                        dateMsgCountObj.m_year  = Number(year);
                    }

                    //年_月
                    let y_month = insterDate.getFullYear().toString() +  moment(insterDate).format('MM');
                    if(y_month){
                        dateMsgCountObj.y_month  = Number(y_month);
                    }

                    //年_星期
                    let y_week = insterDate.getFullYear().toString() + ('0' + week).substr(-2);
                    if(y_week){
                        dateMsgCountObj.y_week  = Number(y_week);
                    }

                    //文章类型
                    dateMsgCountObj.m_type = type_i;
                    //载体类型
                    dateMsgCountObj.m_carrier = carrier_j;
                    //文章统计数
                    dateMsgCountObj.m_count = 0;


                    dateMsgCountArr.push(dateMsgCountObj);
                }//for-j
            }//for-i

            //如果已存在 该日期，则更新信息
            //如果不存在，新建数据
            DateMsgCountModel.insertMany(dateMsgCountArr,function(error,result){
                if (error) {
                    logger.error(' createDateMsgCount createCountInfo ' + error.message);
                    reject({err:error});
                } else {
                    logger.info(' createDateMsgCount createCountInfo ' + 'success');
                    returnMsg.push(result);
                    resolve();
                }

            });

        });
    }

    //根据文章类型 载体类型 查询统计数
    const getMsgCount = () =>{
        return new Promise((resolve, reject) => {
            let o = {};
            let queryObj = {};
            if(startDay && endDay){
                queryObj.created_at = { $gte: Number(startDay), $lte: Number(endDay) };
            }

            o.map = function() { emit({type:this.type,carrier:this.carrier}, this.status);},
            o.reduce = function(key, values) {
                let count = 0;
                for (let i=0;i<values.length;i++){
                    count+=1;
                }
                return count;

            },
            o.query = queryObj;
            o.out = "msg_query_count";

            MsgModel.mapReduce(o, function (err, results) {
                results.model.find().sort({"_id": -1}).exec(function (error, docs) {
                    if (err) {
                        logger.error(' createDateMsgCount getMsgCount ' + err);
                        reject({err:error});
                    } else {
                        logger.info(' createDateMsgCount getMsgCount ' + 'success');
                        resolve(docs);
                    }
                });
            })

        });
    }

    const PromiseForEach = (arr, callback)=>{
        let realResult = [];
        let result = Promise.resolve();
        arr.forEach((item, index) => {
            result = result.then(() => {
                return callback(item).then((res) => {
                    realResult.push(res);
                })
            })
        });

        return result.then(() => {
            return realResult
        });
    };

    //根据查询结果更新数据
    const UpdateCountInfo = (msgQueryCount) =>{
        return new Promise((resolve, reject) => {

            if(msgQueryCount.length == 0){
                logger.info(' createDateMsgCount UpdateCountInfo returnMsgLength=0 ' + 'success');
                return resolve({});
            }else{
                PromiseForEach(msgQueryCount, (item) => {
                    return new Promise((resolve, reject) => {
                        let dateMsgCountObj = {};
                        let queryDateMsg = DateMsgCountModel.find({});

                        dateMsgCountObj.m_count = item.value;
                        //添加更新条件
                        queryDateMsg.where('m_type').equals(item._id.type);
                        queryDateMsg.where('m_carrier').equals(item._id.carrier);
                        if(insterDate){
                            let date = moment(insterDate).format('YYYYMMDD');
                            queryDateMsg.where('m_date').equals(date);
                        }

                        //如果已存在 该日期，则更新信息
                        //如果不存在，新建数据
                        DateMsgCountModel.findOneAndUpdate(queryDateMsg,dateMsgCountObj,{new: true, upsert: true}).exec((error,rows)=> {
                            if (error) {
                                reject({err:error});
                            } else {
                                return resolve(rows);
                            }
                        });

                    })
                }).then((data) => {
                    resolve(data);
                }).catch((err) => {
                    console.log("失败");
                    console.log(err)
                });
            }


        });
    }

    const returnPushMsg = (result)=>{
        return new Promise(()=>{
            logger.info(' createDateMsgCount UpdateCountInfo ' + 'success');
            callback(null, result);
        });
    }

    delCountInfo()
        .then(createCountInfo)
        .then(getMsgCount)
        .then(UpdateCountInfo)
        .then(returnPushMsg)
        .catch((reject) =>{
            callback(null,null);
            return null;
        })
}
const createDateComCount = (params, callback) => {
    let today = new Date();
    let startDay = new Date(moment(today).add(-1, 'days').format('YYYY-MM-DD'));
    let endDay = new Date(moment(today).format('YYYY-MM-DD'));
    let insterDate = new Date(startDay);
    let returnMsg = [];

    //删除所有前一天数据
    const delCountInfo = () =>{
        return new Promise((resolve, reject) => {
            let query = DateComCountModel.find({});
            if(insterDate){
                let date = moment(insterDate).format('YYYYMMDD');
                query.where('c_date').equals(date);
            }

            DateComCountModel.deleteMany(query,function(error,result){
                if(error){
                    logger.error(' createDateComCount delCountInfo ' + error.message);
                    reject({err:error});
                }else{
                    logger.info(' createDateComCount delCountInfo ' + 'success');
                    resolve();
                }
            });

        });
    }

    //创建全部类型数据为0
    const createCountInfo = () =>{
        return new Promise((resolve, reject) => {
            let dateComCountArr = [];
            for(let type_i=1; type_i<3; type_i++) {
                for (let level_j = 1; level_j < 3; level_j++) {
                    let dateComCountObj = {};

                    //JS获取日期周数
                    let beginDate = new Date(insterDate.getFullYear(), 0, 1);

                    //date
                    let date = moment(insterDate).format('YYYYMMDD');
                    if(date){
                        dateComCountObj.c_date  = Number(date);
                    }

                    //日
                    let day = moment(insterDate).format('D');
                    if(day){
                        dateComCountObj.c_day  = Number(day);
                    }

                    //周
                    let week = Math.ceil((parseInt((insterDate - beginDate) / (24 * 60 * 60 * 1000)) + 1 + beginDate.getDay()) / 7);
                    if(week){
                        dateComCountObj.c_week  = Number(week);
                    }

                    //月
                    let month = moment(insterDate).format('M');
                    if(month){
                        dateComCountObj.c_month  = Number(month);
                    }

                    //年
                    let year = moment(insterDate).format('YYYY');
                    if(year){
                        dateComCountObj.c_year  = Number(year);
                    }

                    //年_月
                    let y_month = insterDate.getFullYear().toString() +  moment(insterDate).format('MM');
                    if(y_month){
                        dateComCountObj.y_month  = Number(y_month);
                    }

                    //年_星期
                    let y_week = insterDate.getFullYear().toString() + ('0' + week).substr(-2);
                    if(y_week){
                        dateComCountObj.y_week  = Number(y_week);
                    }

                    //文章类型
                    dateComCountObj.c_type = type_i;
                    //载体类型
                    dateComCountObj.c_level = level_j;
                    //文章统计数
                    dateComCountObj.c_count = 0;

                    dateComCountArr.push(dateComCountObj);
                }//for-j
            }//for-i

            //如果已存在 该日期，则更新信息
            //如果不存在，新建数据
            DateComCountModel.insertMany(dateComCountArr,function(error,result){
                if (error) {
                    logger.error(' createDateComCount createCountInfo ' + error.message);
                    reject({err:error});
                } else {
                    logger.info(' createDateComCount createCountInfo ' + 'success');
                    returnMsg.push(result);
                    resolve();
                }

            });

        });
    }

    //根据文章类型 载体类型 查询统计数
    const getComCount = () =>{
        return new Promise((resolve, reject) => {
            let o = {};
            let queryObj = {};
            if(startDay && endDay){
                queryObj.created_at = { $gte: Number(startDay), $lte: Number(endDay) };
            }

            o.map = function() { emit({type:this.msg_type,level:this.level}, this.status);},
                o.reduce = function(key, values) {
                    let count = 0;
                    for (let i=0;i<values.length;i++){
                        count+=1;
                    }
                    return count;

                },
                o.query = queryObj;
            o.out = "com_query_count";

            MsgCommentModel.mapReduce(o, function (err, results) {
                results.model.find().sort({"_id": -1}).exec(function (error, docs) {
                    if (err) {
                        logger.error(' createDateComCount getComCount ' + err);
                        reject({err:error});
                    } else {
                        logger.info(' createDateComCount getComCount ' + 'success');
                        resolve(docs);
                    }
                });
            })

        });
    }

    const PromiseForEach = (arr, callback)=>{
        let realResult = [];
        let result = Promise.resolve();
        arr.forEach((item, index) => {
            result = result.then(() => {
                return callback(item).then((res) => {
                    realResult.push(res);
                })
            })
        });

        return result.then(() => {
            return realResult
        });
    };

    //根据查询结果更新数据
    const UpdateCountInfo = (comQueryCount) =>{
        return new Promise((resolve, reject) => {

            if(comQueryCount.length == 0){
                logger.info(' createDateMsgCount UpdateCountInfo returnMsgLength=0 ' + 'success');
                return resolve({});
            }else{
                PromiseForEach(comQueryCount, (item) => {
                    return new Promise((resolve, reject) => {
                        let dateComCountObj = {};
                        let queryDateMsg = DateMsgCountModel.find({});

                        dateComCountObj.c_count = item.value;
                        //添加更新条件
                        queryDateMsg.where('c_type').equals(item._id.type);
                        queryDateMsg.where('c_level').equals(item._id.level);
                        if(insterDate){
                            let date = moment(insterDate).format('YYYYMMDD');
                            queryDateMsg.where('c_date').equals(date);
                        }

                        //如果已存在 该日期，则更新信息
                        //如果不存在，新建数据
                        DateComCountModel.findOneAndUpdate(queryDateMsg,dateComCountObj,{new: true, upsert: true}).exec((error,rows)=> {
                            if (error) {
                                reject({err:error});
                            } else {
                                return resolve(rows);
                            }
                        });

                    })
                }).then((data) => {
                    resolve(data);
                }).catch((err) => {
                    console.log("失败");
                    console.log(err)
                });
            }


        });
    }

    const returnPushMsg = (result)=>{
        return new Promise(()=>{
            logger.info(' createDateComCount UpdateCountInfo ' + 'success');
            callback(null, result);
        });
    }

    delCountInfo()
        .then(createCountInfo)
        .then(getComCount)
        .then(UpdateCountInfo)
        .then(returnPushMsg)
        .catch((reject) =>{
            callback(null,null);
            return null;
        })
}

module.exports = {
    getNewUserByMonth,
    getNewUserByWeek,
    getNewUserByDay,
    getNewMsgByMonth,
    getNewMsgByDay,
    getNewComByMonth,
    getNewComByDay,
    createDateUserCount,
    createDateMsgCount,
    createDateComCount
};
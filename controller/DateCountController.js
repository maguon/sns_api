"use strict"

const mongoose = require('mongoose');
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
                //按照载体类型分组 并统计
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
                dateUserCountObj.u_date  = Number(date);
            }

            //日
            let day = moment(today).format('D');
            if(day){
                dateUserCountObj.u_day  = Number(day);
            }

            //周
            let week = Math.ceil((parseInt((today - beginDate) / (24 * 60 * 60 * 1000)) + 1 + beginDate.getDay()) / 7);
            if(week){
                dateUserCountObj.u_week  = Number(week);
            }

            //月
            let month = moment(today).format('M');
            if(month){
                dateUserCountObj.u_month  = Number(month);
            }

            //年
            let year = moment(today).format('YYYY');
            if(year){
                dateUserCountObj.u_year  = Number(year);
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
            resUtil.resetQueryRes(res,result,null);
        });
    }

    delCountInfo()
        .then(createCountInfo)
        .then(getMsgCount)
        .then(UpdateCountInfo)
        .then(returnPushMsg)
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
                dateCountComObj.c_date  = Number(date);
            }

            //日
            let day = moment(today).format('D');
            if(day){
                dateCountComObj.c_day  = Number(day);
            }

            //周
            let week = Math.ceil((parseInt((today - beginDate) / (24 * 60 * 60 * 1000)) + 1 + beginDate.getDay()) / 7);
            if(week){
                dateCountComObj.c_week  = Number(week);
            }

            //月
            let month = moment(today).format('M');
            if(month){
                dateCountComObj.c_month  = Number(month);
            }

            //年
            let year = moment(today).format('YYYY');
            if(year){
                dateCountComObj.c_year  = Number(year);
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
                queryDateComCount.where('c_date').equals(date);
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
    getNewMsgByMonth,
    getNewMsgByDay,
    createDateUserCount,
    createDateMsgCount,
    createDateComCount
};
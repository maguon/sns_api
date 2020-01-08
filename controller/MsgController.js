"use strict"
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const moment = require('moment');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const sysConsts = require('../util/SystemConst');
const logger = serverLogger.createLogger('MsgController');

const {MsgModel} = require('../modules');
const {UserDetailModel} = require('../modules');

const getMsg = (req, res, next) =>{
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

    if(params.sendMsgUserId){
        if(params.sendMsgUserId.length == 24){
            matchObj._user_id = mongoose.mongo.ObjectId(params.sendMsgUserId);
        }else{
            logger.info('getAllMsg  sendMsgUserId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.msgId){
        if(params.msgId.length == 24){
            matchObj._id = mongoose.mongo.ObjectId(params.msgId);
        }else{
            logger.info('getAllMsg  msgId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MSG_ID_NULL_ERROR);
            return next();
        }
    }
    if(params.type){
        matchObj.type = Number(params.type);
    }
    if(params.carrier){
        matchObj.carrier = Number(params.carrier);
    }
    if (params.status) {
        matchObj.status = Number(params.status);
    }
    aggregate_limit.push({
        $match: matchObj
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
    MsgModel.aggregate(aggregate_limit).exec((error,rows)=> {
        if (error) {
            logger.error(' getAllMsg ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            console.log('rows:',rows);
            logger.info(' getAllMsg ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getMsgCount = (req, res, next) => {
    let params = req.query;
    let aggregate_limit = [];
    if(params.msgUserId){
        if(params.msgUserId.length == 24){
            aggregate_limit.push({
                $match: {
                    _user_id :  mongoose.mongo.ObjectId(params.msgUserId)
                }
            });
        }else{
            logger.info('getMsgCount userID format incorrect!');
            resUtil.resetQueryRes(res,[],null);
            return next();
        }
    }
    aggregate_limit.push({
        $group: {
            _id: {type:"$type"},
            count:{$sum:1}
        }
    });

    MsgModel.aggregate(aggregate_limit).exec((error,rows)=> {
        if (error) {
            logger.error(' getMsgCount ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            console.log('rows:',rows);
            logger.info(' getMsgCount ' + 'success');

            let total = 0;
            for (let num in rows) {
                total += rows[num].count;
            }
            let returnMsg = {
                groupCount: rows,
                countSum: total
            }
            resUtil.resetQueryRes(res, returnMsg);
            return next();
        }
    });
}
const createMsg = (req, res, next) => {
    let path = req.params;
    let bodyParams = req.body;
    let msgObj = bodyParams;
    if(bodyParams.addressName){
        msgObj.address_name = bodyParams.addressName ;
    }
    if(bodyParams.addressReal){
        msgObj.address_real = bodyParams.addressReal ;
    }
    if(bodyParams.addressShow){
        msgObj.address_show = bodyParams.addressShow ;
    }
    if(bodyParams.locationName){
        msgObj.location_name = bodyParams.locationName ;
    }
    if(bodyParams.locationReal){
        msgObj.location_real = bodyParams.locationReal ;
    }
    msgObj.status = sysConsts.INFO.status.available;
    msgObj.comment_status = sysConsts.MSG.com_status.visible;
    msgObj.collect_num = 0;
    msgObj.comment_num = 0;
    msgObj.agree_num = 0;
    msgObj.read_num = 0;
    if(path.userId){
        if(path.userId.length == 24){
            msgObjs._user_id = mongoose.mongo.ObjectId(path.userId);
        }else{
            logger.info('createMsg  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    const saveMsg =()=>{
        return new Promise((resolve, reject) => {
            let msgModel = new MsgModel(msgObj);
            msgModel.save(function(error,result){
                if (error) {
                    logger.error(' createMsg saveMsg ' + error.message);
                    reject({err:reject.message});
                } else {
                    logger.info(' createMsg saveMsg ' + 'success');
                    resolve(result);
                }
            })
        });
    }
    const updateUserNumber =(returnMsg)=>{
        return new Promise(() => {
            let queryUser = UserDetailModel.find({});
            if(path.userId){
                if(path.userId.length == 24){
                    queryUser.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
                }else{
                    logger.info('createMsg updateUserNumber _user_id format incorrect!');
                    return next();
                }
            }
            if(bodyParams.type == 1){
                //文章字段加一
                UserDetailModel.findOneAndUpdate(queryUser,{ $inc: { msg_num: 1 } }).exec((error,rows)=> {
                    if (error) {
                        logger.error(' createMsg updateUserNumber ' + error.message);
                    } else {
                        logger.info(' createMsg updateUserNumber ' + 'success');
                        resUtil.resetCreateRes(res, returnMsg);
                        return next();
                    }
                });
            }else{
                //求助字段加一
                UserDetailModel.findOneAndUpdate(queryUser,{ $inc: { msg_help_num: 1 } }).exec((error,rows)=> {
                    if (error) {
                        logger.error(' createMsg updateUserNumber ' + error.message);
                    } else {
                        logger.info(' createMsg updateUserNumber ' + 'success');
                        resUtil.resetCreateRes(res, returnMsg);
                        return next();
                    }
                });
            }

        });
    }
    saveMsg()
        .then(updateUserNumber)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }else{
                resUtil.resetFailedRes(res,reject.msg);
            }
        })
}
const updateMsgStatus = (req, res, next) => {
    let path = req.params;
    let queryMessge = MsgModel.find({});
    if(path.userId){
        if(path.userId.length == 24){
            queryMessge.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('updateMsgStatus  userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.msgId){
        if(path.msgId.length == 24){
            queryMessge.where('_id').equals(mongoose.mongo.ObjectId(path.msgId));
        }else{
            logger.info('updateMsgStatus  msgId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MSG_ID_NULL_ERROR);
            return next();
        }
    }
    MsgModel.updateOne(queryMessge,{status:sysConsts.INFO.status.disable},function(error,result){
        if (error) {
            logger.error(' updateMsgStatus updateMsg ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateMsgStatus updateMsg ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
const searchByRadius = (req, res, next) => {
    let params = req.query;
    let arr =[];
    let str=params.address.slice(1,params.address.length-1);
    arr = str.split(',');
    let sort = {'updated_at':-1};                              //排序（按登录时间倒序）
    let query = MsgModel.find({ 'address' : { $geoWithin :{ $center : [ arr , params.radius ] }},status:1}).sort(sort);
    if(params.start && params.size){
        query.skip(parseInt(params.start)).limit(parseInt(params.size));
    }
    query.exec((error, rows)=> {
        if (error) {
            logger.error(' SearchByRadius ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' SearchByRadius ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const deleteMsg = (req, res, next) => {
    let path = req.params;
    let query = MsgModel.find({});
    if(path.userId){
        if(path.userId.length == 24){
            query.where('_user_id').equals(mongoose.mongo.ObjectId(path.userId));
        }else{
            logger.info('deleteMsg userID format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.CUST_ID_NULL_ERROR);
            return next();
        }
    }
    if(path.msgId){
        if(path.msgId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.msgId));
        }else{
            logger.info('deleteMsg msgId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MSG_ID_NULL_ERROR);
            return next();
        }
    }
    MsgModel.deleteOne(query,function(error,result){
        if(error){
            logger.error('deleteMsg ' + error.message);
            resUtil.resInternalError(error,res,next);
        }else{
            logger.info('deleteMsg ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
const getMsgByAdmin = (req, res, next) => {
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
    if (params.userId){
        if (params.userId.length == 24) {
            matchObj._user_id = mongoose.mongo.ObjectId(params.userId);
        } else {
            logger.info('getMsgByAdmin userID format incorrect!');
            resUtil.resetQueryRes(res, [], null);
            return next();
        }
    }
    if(params.msgId){
        if(params.msgId.length == 24){
            matchObj._id = mongoose.mongo.ObjectId(params.msgId);
        }else{
            logger.info('getMsgByAdmin  msgId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MSG_ID_NULL_ERROR);
            return next();
        }
    }
    if (params.nickName) {
        matchObj["user_detail_info.nick_name"] = {"$regex": params.nickName, "$options": "$ig"};
    }
    if(params.type){
        matchObj.type = Number(params.type);
    }
    if(params.carrier){
        matchObj.carrier = Number(params.carrier);
    }
    if (params.createDateStart && params.createDateEnd) {
        matchObj.created_at = {$gte: new Date(params.createDateStart), $lte: new Date(params.createDateEnd)};
    }
    if (params.status) {
        matchObj.status = Number(params.status);
    }
    aggregate_limit.push({
        $match: matchObj
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
    MsgModel.aggregate(aggregate_limit).exec((error,rows)=> {
        if (error) {
            logger.error(' getMsgByAdmin ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            console.log('rows:',rows);
            logger.info(' getMsgByAdmin ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getMsgCountByAdmin = (req, res, next) => {
    let query = MsgModel.find({});
    query.countDocuments().exec((error,rows)=> {
        if (error) {
            logger.error(' getMsgCountByAdmin ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getMsgCountByAdmin ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const getTodayMsgCountByAdmin = (req, res, next) => {
    let aggregate_limit = [];
    let today = new Date();
    let startDay = new Date(moment(today).format('YYYY-MM-DD'));
    let endDay = new Date(moment(today).add(1, 'days').format('YYYY-MM-DD'));
    if(startDay && endDay){
        aggregate_limit.push({
            $match: {
                created_at :  {$gte: startDay,$lt: endDay}
            }
        });
    }
    aggregate_limit.push({
        $group: {
            _id: {type:"$type"},
            count:{$sum:1}
        }
    });
    MsgModel.aggregate(aggregate_limit).exec((error,rows)=> {
        if (error) {
            logger.error(' getTodayMsgCountByAdmin ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getTodayMsgCountByAdmin ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const deleteMsgByAdmin = (req, res, next) => {
    let path = req.params;
    let query = MsgModel.find({});
    if(path.msgId){
        if(path.msgId.length == 24){
            query.where('_id').equals(mongoose.mongo.ObjectId(path.msgId));
        }else{
            logger.info('deleteMsgByAdmin msgId format incorrect!');
            resUtil.resetUpdateRes(res,null,systemMsg.MSG_ID_NULL_ERROR);
            return next();
        }
    }
    MsgModel.deleteOne(query,function(error,result){
        if(error){
            logger.error('deleteMsgByAdmin ' + error.message);
            resUtil.resInternalError(error,res,next);
        }else{
            logger.info('deleteMsgByAdmin ' + 'success');
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
module.exports = {
    getMsg,
    getMsgCount,
    createMsg,
    updateMsgStatus,
    searchByRadius,
    deleteMsg,
    getMsgByAdmin,
    getMsgCountByAdmin,
    getTodayMsgCountByAdmin,
    deleteMsgByAdmin
};
"use strict"

const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const systemMsg = require('../util/SystemMsg');
const logger = serverLogger.createLogger('MessageController');

const {MessageModel} = require('../modules');

const getMessage = (req, res, next) => {
    let params = req.query;
    let query = MessageModel.find({status:1});

    if(params.messagesId){
        query.where('_id').equals(params.messagesId);
    }
    if(params.userId){
        query.where('_userId').equals(params.userId);
    }
    if(params.type){
        query.where('type').equals(params.type);
    }
    if(params.info){
        query.where('info').equals(params.info);
    }
    if(params.collectnum){
        query.where('collectnum').equals(params.collectnum);
    }
    if(params.commentnum){
        query.where('commentnum').equals(params.commentnum);
    }
    if(params.agreenum){
        query.where('agreenum').equals(params.agreenum);
    }
    if(params.readnum){
        query.where('readnum').equals(params.readnum);
    }
    if(params.label){
        query.where('label').equals(params.label);
    }
    if(params.Multi_Media){
        query.where('Multi_Media').equals(params.Multi_Media);
    }
    if(params.status){
        query.where('status').equals(params.status);
    }

    query.exec((error,rows)=> {
        if (error) {
            logger.error(' getMessage ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' getMessage ' + 'success');
            resUtil.resetQueryRes(res, rows);
            return next();
        }
    });
}
const  createMessage = (req, res, next) => {
    let bodyParams = req.body;
    let messageObj = bodyParams;

    let messageModel = new MessageModel(messageObj);
    messageModel.save(function(error,result){
        if (error) {
            logger.error(' createMessage ' + error.message);
            resUtil.resInternalError(error,res);
        } else {
            logger.info(' createMessage ' + 'success');
            resUtil.resetCreateRes(res, result);
            return next();
        }
    })
}
const  updateMessageStatusToAdmin = (req, res, next) => {
    let bodyParams = req.body;

    let query = MessageModel.find({});
    let params = req.params;
    let statusValue;

    //判断此管理员是否有权限修改
    if(params.adminId){
        console.log(params.adminId);
    }
    if(params.messagesId){
        query.where('_id').equals(params.messagesId);
    }
    if(params.status){
        statusValue = Number(params.status);
    }

    MessageModel.updateOne(query,bodyParams,function(error,result){
        if (error) {
            logger.error(' updateMessageStatusToAdmin ' + error.message);
            resUtil.resInternalError(error);
        } else {
            logger.info(' updateMessageStatusToAdmin ' + 'success');
            console.log('rows:',result);
            resUtil.resetUpdateRes(res,result,null);
            return next();
        }
    })
}
//删除用户信息时，同时删除用户详细信息
const  deleteMessage = (req, res, next) => {
    let userId;

    const deleteUser = () =>{
        return new Promise((resolve, reject)=> {
            let query = MessageModel.find({});
            let params = req.params;

            if(params.userId){
                userId = params.userId;
                query.where('_id').equals(params.userId);
            }

            MessageModel.deleteOne(query,function(error,result){
                if (error) {
                    logger.error(' deleteUserInfo deleteUser ' + error.message);
                    reject({err:error});
                    // resUtil.resInternalError(error);
                } else {
                    logger.info(' deleteUserInfo deleteUser ' + 'success');
                    resolve();
                    // console.log('rows:',result);
                    // resUstil.resetQueryRes(res,result,null);
                    // return next();
                }
            })
        });
    }

    const deleteUserDetail = () => {
        return new Promise((resolve, reject) => {
            let query = UserDetailModel.find({});

            if(userId){
                query.where('_userId').equals(userId);
            }

            UserDetailModel.deleteOne(query,function(error,result){
                if (error) {
                    logger.error(' deleteUserInfo deleteUserDetail ' + error.message);
                    resUtil.resInternalError(error);
                } else {
                    logger.info(' deleteUserInfo deleteUserDetail ' + 'success');
                    resUtil.resetQueryRes(res,result,null);
                    return next();
                }
            })
        });
    }

    deleteUser()
        .then(deleteUserDetail)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }else{
                resUtil.resetFailedRes(res,systemMsg.USER_DELETE_INFO);
            }
        })

}
//根据坐标和半径，进行半径查询(分页查询)
const SearchByRadius = (req, res, next) => {
    let params = req.query;
    let arr =[];
    let str=params.address.slice(1,params.address.length-1);
    arr = str.split(',');
    console.log(typeof arr);

    let  pageSize = Number(params.pageSize);                   //一页多少条
    let currentPage = Number(params.currentPage);                //当前第几页
    let sort = {'updated_at':-1};        //排序（按登录时间倒序）
    let skipnum = (currentPage - 1) * pageSize;   //跳过数

    let query = MessageModel.find({ 'address' : { $geoWithin :{ $center : [ arr , params.radius ] }},status:1}).skip(skipnum).limit(pageSize).sort(sort);

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
module.exports = {
    getMessage,
    createMessage,
    deleteMessage,
    updateMessageStatusToAdmin,
    SearchByRadius
};
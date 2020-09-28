"use strict"
const mongoose = require('mongoose');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const logger = serverLogger.createLogger('AdminMenuListController');

const {AdminUserModel} = require('../modules');
const {AdminMenuListModel} = require('../modules');

const getMenuList = (req, res, next) => {
    let path = req.params;
    let params = req.query;

    const getType =()=>{
        return new Promise((resolve, reject) => {
            let query = AdminUserModel.find({},{password:0});
            if(path.adminId){
                if(path.adminId.length == 24){
                    query.where('_id').equals(mongoose.mongo.ObjectId(path.adminId));
                }else{
                    logger.info(' getMenuList getType ID format incorrect!');
                    resUtil.resetQueryRes(res,[],null);
                    return next();
                }
            }
            query.exec((error,rows)=> {
                if (error) {
                    logger.error(' getMenuList getType ' + error.message);
                    reject({err:error});
                } else {
                    logger.info(' getMenuList getType ' + 'success');
                    if(rows.length == 0 ){
                        resolve(rows);
                    }else{
                        resolve(rows[0]._doc.type);
                    }
                }
            });
        });
    }

    const getMenu =(adminType)=>{
        return new Promise(()=>{
            let queryMenu = AdminMenuListModel.find({});

            if(adminType.length !=0 && params.type) {
                queryMenu.where('type').equals(adminType>params.type ? params.type : adminType);
            }else{
                if(adminType.length !=0) {
                    queryMenu.where('type').equals(adminType);
                }
            }

            queryMenu.exec((error,rows)=> {
                if (error) {
                    logger.error(' getMenuList getMenu ' + error.message);
                    resUtil.resInternalError(error,res);
                } else {
                    logger.info(' getMenuList getMenu ' + 'success');
                    resUtil.resetQueryRes(res, rows);
                    return next();
                }
            });
        });
    }

    getType()
        .then(getMenu)
        .catch((reject)=>{
            if(reject.err){
                resUtil.resetFailedRes(res,reject.err);
            }else{
                resUtil.resetFailedRes(res,reject.msg);
            }
        })

}
const createMenuList = (req, res, next) => {
    let bodyParams = req.body;
    let menuListObj = bodyParams;
    //判断type 唯一
    let queryType = AdminMenuListModel.find({});
    if(bodyParams.type){
        queryType.where('type').equals(bodyParams.type);
    }
    AdminMenuListModel.findOneAndUpdate(queryType,menuListObj,{new: true, upsert: true}).exec((error,rows)=> {
        if (error) {
            logger.error(' createMenuList ' + error.message);
        } else {
            logger.info(' createMenuList ' + 'success');
            resUtil.resetCreateRes(res, rows);
            return next();
        }
    });
}

module.exports = {
    getMenuList,
    createMenuList
};
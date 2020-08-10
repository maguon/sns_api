"use strict"
/**
 * Created by yym on 20-8-10.
 */
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const logger = serverLogger.createLogger('AppLog');

const printLog = (req, res, next) => {
    let bodyParams = req.body;
    if(bodyParams.content){
        logger.info(' printLog ' + bodyParams.content + ' success');
        resUtil.resetQueryRes(res, bodyParams.content);
    }
}

module.exports = {
    printLog
};
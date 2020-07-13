/**
 * Created by yym on 2020/7/10.
 */

const serverLogger = require('./util/ServerLogger');
const logger = serverLogger.createLogger('Timer');
const later = require('later');
const dateCountController = require('./controller/DateCountController');

/**
 * Daily timing statistics
 */

//设置每天凌晨执行

let basic = {h:[1],m:[0]};
let composite=[
    basic
];
let sched= {
    schedules: composite
};

//默认UTF时区
later.date.UTC();

//设置本地时区
later.date.localTime();

function dateCounts() {
    //用户新增统计
    dateCountController.createDateUserCount({},function (err,result) {
        if(err){
            logger.error(' timer UserCount ' + err);
        }else{
            logger.info(' timer UserCount ' + 'success');
        }
    });

    //文章新增统计
    dateCountController.createDateMsgCount({},function (err,result) {
        if(err){
            logger.error(' timer MsgCount ' + err);
        }else{
            logger.info(' timer MsgCount ' + 'success');
        }
    });

    //评论新增统计
    dateCountController.createDateComCount({},function (err,result) {
        if(err){
            logger.error(' timer ComCount ' + err);
        }else{
            logger.info(' timer ComCount ' + 'success');
        }
    });
}

later.setInterval(dateCounts,sched);



const path = require('path');
const restify = require('restify');
const Errors = require('restify-errors');
const corsMiddleware = require('restify-cors-middleware')

const serverLogger = require('./util/ServerLogger');
const logger = serverLogger.createLogger('Server');

import {AdminUserController} from './controller';
import {UserController} from './controller';
import {UserDetailController} from './controller';
import {UserDriveController} from './controller';
import {UserDeviceController} from './controller';
import {UserRelationController} from './controller';
import {UserVoteController} from './controller';
import {UserLocaCollController} from './controller';
import {UserMsgCollController} from './controller';
import {UserPraiseController} from './controller';
import {MsgController} from './controller';
import {MsgCommentController} from './controller';
import {VoteController} from  './controller';
import {SysMsgController} from  './controller';
import {PrivacieController} from  './controller';
import {NoticeController} from  './controller';
import {ReportController} from  './controller';
import {AboutController} from './controller';
import {AppController} from './controller';
import {SmsController} from './controller';
import {InfoController} from './controller';
import {PushMsgController} from './controller';
import {DateCountController} from './controller';
import {AppLog} from './controller';

/**
 * Returns a server with all routes defined on it
 */
const createServer=()=>{
    // Create a server with our logger and custom formatter
    // Note that 'version' means all routes will default to
    // 1.0.0
    const server = restify.createServer({

        name: 'SNS-API',
        version: '0.0.1',
        maxParamLength: 500
    });

    server.pre(restify.pre.sanitizePath());
    server.pre(restify.pre.userAgentConnection());

    const corsAllowHeadersArray =[]
    corsAllowHeadersArray.push('auth-token');
    corsAllowHeadersArray.push('user-name');
    corsAllowHeadersArray.push('user-type');
    corsAllowHeadersArray.push('user-id');
    corsAllowHeadersArray.push("Access-Control-Allow-Origin");
    corsAllowHeadersArray.push("Access-Control-Allow-Credentials");
    corsAllowHeadersArray.push("GET","POST","PUT","DELETE");
    corsAllowHeadersArray.push("Access-Control-Allow-Headers","accept","api-version", "content-length", "content-md5","x-requested-with","content-type", "date", "request-id", "response-time");
    const cors = corsMiddleware({

        allowHeaders:corsAllowHeadersArray
    })
    server.pre(cors.preflight);
    server.use(cors.actual);

    server.use(restify.plugins.throttle({
        burst: 100,
        rate: 50,
        ip: true
    }));

    server.use(restify.plugins.bodyParser({uploadDir:__dirname+'/../uploads/'}));
    server.use(restify.plugins.acceptParser(server.acceptable));
    server.use(restify.plugins.dateParser());
    server.use(restify.plugins.authorizationParser());
    server.use(restify.plugins.queryParser());
    server.use(restify.plugins.gzipResponse());

    /*var STATIS_FILE_RE = /\.(css|js|jpe?g|png|gif|less|eot|svg|bmp|tiff|ttf|otf|woff|pdf|ico|json|wav|ogg|mp3?|xml|woff2|map)$/i;
    server.get('/'+STATIS_FILE_RE, restify.plugins.serveStaticFiles('./public/docs',{ default: 'index.html', maxAge: 0 }));


    server.get('/('+/\.html$/i+")",restify.plugins.serveStatic({
        directory: './public/docs',
        maxAge: 0}));
    server.get('/'+/\.html\?/i,restify.plugins.serveStatic({
        directory: './public/docs',
        maxAge: 0}));*/

    /*server.get('/docs/!*',restify.plugins.serveStatic({
        directory: './public/docs',
        maxAge: 36000
    }));*/
    server.get('/docs/*', // don't forget the `/*`
        restify.plugins.serveStaticFiles('./public/docs')
    );

    /**
     adminInfo   -管理员管理
     */
    server.get('/api/admin/:adminId/adminUser', AdminUserController.getAdminUser);
    server.post({path:'/api/admin/:adminId/adminUser',contentType: 'application/json'}, AdminUserController.createAdminUser);
    server.put({path:'/api/admin/:adminId/adminUser/:adminUserId',contentType: 'application/json'} ,AdminUserController.updateAdminUserInfo);
    server.put({path:'/api/admin/:adminId/adminUser/:adminUserId/status',contentType: 'application/json'} ,AdminUserController.updateAdminUserStatus);
    server.post({path:'/api/adminLogin',contentType: 'application/json'}, AdminUserController.adminUserLogin);

    /**
     userInfo   -用户管理
     */
    server.post({path:'/api/userLogin',contentType: 'application/json'}, UserController.userLogin);
    server.post({path:'/api/user/:userId/userLogout',contentType: 'application/json'}, UserController.userLogout);
    server.post({path:'/api/user',contentType: 'application/json'}, UserController.createUser);
    server.get('/api/user', UserController.getUser);
    server.get('/api/user/:userId/userInfoAndDetail', UserController.getUserInfoAndDetail);
    server.get('/api/user/:userId/token/:token', UserController.getUserToken);
    server.put({path:'/api/user/:userId/type',contentType: 'application/json'} ,UserController.updateUserType);
    server.put({path:'/api/user/:userId/password',contentType: 'application/json'},UserController.updatePassword);
    server.put({path:'/api/phone/:phone/password',contentType: 'application/json'},UserController.updatePasswordByPhone);
    server.put({path:'/api/user/:userId/phone',contentType: 'application/json'},UserController.updatePhone);
    server.put({path:'/api/user/:userId/authStatus',contentType: 'application/json'} ,UserController.updateUserAuthStatus);

    server.get('/api/admin/:adminId/user', UserController.getUserByAdmin);
    server.get('/api/admin/:adminId/userCount', UserController.getUserCountByAdmin);
    server.get('/api/admin/:adminId/userTodayCount', UserController.getUserTodayCountByAdmin);
    server.put({path:'/api/admin/:adminId/user/:userId/status',contentType: 'application/json'} ,UserController.updateUserStatus);
    server.post({path:'/api/admin/:adminId/fakeUser',contentType: 'application/json'}, UserController.createFakeUserByAdmin);
    server.get('/api/admin/:adminId/fakeUser', UserController.getFakeUserByAdmin);

    /**
     userDetail    -用户详细信息
     */
    server.get('/api/user/:userId/userDetail', UserDetailController.getUserDetail);
    server.put({path:'/api/user/:userId/userDetail/:userDetailId',contentType: 'application/json'} ,UserDetailController.updateUserDetailInfo);
    server.put({path:'/api/user/:userId/avatarImage',contentType: 'application/json'},UserDetailController.updateAvatarImage);
    server.put({path:'/api/admin/:adminId/fakeUser/:fakeUserId/fakeUserDetail',contentType: 'application/json'} ,UserDetailController.updateFakeUserDetailByAdmin);
    server.put({path:'/api/admin/:adminId/fakeUser/:fakeUserId/avatarImage',contentType: 'application/json'},UserDetailController.updateFakeUserAvatarImageByAdmin);

    /**
     userDrive    -用户驾驶信息
     */
    server.get('/api/user/:userId/userDrive', UserDriveController.getUserDrive);
    server.put({path:'/api/user/:userId/userDrive/:userDriveId',contentType: 'application/json'} ,UserDriveController.updateUserDriveInfo);

    /**
     userDevice    -用户设备信息
     */
    server.post({path:'/api/user/:userId/userDevice',contentType: 'application/json'}, UserDeviceController.createUserDevice);

    server.get('/api/admin/:adminId/userDevice', UserDeviceController.getUserDeviceByAdmin);

    /**
     userRelation    -用户关系
     */
    server.post({path:'/api/user/:userId/userRelation',contentType: 'application/json'}, UserRelationController.createUserRelation);
    server.get('/api/user/:userId/follow', UserRelationController.getFollow);
    server.get('/api/user/:userId/followCount', UserRelationController.getFollowCount);
    server.get('/api/user/:userId/followUserInfo', UserRelationController.getFollowUserInfo);
    server.get('/api/user/:userId/attention', UserRelationController.getAttention);
    server.get('/api/user/:userId/attentionCount', UserRelationController.getAttentionCount);
    server.get('/api/user/:userId/attentionUserInfo', UserRelationController.getAttentionUserInfo);
    server.del({path:'/api/user/:userId/followUser/:followUserId/del',contentType: 'application/json'},UserRelationController.deleteUserRelation);

    server.get('/api/admin/:adminId/friend', UserRelationController.getFriend);
    server.get('/api/admin/:adminId/user/:userId/follow', UserRelationController.getFollow);
    server.get('/api/admin/:adminId/user/:userId/followUserInfo', UserRelationController.getFollowUserInfo);
    server.get('/api/admin/:adminId/user/:userId/attention', UserRelationController.getAttention);
    server.get('/api/admin/:adminId/user/:userId/attentionUserInfo', UserRelationController.getAttentionUserInfo);

    /**
     userPraise   -用户点赞记录
     */
    server.post({path:'/api/user/:userId/userPraise',contentType: 'application/json'}, UserPraiseController.createUserPraise);
    server.get('/api/user/:userId/getUserPraise', UserPraiseController.getUserPraise);
    server.get('/api/user/:userId/getUserBePraise', UserPraiseController.getUserBePraise);

    server.get('/api/admin/:adminId/getUserPraise', UserPraiseController.getUserPraiseByAdmin);

    /**
     userVote   -用户投票记录
     */
    server.post({path:'/api/user/:userId/userVote',contentType: 'application/json'}, UserVoteController.createUserVote);
    server.get('/api/user/:userId/getUserVote', UserVoteController.getUserVote);

    server.get('/api/admin/:adminId/getUserVote', UserVoteController.getUserVoteByAdmin);

    /**
     userLocaColls    -用户地理位置收藏
     */
    server.post({path:'/api/user/:userId/userLocaColl',contentType: 'application/json'}, UserLocaCollController.createUserLocaColl);
    server.get('/api/user/:userId/userLocaColl', UserLocaCollController.getUserLocaColl);
    server.del({path:'/api/user/:userId/userLocaColl/:userLocaCollId/del',contentType: 'application/json'},UserLocaCollController.deleteLocaColl);

    server.get('/api/admin/:adminId/userLocaColl', UserLocaCollController.getUserLocaColl);

    /**
     userMsgColls    -用户微博收藏
     */
    server.post({path:'/api/user/:userId/userMsgColl',contentType: 'application/json'}, UserMsgCollController.createUserMsgColl);
    server.get('/api/user/:userId/userMsgColl', UserMsgCollController.getUserMsgColl);
    server.del({path:'/api/user/:userId/userMsgColl/:userMsgCollId/del',contentType: 'application/json'},UserMsgCollController.deleteMsgColl);

    server.get('/api/admin/:adminId/userMsgColl', UserMsgCollController.getUserMsgColl);

    /**
     msg    -微博动态
     */
    server.post({path:'/api/user/:userId/msg',contentType: 'application/json'}, MsgController.createMsg);
    server.get('/api/user/:userId/msg', MsgController.getMsg);
    server.get('/api/user/:userId/popularMsg', MsgController.getPopularMsg);
    server.get('/api/user/:userId/followUserMsg', MsgController.getFollowUserMsg);
    server.get('/api/user/:userId/msgCount', MsgController.getMsgCount);
    server.get('/api/user/:userId/nearbyMsg', MsgController.getNearbyMsg);
    server.put({path:'/api/user/:userId/msg/:msgId/status',contentType: 'application/json'} ,MsgController.updateMsgStatus);
    server.del({path:'/api/user/:userId/msg/:msgId/del',contentType: 'application/json'},MsgController.deleteMsg);

    server.get('/api/admin/:adminId/msg', MsgController.getMsgByAdmin);
    server.get('/api/admin/:adminId/msgCount', MsgController.getMsgCountByAdmin);
    server.get('/api/admin/:adminId/todayMsgCount', MsgController.getTodayMsgCountByAdmin);
    server.get('/api/admin/:adminId/nearbyMsg', MsgController.getNearbyMsg);
    server.put({path:'/api/admin/:adminId/msg/:msgId/status',contentType: 'application/json'} ,MsgController.updateMsgStatus);
    server.del({path:'/api/admin/:adminId/msg/:msgId/del',contentType: 'application/json'},MsgController.deleteMsgByAdmin);
    server.post({path:'/api/admin/:adminId/fakeUser/:fakeUserId/msg',contentType: 'application/json'}, MsgController.createMsgByAdmin);

     /**
     MsgComment   - 评论
     */
    server.get('/api/user/:userId/userMsgComment', MsgCommentController.getUserMsgComment);
    server.get('/api/user/:userId/userBeMsgComment', MsgCommentController.getUserBeMsgComment);
    server.get('/api/user/:userId/allMsgComment', MsgCommentController.getAllMsgComment);
    server.post({path:'/api/user/:userId/msgComment',contentType: 'application/json'}, MsgCommentController.createMsgComment);
    server.del({path:'/api/user/:userId/msgCom/:msgComId/del',contentType: 'application/json'},MsgCommentController.deleteComment);

    server.get('/api/admin/:adminId/msgComment', MsgCommentController.getMsgCommentByAdmin);
    server.get('/api/admin/:adminId/msgCommentCount', MsgCommentController.getMsgCommentCountByAdmin);
    server.get('/api/admin/:adminId/todayMsgCommentCount', MsgCommentController.getMsgCommentTodayCountByAdmin);
    server.put({path:'/api/admin/:adminId/msgCom/:msgComId/status',contentType: 'application/json'} ,MsgCommentController.updateStatusByAdmin);
    server.del({path:'/api/admin/:adminId/msgCom/:msgComId/del',contentType: 'application/json'},MsgCommentController.deleteCommentByAdmin);

    /**
     vote      - 投票信息
     */
    server.get('/api/user/:userId/vote', VoteController.getVote);

    server.post({path:'/api/admin/:adminId/vote',contentType: 'application/json'}, VoteController.createVote);
    server.get('/api/admin/:adminId/vote', VoteController.getVoteByAdmin);
    server.put({path:'/api/admin/:adminId/vote/:voteId/info',contentType: 'application/json'} ,VoteController.updateVote);
    server.put({path:'/api/admin/:adminId/vote/:voteId/status',contentType: 'application/json'} ,VoteController.updateStatusByAdmin);
    server.del({path:'/api/admin/:adminId/vote/:voteId/del',contentType: 'application/json'},VoteController.deleteVoteByAdmin);

    /**
     sysMsg     - 系统消息
     */
    server.get('/api/user/:userId/sysMsg', SysMsgController.getSysMsg);

    server.get('/api/admin/:adminId/sysMsg', SysMsgController.getSysMsgByAdmin);
    server.post({path:'/api/admin/:adminId/sysMsg',contentType: 'application/json'}, SysMsgController.createSysMsg);
    server.put({path:'/api/admin/:adminId/sysMsg/:sysMsgId/status',contentType: 'application/json'} ,SysMsgController.updateStatusByAdmin);
    server.del({path:'/api/admin/:adminId/sysMsg/:sysMsgId/del',contentType: 'application/json'},SysMsgController.deleteSysMsg);

    /**
     info     - 提示消息
     */
    server.get('/api/user/:userId/info', InfoController.getInfo);
    server.get('/api/user/:userId/infoCount', InfoController.getInfoCount);
    server.put({path:'/api/user/:userId/type/:type/status',contentType: 'application/json'} ,InfoController.updateStatus);

    /**
     blockList     - 黑名单
     */
    server.post({path:'/api/user/:userId/blockUser/:blockUserId/add',contentType: 'application/json'}, UserDetailController.createBlockList);
    server.get('/api/user/:userId/blockList', UserDetailController.getBlockList);
    server.del({path:'/api/user/:userId/blockUser/:blockUserId/del',contentType: 'application/json'}, UserDetailController.delBlockList);

    server.get('/api/admin/:adminId/user/:userId/blockList', UserDetailController.getBlockList);

    /**
     privacie     - 隐私设置
     */
    server.get('/api/user/:userId/privacie', PrivacieController.getPrivacieByUser);
    server.put({path:'/api/user/:userId/privacie/:privacieId/privacie',contentType: 'application/json'} ,PrivacieController.updatePrivacie);

    server.get('/api/admin/:adminId/privacie', PrivacieController.getPrivacieByAdmin);

    /**
     notice     - 通知设置
     */
    server.get('/api/user/:userId/notice', NoticeController.getNoticeByUser);
    server.put({path:'/api/user/:userId/notice/:noticeId/notice',contentType: 'application/json'} ,NoticeController.updateNotice);

    server.get('/api/admin/:adminId/notice', NoticeController.getNoticeByAdmin);

    /**
     report     - 举报设置
     */
    server.post({path:'/api/user/:userId/msg/:msgId/report',contentType: 'application/json'}, ReportController.createReport);
    server.get('/api/user/:userId/msg/:msgId/report', ReportController.getReport);

    server.get('/api/admin/:adminId/report', ReportController.getReportByAdmin);
    server.put({path:'/api/admin/:adminId/report/:reportId',contentType: 'application/json'} , ReportController.updateReportByAdmin);

    /**
     about     - 关于我们
     */
    server.get('/api/user/:userId/about', AboutController.getAbout);

    server.get('/api/admin/:adminId/about', AboutController.getAbout);
    server.post({path:'/api/admin/:adminId/about',contentType: 'application/json'}, AboutController.createAbout);
    server.put({path:'/api/admin/:adminId/about/:aboutId/about',contentType: 'application/json'} ,AboutController.updateAbout);
    server.del({path:'/api/admin/:adminId/about/:aboutId/del',contentType: 'application/json'},AboutController.deleteAbout);

    /**
     app
     */
    server.get('/api/app', AppController.getApp);
    server.get('/api/user/:userId/app', AppController.getApp);

    server.get('/api/admin/:adminId/app', AppController.getApp);
    server.post({path:'/api/admin/:adminId/app',contentType: 'application/json'}, AppController.createApp);
    server.put({path:'/api/admin/:adminId/app/:appId',contentType: 'application/json'} ,AppController.updateApp);
    server.put({path:'/api/admin/:adminId/app/:appId/status',contentType: 'application/json'} ,AppController.updateStatus);
    server.del({path:'/api/admin/:adminId/app/:appId/del',contentType: 'application/json'},AppController.deleteApp);

    /**
     * SMS Module
     */
    server.post({path:'/api/phone/:phone/regSms',contentType: 'application/json'},SmsController.regSms);
    server.post({path:'/api/phone/:phone/passwordSms',contentType: 'application/json'},SmsController.passwordSms);
    server.post({path:'/api/user/:userId/phone/:phone/resetSms',contentType: 'application/json'},SmsController.resetSms);

    /**
     * PushMsg Module
     */
    server.get('/api/user/:userId/pushMsgAndroid' , PushMsgController.pushMsgXinge);
    server.get('/api/user/:userId/pushMsgIos' , PushMsgController.pushMsgApn);
    server.get('/api/user/:userId/pushMsgAll' , PushMsgController.pushMsgAll);

    /**
     * Statistics Module
     */
    server.get('/api/admin/:adminId/statisticsNewUserByMonth', DateCountController.getNewUserByMonth);
    server.get('/api/admin/:adminId/statisticsNewUserByWeek', DateCountController.getNewUserByWeek);
    server.get('/api/admin/:adminId/statisticsNewUserByDay', DateCountController.getNewUserByDay);
    server.get('/api/admin/:adminId/statisticsNewMsgByMonth', DateCountController.getNewMsgByMonth);
    server.get('/api/admin/:adminId/statisticsNewMsgByDay', DateCountController.getNewMsgByDay);
    server.get('/api/admin/:adminId/statisticsNewComByMonth', DateCountController.getNewComByMonth);
    server.get('/api/admin/:adminId/statisticsNewComByDay', DateCountController.getNewComByDay);

    /**
     * APP LOG
     */
    server.post({path:'/api/printLog',contentType: 'application/json'}, AppLog.printLog);


    server.on('NotFound', function (req, res ,err,next) {
        logger.warn(req.url + " not found");

        const error = new Errors.NotFoundError();
        res.send(error);
        return next();
    });
    return (server);

}

///--- Exports

module.exports = {
    createServer
};
const path = require('path');
const restify = require('restify');
const Errors = require('restify-errors');
const corsMiddleware = require('restify-cors-middleware')

const resUtil = require('./util/ResponseUtil');
const serverLogger = require('./util/ServerLogger');
const logger = serverLogger.createLogger('Server');

import {AdminUserController} from './controller';
import {UserController} from './controller';
import {UserDetailController} from './controller';
import {UserRelationController} from './controller';
import {UserVoteController} from './controller';
import {UserLocationCollectionsController} from './controller';
import {UserMessageCollectionsController} from './controller';
import {UserPraiseController} from './controller';
import {MessageController} from './controller';
import {MessageCommentsController} from './controller';
import {MessageCommentsTwoController} from './controller';
import {VoteController} from  './controller';
import {VoteDetailController} from  './controller';
import {ApplicationContactController} from  './controller';
import {SystemMessageController} from  './controller';
import {PrivacySettingsController} from  './controller';
import {NotificationSettingsController} from  './controller';
import {BlacklistController} from  './controller';
import {AboutController} from './controller';
import {AppController} from './controller';

/**
 * Returns a server with all routes defined on it
 */
const createServer=()=>{
    // Create a server with our logger and custom formatter
    // Note that 'version' means all routes will default to
    // 1.0.0
    const server = restify.createServer({

        name: 'SNS-API',
        version: '0.0.1'
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
     admin_info   -管理员管理
     */
    server.get('/api/admin/:adminId/adminUser', AdminUserController.getAdminUser);
    server.post({path:'/api/admin/:adminId/adminUser',contentType: 'application/json'}, AdminUserController.createAdminUser);
    server.put({path:'/api/admin/:adminId/adminUser/:adminUserId',contentType: 'application/json'} ,AdminUserController.updateAdminUserInfo);
    server.put({path:'/api/admin/:adminId/adminUser/:adminUserId/status',contentType: 'application/json'} ,AdminUserController.updateAdminUserStatus);
    server.post({path:'/api/adminLogin',contentType: 'application/json'}, AdminUserController.adminUserLogin);
    /**
     user   -用户管理
     */
    server.post({path:'/api/userLogin',contentType: 'application/json'}, UserController.userLogin);
    server.post({path:'/api/user',contentType: 'application/json'}, UserController.createUser);
    server.get('/api/user', UserController.getUser);
    server.get('/api/user/:userId/userInfoAndDetail', UserController.getUserInfoAndDetail);
    server.put({path:'/api/user/:userId',contentType: 'application/json'} ,UserController.updateUserInfo);
    server.put({path:'/api/user/:userId/password',contentType: 'application/json'},UserController.updatePassword);
    server.put({path:'/api/user/:userId/phone',contentType: 'application/json'},UserController.updatePhone);
    server.put({path:'/api/user/:userId/status',contentType: 'application/json'} ,UserController.updateUserStatus);

    server.get('/api/admin/:adminId/user', UserController.getUser);
    server.get('/api/admin/:adminId/user/:userId/userInfoAndDetail', UserController.getUserInfoAndDetail);
    server.put({path:'/api/admin/:adminId/user/:userId/status',contentType: 'application/json'} ,UserController.updateUserStatus);
    /**
     user_detail    -用户详细信息
     */
    server.get('/api/user/:userId/userDetail', UserDetailController.getUserDetail);
    server.put({path:'/api/user/:userId/userDetail/:userDetailId',contentType: 'application/json'} ,UserDetailController.updateUserDetailInfo);
    server.put({path:'/api/user/:userId/updateDetail',contentType: 'application/json'} ,UserDetailController.updateAccordingToUserID);
    server.put({path:'/api/user/:userId/avatarImage',contentType: 'application/json'},UserDetailController.updateAvatarImage);

    server.get('/api/admin/:adminId/userDetail', UserDetailController.getUserDetail);
    /**
     userRelation    -用户关系
     */
    server.post({path:'/api/user/:userId/userRelation',contentType: 'application/json'}, UserRelationController.createUserRelation);
    server.get('/api/user/:userId/follow', UserRelationController.getFollow);
    server.get('/api/user/:userId/followUserInfo', UserRelationController.getFollowUserInfo);
    server.get('/api/user/:userId/attention', UserRelationController.getAttention);
    server.get('/api/user/:userId/attentionUserInfo', UserRelationController.getAttentionUserInfo);
    server.put({path:'/api/user/:userId/userRelation/:userRelationId/readStatus',contentType: 'application/json'} ,UserRelationController.updateUserRelationReadStatus);

    server.get('/api/admin/:adminId/user/:userId/follow', UserRelationController.getFollow);
    server.get('/api/admin/:adminId/user/:userId/followUserInfo', UserRelationController.getFollowUserInfo);
    server.get('/api/admin/:adminId/user/:userId/attention', UserRelationController.getAttention);
    server.get('/api/admin/:adminId/user/:userId/attentionUserInfo', UserRelationController.getAttentionUserInfo);
    /**
     userPraise   -用户点赞记录
     */
    server.post({path:'/api/user/:userId/userPraise',contentType: 'application/json'}, UserPraiseController.createUserPraise);
    server.get('/api/user/:userId/getUserPraise', UserPraiseController.getUserPraise);
    server.put({path:'/api/user/:userId/userPraise/:userPraiseId/readStatus',contentType: 'application/json'} ,UserPraiseController.updateReadStatus);
    server.put({path:'/api/user/:userId/userPraise/:userPraiseId/status',contentType: 'application/json'} ,UserPraiseController.updateStatusByUser);

    server.get('/api/admin/:adminId/getUserPraise', UserPraiseController.getUserPraise);
    server.put({path:'/api/admin/:adminId/user/:userId/userPraise/:userUserPraiseId/status',contentType: 'application/json'} ,UserPraiseController.updateStatus);
    /**
     userVote   -用户投票记录
     */
    server.post({path:'/api/user/:userId/userVote',contentType: 'application/json'}, UserVoteController.createUserVote);
    server.get('/api/user/:userId/getUserVote', UserVoteController.getUserVote);

    server.get('/api/admin/:adminId/getUserVote', UserVoteController.getUserVoteByAdmin);
    /**
     userLocationCollections    -用户地理位置收藏
     */
    server.post({path:'/api/user/:userId/userLocationCollection',contentType: 'application/json'}, UserLocationCollectionsController.createUserLocationCollections);
    server.get('/api/user/:userId/userLocationCollection', UserLocationCollectionsController.getUserLocationCollections);
    server.put({path:'/api/user/:userId/userLocationCollection/:userLocationCollectionId/status',contentType: 'application/json'} ,UserLocationCollectionsController.updateStatus);

    server.get('/api/admin/:adminId/userLocationCollection', UserLocationCollectionsController.getUserLocationCollections);
    server.put({path:'/api/admin/:adminId/user/:userId/userLocationCollection/:userLocationCollectionId/status',contentType: 'application/json'} ,UserLocationCollectionsController.updateStatus);
    /**
     userMessageCollections    -用户微博收藏
     */
    server.post({path:'/api/user/:userId/messages/:messagesId/userMessageCollection',contentType: 'application/json'}, UserMessageCollectionsController.createUserMessageCollections);
    server.get('/api/user/:userId/userMessageCollection', UserMessageCollectionsController.getUserMessageCollections);
    server.put({path:'/api/user/:userId/userMessageCollection/:userMessageCollectionId/status',contentType: 'application/json'} ,UserMessageCollectionsController.updateStatus);
    server.get('/api/admin/:adminId/userMessageCollection', UserMessageCollectionsController.getUserMessageCollections);
    server.put({path:'/api/admin/:adminId/user/:userId/userMessageCollection/:userMessageCollectionId/status',contentType: 'application/json'} ,UserMessageCollectionsController.updateStatus);

    /**
     messages    -微博动态
     */
    server.post({path:'/api/user/:userId/messages',contentType: 'application/json'}, MessageController.createMessage);
    server.get('/api/user/:userId/messages', MessageController.getMessage);
    server.get('/api/user/:userId/searchByRadius', MessageController.searchByRadius);
    server.put({path:'/api/user/:userId/messages/:messagesId/status',contentType: 'application/json'} ,MessageController.updateMessageStatus);

    server.get('/api/admin/:adminId/messages', MessageController.getMessage);
    server.post({path:'/api/admin/:adminId/messages',contentType: 'application/json'}, MessageController.createMessage);
    server.get('/api/admin/:adminId/searchByRadius', MessageController.searchByRadius);
    server.put({path:'/api/admin/:adminId/messages/:messagesId/status',contentType: 'application/json'} ,MessageController.updateMessageStatus);
     /**
     messageComments   - 评论
     */
    server.get('/api/user/:userId/messages/:messagesId/userMessageComments', MessageCommentsController.getUserMessageComments);
    server.get('/api/user/:userId/messages/:messagesId/allMessageComments', MessageCommentsController.getAllMessageComments);
    server.post({path:'/api/user/:userId/messages/:messagesId/comments',contentType: 'application/json'}, MessageCommentsController.createMessageComments);
    server.put({path:'/api/user/:userId/comments/:commentsId/readStatus',contentType: 'application/json'} ,MessageCommentsController.updateReadStatus);
    server.put({path:'/api/user/:userId/comments/:commentsId/status',contentType: 'application/json'} ,MessageCommentsController.updateUserMessageCommentsStatus);

    server.get('/api/admin/:adminId/user/:userId/messages/:messagesId/userMessageComments', MessageCommentsController.getUserMessageComments);
    server.get('/api/admin/:adminId/messages/:messagesId/allMessageComments', MessageCommentsController.getAllMessageComments);
    server.post({path:'/api/admin/:adminId/user/:userId/messages/:messagesId/comments',contentType: 'application/json'}, MessageCommentsController.createMessageComments);
    server.put({path:'/api/admin/:adminId/comments/:commentsId/readStatus',contentType: 'application/json'} ,MessageCommentsController.updateReadStatus);
    server.put({path:'/api/admin/:adminId/comments/:commentsId/status',contentType: 'application/json'} ,MessageCommentsController.updateAdminMessageCommentsStatus);
    /**
     messageCommentsTwo   - 二級评论
     */
    server.get('/api/user/:userId/comments/:commentsId/userMessageCommentsTwo', MessageCommentsTwoController.getUserMessageCommentsTwo);
    server.get('/api/user/:userId/comments/:commentsId/allMessageCommentsTwo', MessageCommentsTwoController.getAllMessageCommentsTwo);
    server.post({path:'/api/user/:userId/messages/:messagesId/comments/:commentsId/commentsTwo',contentType: 'application/json'}, MessageCommentsTwoController.createMessageCommentsTwo);
    server.put({path:'/api/user/:userId/commentsTwo/:commentsTwoId/readStatus',contentType: 'application/json'} ,MessageCommentsTwoController.updateReadStatus);
    server.put({path:'/api/user/:userId/commentsTwo/:commentsTwoId/status',contentType: 'application/json'} ,MessageCommentsTwoController.updateUserMessageCommentsTwo);

    server.get('/api/admin/:adminId/user/:userId/comments/:commentsId/userMessageCommentsTwo', MessageCommentsTwoController.getUserMessageCommentsTwo);
    server.get('/api/admin/:adminId/comments/:commentsId/allMessageCommentsTwo', MessageCommentsTwoController.getAllMessageCommentsTwo);
    server.post({path:'/api/admin/:adminId/user/:userId/messages/:messagesId/comments/:commentsId/commentsTwo',contentType: 'application/json'}, MessageCommentsTwoController.createMessageCommentsTwo);
    server.put({path:'/api/admin/:adminId/commentsTwo/:commentsTwoId/readStatus',contentType: 'application/json'} ,MessageCommentsTwoController.updateReadStatus);
    server.put({path:'/api/admin/:adminId/commentsTwo/:commentsTwoId/status',contentType: 'application/json'} ,MessageCommentsTwoController.updateAdminMessageCommentsTwo);
    /**
     vote      - 投票信息
     */
    server.post({path:'/api/user/:userId/vote',contentType: 'application/json'}, VoteController.createVote);
    server.get('/api/user/:userId/vote', VoteController.getVote);
    server.get('/api/user/:userId/voteAndVoteDetail', VoteController.getVoteAndVoteDetail);

    server.get('/api/admin/:adminId/vote', VoteController.getVote);
    server.get('/api/admin/:adminId/voteAndVoteDetail', VoteController.getVoteAndVoteDetail);
    /**
     vote_detail     - 投票选项
     */
    server.get('/api/user/:userId/voteDetail', VoteDetailController.getVoteDetail);

    server.get('/api/admin/:adminId/voteDetail', VoteDetailController.getVoteDetail);
    /**
     applicationContact     - 申请联系方式
     */
    server.post({path:'/api/user/:userId/applicationContact',contentType: 'application/json'}, ApplicationContactController.createApplicationContact);
    server.get('/api/user/:userId/applicationContact', ApplicationContactController.getApplicationContact);

    server.get('/api/admin/:adminId/applicationContact', ApplicationContactController.getApplicationContactByAdmin);
    /**
     systemMessage     - 系统消息
     */
    server.get('/api/user/:userId/systemMessage', SystemMessageController.getSystemMessage);

    server.get('/api/admin/:adminId/systemMessage', SystemMessageController.getSystemMessage);
    server.post({path:'/api/admin/:adminId/systemMessage',contentType: 'application/json'}, SystemMessageController.createSystemMessage);
    /**
     privacySettings     - 隐私设置
     */
    server.get('/api/user/:userId/privacySettings', PrivacySettingsController.getPrivacySettingsByUser);
    server.post({path:'/api/user/:userId/privacySettings',contentType: 'application/json'}, PrivacySettingsController.createPrivacySettings);
    server.put({path:'/api/user/:userId/privacySettings/:privacySettingsId/privacySettings',contentType: 'application/json'} ,PrivacySettingsController.updatePrivacySettings);

    server.get('/api/admin/:adminId/privacySettings', PrivacySettingsController.getPrivacySettingsByAdmin);
    /**
     notificationSettings     - 通知设置
     */
    server.get('/api/user/:userId/notificationSettings', NotificationSettingsController.getNotificationSettingsByUser);
    server.post({path:'/api/user/:userId/notificationSettings',contentType: 'application/json'}, NotificationSettingsController.createNotificationSettings);
    server.put({path:'/api/user/:userId/notificationSettings/:notificationSettingsId/notificationSettings',contentType: 'application/json'} ,NotificationSettingsController.updateNotificationSettings);

    server.get('/api/admin/:adminId/notificationSettings', NotificationSettingsController.getNotificationSettingsByAdmin);
    /**
     blacklist     - 黑名单设置
     */
    server.get('/api/user/:userId/blacklist', BlacklistController.getBlacklistByUser);
    server.post({path:'/api/user/:userId/blacklist',contentType: 'application/json'}, BlacklistController.createBlacklist);
    server.del({path:'/api/user/:userId/blacklist/:blacklistId',contentType: 'application/json'},BlacklistController.deleteBlacklist);

    server.get('/api/admin/:adminId/blacklist', BlacklistController.getBlacklistByAdmin);
    /**
     about     - 关于我们
     */
    server.get('/api/user/:userId/about', AboutController.getAbout);

    server.get('/api/admin/:adminId/about', AboutController.getAbout);
    server.post({path:'/api/admin/:adminId/about',contentType: 'application/json'}, AboutController.createAbout);
    server.put({path:'/api/admin/:adminId/about/:aboutId/about',contentType: 'application/json'} ,AboutController.updateAbout);
    /**
     app
     */
    server.get('/api/app', AppController.getApp);
    server.post({path:'/api/admin/:adminId/app',contentType: 'application/json'}, AppController.createApp);
    server.put({path:'/api/admin/:adminId/app/:appId',contentType: 'application/json'} ,AppController.updateApp);
    server.put({path:'/api/admin/:adminId/app/:appId/status',contentType: 'application/json'} ,AppController.updateStatus);


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
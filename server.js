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
import {RelationController} from './controller';
import {MessagePraiseRecordController} from './controller';
import {CommentsPraiseRecordController} from './controller';
import {CommentsLevelTwoPraiseRecordController} from './controller';
import {MessageController} from './controller';
import {CommentsController} from './controller';
import {CommentsLevelTwoController} from './controller';
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
    server.put({path:'/api/user/:userId/status',contentType: 'application/json'} ,UserController.updateUserStatus);

    server.get('/api/admin/:adminId/user', UserController.getUser);
    server.get('/api/admin/:adminId/user/:userId/userInfoAndDetail', UserController.getUserInfoAndDetail);
    server.post({path:'/api/admin/:adminId/user',contentType: 'application/json'}, UserController.createUser);
    server.put({path:'/api/admin/:adminId/user/:userId',contentType: 'application/json'} ,UserController.updateUserInfo);
    server.put({path:'/api/admin/:adminId/user/:userId/status',contentType: 'application/json'} ,UserController.updateUserStatus);
    /**
     user_detail    -用户详细信息
     */
    server.get('/api/user/:userId/userDetail', UserDetailController.getUserDetail);
    server.put({path:'/api/user/:userId/userDetail/:userDetailId',contentType: 'application/json'} ,UserDetailController.updateUserDetailInfo);
    server.put({path:'/api/user/:userId/updateDetail',contentType: 'application/json'} ,UserDetailController.updateAccordingToUserID);

    server.get('/api/admin/:adminId/userDetail', UserDetailController.getUserDetail);
    server.put({path:'/api/admin/:adminId/userDetail/:userDetailId',contentType: 'application/json'} ,UserDetailController.updateUserDetailInfo);
    server.put({path:'/api/admin/:adminId/user/:userId/updateDetail',contentType: 'application/json'} ,UserDetailController.updateAccordingToUserID);
    /**
     Relation    -用户关系
     */
    server.post({path:'/api/user/:userId/relation',contentType: 'application/json'}, RelationController.createRelation);
    server.get('/api/user/:userId/follow', RelationController.getFollow);
    server.get('/api/user/:userId/followUserInfo', RelationController.getFollowUserInfo);
    server.get('/api/user/:userId/attention', RelationController.getAttention);
    server.get('/api/user/:userId/attentionUserInfo', RelationController.getAttentionUserInfo);
    server.put({path:'/api/user/:userId/relation/:relationId/status',contentType: 'application/json'} ,RelationController.updateRelationStatus);
    server.put({path:'/api/user/:userId/relation/:relationId/readStatus',contentType: 'application/json'} ,RelationController.updateRelationReadStatus);

    server.post({path:'/api/admin/:adminId/user/:userId/relation',contentType: 'application/json'}, RelationController.createRelation);
    server.get('/api/admin/:adminId/user/:userId/follow', RelationController.getFollow);
    server.get('/api/admin/:adminId/user/:userId/followUserInfo', RelationController.getFollowUserInfo);
    server.get('/api/admin/:adminId/user/:userId/attention', RelationController.getAttention);
    server.get('/api/admin/:adminId/user/:userId/attentionUserInfo', RelationController.getAttentionUserInfo);
    server.put({path:'/api/admin/:adminId/relation/:relationId/status',contentType: 'application/json'} ,RelationController.updateRelationStatusByAdmin);
    server.put({path:'/api/admin/:adminId/relation/:relationId/readStatus',contentType: 'application/json'} ,RelationController.updateRelationReadStatusByAdmin);
    /**
     PraiseRecord   -点赞记录
     */
    server.post({path:'/api/user/:userId/messages/:messagesId/praiseRecord',contentType: 'application/json'}, MessagePraiseRecordController.createMessagePraiseRecord);
    server.post({path:'/api/user/:userId/comments/:commentsId/praiseRecord',contentType: 'application/json'}, CommentsPraiseRecordController.createCommentsPraiseRecord);
    server.post({path:'/api/user/:userId/commentsLevelTwo/:commentsLevelTwoId/praiseRecord',contentType: 'application/json'}, CommentsLevelTwoPraiseRecordController.createCommentsLevelTwoPraiseRecord);
    server.get('/api/user/:userId/messagesPraiseRecord', MessagePraiseRecordController.getMessagePraiseRecord);
    server.get('/api/user/:userId/commentsPraiseRecord', CommentsPraiseRecordController.getCommentsPraiseRecord);
    server.get('/api/user/:userId/commentsLevelTwoPraiseRecord', CommentsLevelTwoPraiseRecordController.getCommentsLevelTwoPraiseRecord);
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
     Comments   - 评论
     */
    server.get('/api/user/:userId/messages/:messagesId/userComments', CommentsController.getUserComments);
    server.get('/api/user/:userId/messages/:messagesId/allComments', CommentsController.getAllComments);
    server.post({path:'/api/user/:userId/messages/:messagesId/comments',contentType: 'application/json'}, CommentsController.createComments);
    server.put({path:'/api/user/:userId/comments/:commentsId/readStatus',contentType: 'application/json'} ,CommentsController.updateReadStatus);
    server.del('/api/user/:userId/comments/:commentsId' ,CommentsController.deleteUserComments);

    server.get('/api/admin/:adminId/user/:userId/messages/:messagesId/userComments', CommentsController.getUserComments);
    server.get('/api/admin/:adminId/messages/:messagesId/allComments', CommentsController.getAllComments);
    server.post({path:'/api/admin/:adminId/user/:userId/messages/:messagesId/comments',contentType: 'application/json'}, CommentsController.createComments);
    server.put({path:'/api/admin/:adminId/comments/:commentsId/readStatus',contentType: 'application/json'} ,CommentsController.updateReadStatus);
    server.del('/api/admin/:adminId/comments/:commentsId' ,CommentsController.deleteAdminComments);
    /**
     CommentsLevelTwo   - 二級评论
     */
    server.get('/api/user/:userId/comments/:commentsId/userCommentsLevelTwo', CommentsLevelTwoController.getUserCommentsLevelTwo);
    server.get('/api/user/:userId/comments/:commentsId/allCommentsLevelTwo', CommentsLevelTwoController.getAllCommentsLevelTwo);
    server.post({path:'/api/user/:userId/messages/:messagesId/comments/:commentsId/commentsLevelTwo',contentType: 'application/json'}, CommentsLevelTwoController.createCommentsLevelTwo);
    server.put({path:'/api/user/:userId/commentsLevelTwo/:commentsLevelTwoId/readStatus',contentType: 'application/json'} ,CommentsLevelTwoController.updateReadStatus);
    server.del('/api/user/:userId/commentsLevelTwo/:commentsLevelTwoId' ,CommentsLevelTwoController.deleteUserCommentsLevelTwo);

    server.get('/api/admin/:adminId/user/:userId/comments/:commentsId/userCommentsLevelTwo', CommentsLevelTwoController.getUserCommentsLevelTwo);
    server.get('/api/admin/:adminId/comments/:commentsId/allCommentsLevelTwo', CommentsLevelTwoController.getAllCommentsLevelTwo);
    server.post({path:'/api/admin/:adminId/user/:userId/messages/:messagesId/comments/:commentsId/commentsLevelTwo',contentType: 'application/json'}, CommentsLevelTwoController.createCommentsLevelTwo);
    server.put({path:'/api/admin/:adminId/commentsLevelTwo/:commentsLevelTwoId/readStatus',contentType: 'application/json'} ,CommentsLevelTwoController.updateReadStatus);
    server.del('/api/admin/:adminId/commentsLevelTwo/:commentsLevelTwoId' ,CommentsLevelTwoController.deleteAdminCommentsLevelTwo);

    /**
     app
     */
    server.get('/api/app', AppController.getApp);
    server.post({path:'/api/admin/:adminId/app',contentType: 'application/json'}, AppController.createApp);
    server.put({path:'/api/admin/:adminId/app/:appId',contentType: 'application/json'} ,AppController.updateApp);

    server.on('NotFound', function (req, res ,err,next) {
        logger.warn(req.url + " not found");

        const error = new Errors.NotFoundError()
        res.send(error);
        return next();
    });
    return (server);

}

///--- Exports

module.exports = {
    createServer
};
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
import {MessageController} from './controller';

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
     admin_info
     */
    server.get('/api/adminUser', AdminUserController.getAdminUser);
    server.post({path:'/api/adminUser',contentType: 'application/json'}, AdminUserController.createAdminUser);
    server.put({path:'/api/adminUser/:adminUserId',contentType: 'application/json'} ,AdminUserController.updateAdminUserInfo);
    server.del('/api/adminUser/:adminUserId' ,AdminUserController.deleteAdminUserInfo);
    server.post({path:'/api/adminLogin',contentType: 'application/json'}, AdminUserController.adminUserLogin);

    /**
     user
     */
    server.get('/api/user', UserController.getUser);
    server.post({path:'/api/user',contentType: 'application/json'}, UserController.createUser);
    server.put({path:'/api/user/:userId',contentType: 'application/json'} ,UserController.updateUserInfo);
    server.del('/api/user/:userId' ,UserController.deleteUserInfo);
    server.get('/api/user/:userId/userInfoAndDetail', UserController.getUserInfoAndDetail);
    server.post({path:'/api/userLogin',contentType: 'application/json'}, UserController.userLogin);
    /**
     user_detail
     */
    server.get('/api/userDetail', UserDetailController.getUserDetail);
    // server.post({path:'/api/userDetail',contentType: 'application/json'}, UserDetailController.createUserDetail);
    server.put({path:'/api/userDetail/:userDetailId',contentType: 'application/json'} ,UserDetailController.updateUserDetailInfo);
    server.put({path:'/api/userId_userDetail/:userId',contentType: 'application/json'} ,UserDetailController.updateAccordingToUserID);

    /**
     messages
     */
    server.get('/api/user/messages', MessageController.getMessage);
    server.post({path:'/api/user/messages',contentType: 'application/json'}, MessageController.createMessage);
    server.get('/api/user/searchByRadius', MessageController.SearchByRadius);
    server.put({path:'/api/admin/:adminId/messages/:messagesId/status',contentType: 'application/json'} ,MessageController.updateMessageStatusToAdmin);
    server.put({path:'/api/user/:userId/messages/:messagesId/status',contentType: 'application/json'} ,MessageController.updateMessageStatusToUser);
    server.del('/api/user/:userId/messages/:messagesId' ,MessageController.deleteMessageToUser);

    /**
     app
     */
    server.get('/api/app', AppController.getApp);
    server.post({path:'/api/app',contentType: 'application/json'}, AppController.createApp);

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
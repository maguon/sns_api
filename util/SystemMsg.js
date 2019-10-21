'use strict';
let SYS_AUTH_TOKEN_ERROR ="当前用户级别，不能完成此操作" ;
/**
 * The module for admin
 */
let CUST_ID_NULL_ERROR ="该用户不存在！" ;
let CUST_LOGIN_USER_PSWD_ERROR = "登录用户名或密码错误" ; // Customer enter a wrong password on login
let CUST_SIGNUP_REGISTERED = "已被注册";//Cutomer do signup ,but the current phone has been exist in system.
let CUST_LOGIN_PSWD_ERROR = "登录密码错误" ; // Customer enter a wrong password on login
/**
 * The module for user
 */
let USER_CREATE_ERROR = "创建用户信息失败！" ; //Failed to create user information
let USER_CREATE_DETAIL_ERROR = "创建用户详细信息失败！" ; //Failed to create user details
let USER_DELETE_INFO = "删除用户信息失败" ; // Failed to delete user information
let USER_DETAIL_ID_NULL_ERROR ="该用户详细信息不存在！" ;
let USER_OLD_PASSWORD_ERROR = "原密码有误！";
let USER_NEW_PASSWORD_ERROR = "新密码有误！";
/**
 * The module for userRelation
 */
let RELATION_ID_NULL_ERROR ="该用户关系不存在！" ;
/**
 * The module for userPraise
 */
let PRAISE_RECORD_ID_NULL_ERROR ="该点赞记录不存在！" ;
let PRAISE_TYPE_ERROR ="点赞类型不存在！" ;
/**
 * The module for userLocationCollection
 */
let ADDRESS_COLLECTIONS_ID_NULL ="收藏位置不存在！" ;
/**
 * The module for userMessageCollection
 */
let MESSAGE_COLLECTIONS_ID_NULL ="收藏动态不存在！" ;
/**
 * The module for messages
 */
let MESSAGE_DELETE_ADMIN_ERROR = "该管理员无权删除此消息！" ; // The admin has no right to delete this message
let MESSAGE_ID_NULL_ERROR ="该动态不存在！" ;
/**
 * The module for comments
 */
let COMMENTS_ID_NULL_ERROR ="该评论不存在！" ;
/**
 * The module for commentsTwo
 */
let COMMENTSTWO_ID_NULL_ERROR ="该二級评论不存在！" ;
/**
 * The module for vote
 */
let VOTE_ID_NULL_ERROR ="投票信息不存在！" ;
/**
 * The module for vote_detail
 */
let VOTE_DETAIL_ID_NULL_ERROR ="投票选项不存在！" ;
/**
 * The module for system_message
 */
let SYSTEM_MESSAGE_ID_NULL_ERROR ="系统消息不存在！" ;
/**
 * The module for privacy_settings
 */
let PRIVACY_SETTINGS_ID_NULL_ERROR ="隐私设置信息不存在！" ;
/**
 * The module for notification_settings
 */
let NOTIFICATION_SETTINGS_ID_NULL_ERROR ="通知设置信息不存在！" ;
/**
 * The module for app
 */
let APP_ID_NULL_ERROR ="版本信息不存在！" ;


module.exports = {
    SYS_AUTH_TOKEN_ERROR,

    CUST_ID_NULL_ERROR,
    CUST_LOGIN_USER_PSWD_ERROR,
    CUST_SIGNUP_REGISTERED,
    CUST_LOGIN_PSWD_ERROR,

    USER_CREATE_ERROR,
    USER_CREATE_DETAIL_ERROR,
    USER_DELETE_INFO,
    USER_DETAIL_ID_NULL_ERROR,
    USER_OLD_PASSWORD_ERROR,
    USER_NEW_PASSWORD_ERROR,

    RELATION_ID_NULL_ERROR,

    PRAISE_RECORD_ID_NULL_ERROR,
    PRAISE_TYPE_ERROR,

    ADDRESS_COLLECTIONS_ID_NULL,

    MESSAGE_COLLECTIONS_ID_NULL,

    MESSAGE_DELETE_ADMIN_ERROR,
    MESSAGE_ID_NULL_ERROR,

    COMMENTS_ID_NULL_ERROR,

    COMMENTSTWO_ID_NULL_ERROR,

    VOTE_ID_NULL_ERROR,

    VOTE_DETAIL_ID_NULL_ERROR,

    SYSTEM_MESSAGE_ID_NULL_ERROR,

    PRIVACY_SETTINGS_ID_NULL_ERROR,

    NOTIFICATION_SETTINGS_ID_NULL_ERROR,

    APP_ID_NULL_ERROR
}
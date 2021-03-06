'use strict';
let SYS_AUTH_TOKEN_ERROR ="当前用户级别，不能完成此操作" ;
let SYS_INTERNAL_ERROR_MSG = "Web Service Internal Error.";
/**
 * The module for admin
 */
let CUST_ID_NULL_ERROR ="该用户不存在！" ;//The user does not exist
let CUST_LOGIN_USER_PSWD_ERROR = "登录用户名或密码错误" ; // Customer enter a wrong password on login
let CUST_SIGNUP_REGISTERED = "已被注册";//Cutomer do signup ,but the current phone has been exist in system.
let CUST_LOGIN_PSWD_ERROR = "登录密码错误" ;
let CUST_STATUS_ERROR = "该用户已停用！" ;
/**
 * The module for user
 */
let USER_SIGNUP_PHONE_REGISTERED = "电话已被注册";//Phone is registered
let USER_SMS_CAPTCHA_ERROR = "短信验证码错误";
let USER_CREATE_ERROR = "创建用户信息失败！" ; //
let USER_CREATE_DETAIL_ERROR = "创建用户详细信息失败！" ; //
let USER_STATUS_ERROR = "该用户已停用！" ;//The user has been deactivated
let USER_DELETE_INFO = "删除用户信息失败" ; //
let USER_DETAIL_ID_NULL_ERROR ="该用户详细信息不存在！" ;
let USER_OLD_PASSWORD_ERROR = "原密码有误！";
let USER_NEW_PASSWORD_ERROR = "新密码有误！";//New password error!
/**
 * The module for userDrive
 */
let USER_DRIVE_ID_NULL_ERROR ="该用户驾驶信息不存在！" ;
/**
 * The module for userRelation
 */
let RELATION_ID_ERROR ="该用户关系已存在！" ;
let RELATION_ID_NULL_ERROR ="该用户关系不存在！" ;
/**
 * The module for userPraise
 */
let PRAISE_RECORD_ID_NULL_ERROR ="该点赞记录不存在！" ;
let PRAISE_TYPE_ERROR ="点赞类型不存在！" ;
let PRAISE_MSG_CREATE_ERROR ="该文章已点赞！" ;
let PRAISE_COM_CREATE_ERROR ="该评论已点赞！" ;
/**
 * The module for userVote
 */
let USER_VOTE_CREATE_ERROR ="该用户已投票！" ;
/**
 * The module for userLocaColl
 */
let LOCA_COLL_ID_NULL ="收藏位置不存在！" ;
/**
 * The module for userMsgColl
 */
let MSG_COLL_ID_NULL ="收藏动态不存在！" ;
let MSG_COLL_CREATE_ERROR ="该文章已收藏！" ;
/**
 * The module for msg
 */
let MSG_DELETE_ADMIN_ERROR = "该管理员无权删除此消息！" ; // The admin has no right to delete this message
let MSG_ID_NULL_ERROR ="该动态不存在！" ;
/**
 * The module for comment
 */
let COMMENT_ID_NULL_ERROR ="该评论不存在！" ;
/**
 * The module for vote
 */
let VOTE_ID_NULL_ERROR ="投票信息不存在！" ;
let VOTE_STATUS_NULL_ERROR ="该状态下，投票信息不允许修改！" ;
/**
 * The module for sys_msg
 */
let SYS_MSG_ID_NULL_ERROR ="系统消息不存在！" ;
/**
 * The module for info
 */
let INFO_ID_NULL_ERROR ="消息提醒不存在！" ;
/**
 * The module for privacie
 */
let PRIVACIE_ID_NULL_ERROR ="隐私设置信息不存在！" ;
/**
 * The module for notice
 */
let NOTICE_ID_NULL_ERROR ="通知设置信息不存在！" ;
/**
 * The module for about
 */
let ABOUT_ID_NULL_ERROR ="关于我们信息不存在！" ;
/**
 * The module for app
 */
let APP_ID_NULL_ERROR ="版本信息不存在！" ;


module.exports = {
    SYS_AUTH_TOKEN_ERROR,
    SYS_INTERNAL_ERROR_MSG,

    CUST_ID_NULL_ERROR,
    CUST_LOGIN_USER_PSWD_ERROR,
    CUST_SIGNUP_REGISTERED,
    CUST_LOGIN_PSWD_ERROR,
    CUST_STATUS_ERROR,

    USER_SIGNUP_PHONE_REGISTERED,
    USER_SMS_CAPTCHA_ERROR,
    USER_CREATE_ERROR,
    USER_CREATE_DETAIL_ERROR,
    USER_STATUS_ERROR,
    USER_DELETE_INFO,
    USER_DETAIL_ID_NULL_ERROR,
    USER_OLD_PASSWORD_ERROR,
    USER_NEW_PASSWORD_ERROR,

    USER_DRIVE_ID_NULL_ERROR,

    RELATION_ID_ERROR,
    RELATION_ID_NULL_ERROR,

    PRAISE_RECORD_ID_NULL_ERROR,
    PRAISE_TYPE_ERROR,
    PRAISE_MSG_CREATE_ERROR,
    PRAISE_COM_CREATE_ERROR,

    USER_VOTE_CREATE_ERROR,

    LOCA_COLL_ID_NULL,

    MSG_COLL_ID_NULL,
    MSG_COLL_CREATE_ERROR,

    MSG_DELETE_ADMIN_ERROR,
    MSG_ID_NULL_ERROR,

    COMMENT_ID_NULL_ERROR,

    VOTE_ID_NULL_ERROR,
    VOTE_STATUS_NULL_ERROR,

    SYS_MSG_ID_NULL_ERROR,

    INFO_ID_NULL_ERROR,

    PRIVACIE_ID_NULL_ERROR,

    NOTICE_ID_NULL_ERROR,

    ABOUT_ID_NULL_ERROR,

    APP_ID_NULL_ERROR
}
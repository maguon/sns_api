'use strict';
let SYS_AUTH_TOKEN_ERROR ="当前用户级别，不能完成此操作" ;
let SYS_OBJECT_ID_ERROR ="输入的ID格式不正确！" ;
/**
 * The module for admin
 */
let CUST_LOGIN_USER_PSWD_ERROR = "登录用户名或密码错误" ; // Customer enter a wrong password on login
let CUST_SIGNUP_REGISTERED = "已被注册";//Cutomer do signup ,but the current phone has been exist in system.
let CUST_LOGIN_PSWD_ERROR = "登录密码错误" ; // Customer enter a wrong password on login
/**
 * The module for user
 */
let USER_CREATE_ERROR = "创建用户信息失败！" ; //Failed to create user information
let USER_CREATE_DETAIL_ERROR = "创建用户详细信息失败！" ; //Failed to create user details
let USER_DELETE_INFO = "删除用户信息失败" ; // Failed to delete user information
/**
 * The module for messages
 */
let MESSAGE_DELETE_ADMIN_ERROR = "该管理员无权删除此消息！" ; // The admin has no right to delete this message
module.exports = {
    SYS_AUTH_TOKEN_ERROR,
    SYS_OBJECT_ID_ERROR,

    CUST_LOGIN_USER_PSWD_ERROR,
    CUST_SIGNUP_REGISTERED,
    CUST_LOGIN_PSWD_ERROR,

    USER_CREATE_ERROR,
    USER_CREATE_DETAIL_ERROR,
    USER_DELETE_INFO,

    MESSAGE_DELETE_ADMIN_ERROR
}
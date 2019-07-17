'use strict';
let SYS_AUTH_TOKEN_ERROR ="当前用户级别，不能完成此操作" ;


let CUST_SIGNUP_REGISTERED = "已被注册";//Cutomer do signup ,but the current phone has been exist in system.
let CUST_LOGIN_PSWD_ERROR = "登录密码错误" ; // Customer enter a wrong password on login

module.exports = {
    SYS_AUTH_TOKEN_ERROR,
    CUST_SIGNUP_REGISTERED,
    CUST_LOGIN_PSWD_ERROR
}
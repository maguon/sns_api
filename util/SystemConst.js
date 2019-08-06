'use strict';
const INFO_STATUS = {
    Status: {
        disable:0,//停用
        available:1//可用
    }
}

const DEL_STATIS = {
    Status: {
        not_deleted:0,//未删除
        delete:1//已删除
    }
}
const USER_ADDRESS ={
    type:{
        departure:1,
        parking:0
    },
    status:{
        disabled:0,//停用地址
        enable:1//启用地址
    }
}

module.exports = {
    INFO_STATUS,
    DEL_STATIS,
    USER_ADDRESS
}
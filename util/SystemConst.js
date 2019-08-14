'use strict';
const INFO_STATUS = {
    Status: {
        disable:0,//停用
        available:1//可用
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
const READ_STATUS ={
    Status:{
        not_read:0,//未读
        read:1//已读
    }
}
module.exports = {
    INFO_STATUS,
    USER_ADDRESS,
    READ_STATUS
}
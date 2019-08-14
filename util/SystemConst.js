'use strict';
const INFO_STATUS = {
    Status: {
        disable:0,//停用
        available:1//可用
    }
}
const MESSAGE_TYPE ={
    type:{
        text:1,//文字
        pictures:2,//图片
        video:3,//视频
        help:4,//求助
        voting:5//投票
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
    MESSAGE_TYPE,
    READ_STATUS
}
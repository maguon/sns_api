'use strict';
const INFO_STATUS = {
    Status: {
        disable:0,//停用
        available:1//可用
    }
}
const USER ={
    status: {
        disable:0,//停用
        available:1//可用
    },
    auth_status:{
        uncertified:0,//未认证
        certified:1//已认证
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
    status:{
        not_read:0,//未读
        read:1//已读
    }
}
const PRAISE ={
    type:{
        message:1,//消息
        comments:2,//评论
        commentsTwo:3//二级评论
    }
}
module.exports = {
    INFO_STATUS,
    USER,
    MESSAGE_TYPE,
    READ_STATUS,
    PRAISE
}
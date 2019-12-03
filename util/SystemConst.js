'use strict';
const DRIVE_TYPE = {
    A1:1,
    A2:2,
    A3:3,
    B1:4,
    B2:5,
    C1:6,
    C2:7,
    C3:8,
    C4:9,
    D:10,
    E:11,
    F:12,
    M:13,
    N:14,
    P:15
}
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
const MESSAGE ={
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
const VOTE ={
    status:{
        not_open:0,//未开启
        in_progress:1,//进行中
        closed:2//已结束
    }
}
module.exports = {
    DRIVE_TYPE,
    INFO_STATUS,
    USER,
    MESSAGE,
    READ_STATUS,
    PRAISE,
    VOTE
}
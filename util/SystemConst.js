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
    C5:10,
    D:11,
    E:12,
    F:13,
    M:14,
    N:15,
    P:16
}
const INFO = {
    status: {
        disable:0,//停用
        available:1//可用
    },
    read_status:{
        unread:0,//未读
        read:1//已读
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
        article:1,//文章
        help:2//求助
    },
    carrier:{
        text:1,//文本
        pictures:2,//图片
        video:3,//视频
        help:4//地理位置
    },
    comment_status:{
        visible:1,//可见的
        invisible:2//不可见
    }
}
const COUMMENT ={
    type:{
        firstCoumment:1,//一级评论
        twoCoumment:2//二级评论
    },
    status: {
        shield:0,//屏蔽
        normal:1//正常
    }
}
const VOTE ={
    status:{
        not_open:0,//未开启
        in_progress:1,//进行中
        closed:2//已结束
    }
}
const SYSMESSAGE ={
    status:{
        shield:0,//屏蔽
        normal:1//正常
    }
}
module.exports = {
    DRIVE_TYPE,
    INFO,
    USER,
    MESSAGE,
    COUMMENT,
    VOTE,
    SYSMESSAGE
}
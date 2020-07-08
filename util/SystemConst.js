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
const ADMIN ={
    status: {
        disable:0,//停用
        available:1//可用
    }
}
const USER ={
    fake_type: {
        fakeUser:1//伪造用户
    },
    status: {
        available:1,//可用
        forbiddenWords:2,//禁言
        disable:4//停用
    },
    auth_status:{
        uncertified:0,//未认证
        certified:1//已认证
    }
}
const USERLOCACOLL = {
    status: {
        disable:0,//停用
        available:1//可用
    }
}
const USERMSGCOLL = {
    status: {
        disable:0,//停用
        available:1//可用
    }
}
const USERPRAISE ={
    type: {
        msg:1,//动态
        comment:2//评论
    }
}
const MSG ={
    type:{
        article:1,//文章
        help:2//求助
    },
    carrier:{
        text:1,//文本
        pictures:2,//图片
        video:3,//视频
        position:4//地理位置
    },
    com_status:{
        visible:1,//可见的
        invisible:2//不可见
    },
    status: {
        disable:0,//停用
        available:1//可用
    },
    fake_type: {
        fakeMsg:1//伪造用户
    },
}
const INFO = {
    type: {
        follow:1,//关注我
        com:2,//评论我
        praise:3,//赞我
        vote:4,//投票提醒
        sys:5//系统消息
    },
    status: {
        unread:1,//未读
        read:2//已读
    }
}
const COMMENT ={
    level:{
        firstCom:1,//一级评论
        twoCom:2//二级评论
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
        closed:3//已结束
    }
}
const SYSMSG ={
    status:{
        shield:0,//屏蔽
        normal:1//正常
    }
}
const APP = {
    status: {
        disable:0,//停用
        available:1//可用
    }
}
module.exports = {
    DRIVE_TYPE,
    ADMIN,
    USER,
    USERLOCACOLL,
    USERMSGCOLL,
    USERPRAISE,
    MSG,
    COMMENT,
    VOTE,
    SYSMSG,
    INFO,
    APP
}
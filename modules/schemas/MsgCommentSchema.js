'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const msgCommentSchema = new Schema({
        msg_type       : {type:Number,default:0,min:0,max:3,display: '消息类型(1.文章 2.求助 )'},
        level          : {type:Number,default:0,min:0,max:3,display: '评论类型(1.一级评论 2.二级评论)'},
        comment        : {type:String,default:'',display: '评论内容'},
        comment_num    : {type:Number,default:0,display: '评论次数'},
        agree_num      : {type:Number,default:0,display: '点赞次数'},
        status         : {type:Number,default:0,min:0,max:3,display: '状态(0-屏蔽，1-正常（默认）)'},
        read_status    : {type:Number,default:0,min:0,max:3,display: '未读状态(0-未读（默认），1-已读)'},
        _user_id: {
            type: Schema.Types.ObjectId,
            ref: 'user_info',
            display: '用户信息ID'
        },
        _msg_id: {
            type: Schema.Types.ObjectId,
            ref: 'msg_info',
            display: '动态ID'
        },
        _msg_user_id: {
            type: Schema.Types.ObjectId,
            ref: 'user_info',
            display: '动态用户ID'
        },
        _msg_com_id: {
            type: Schema.Types.ObjectId,
            ref: 'msg_comment',
            display: '评论ID'
        },
        _msg_com_user_id: {
            type: Schema.Types.ObjectId,
            ref: 'user_info',
            display: '评论用户ID'
        },
    },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const MsgCommentModel = mongoose.model('msg_comment',msgCommentSchema);
module.exports = {
    MsgCommentModel
}
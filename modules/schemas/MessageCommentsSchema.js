'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const messageCommentsSchema = new Schema({
        messages_type  : {type:Number,default:0,min:0,max:3,display: '消息类型(1.文章 2.求助 )'},
        level          : {type:Number,default:0,min:0,max:3,display: '评论类型(1.一级评论 2.二级评论)'},
        commentsMsg    : {type:String,default:'',display: '评论内容'},
        commentsNum    : {type:Number,default:0,display: '评论次数'},
        agreeNum       : {type:Number,default:0,display: '点赞次数'},
        status         : {type:Number,default:0,min:0,max:3,display: '状态(0-屏蔽，1-正常（默认）)'},
        read_status    : {type:Number,default:0,min:0,max:3,display: '未读状态(0-未读（默认），1-已读)'},
        _userId: {
            type: Schema.Types.ObjectId,
            ref: 'user_info',
            display: '用户信息ID'
        },
        _messageId: {
            type: Schema.Types.ObjectId,
            ref: 'messages_info',
            display: '动态ID'
        },
        _messageCommentsId: {
            type: Schema.Types.ObjectId,
            ref: 'message_comments',
            display: '评论ID'
        }
    },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const MessageCommentsModel = mongoose.model('message_comments',messageCommentsSchema)
module.exports = {
    MessageCommentsModel
}
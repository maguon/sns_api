'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const messageCommentsSchema = new Schema({
        type           : {type:Number,default:0,min:0,max:3,display: '评论类型(1.一级评论 2.二级评论)'},
        commentsMsg    : {type:String,default:'',display: '评论内容'},
        commentsNum    : {type:Number,default:0,display: '评论次数'},
        agreeNum       : {type:Number,default:0,display: '点赞次数'},
        read_status    : {type:Number,default:0,min:0,max:3,display: '未读状态(0-未读，1-已读)'},
        _userId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
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
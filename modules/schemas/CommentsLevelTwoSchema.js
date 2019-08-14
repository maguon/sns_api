'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const commentsLevelTwoSchema = new Schema({
        commentsLevelTwoMsg  : {type:String,default:'',display: '评论内容'},
        agreeNum            : {type:Number,default:0,display: '点赞次数'},
        status              : {type:Number,default:1,min:0,max:3,display: '状态（0-停用，1-启用）'},
        read_status   : {type:Number,default:0,min:0,max:3,display: '未读状态(0-未读，1-已读)'},
        _userId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            display: '用户信息ID'
        },
        _messageId: {
            type: Schema.Types.ObjectId,
            ref: 'messages',
            display: '动态ID'
        },
        _commentsId: {
            type: Schema.Types.ObjectId,
            ref: 'comments',
            display: '评论ID'
        }
    },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const CommentsLevelTwoModel = mongoose.model('commentsLevelTwo',commentsLevelTwoSchema)
module.exports = {
    CommentsLevelTwoModel
}
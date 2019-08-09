'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const commentsSchema = new Schema({
        commentsMsg    : {type:String,default:'',display: '评论内容'},
        commentsNum    : {type:Number,default:0,display: '评论次数'},
        agreeNum      : {type:Number,default:0,display: '点赞次数'},
        status         : {type:Number,default:1,min:0,max:3,display: '状态'},
        del_status     : {type:Number,default:0,min:0,max:3,display: '删除状态(0-未删除，1-已删除)'},
        _userId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            display: '用户信息ID'
        },
        _messageId: {
            type: Schema.Types.ObjectId,
            ref: 'messages',
            display: '动态ID'
        }
    },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const CommentsModel = mongoose.model('comments',commentsSchema)
module.exports = {
    CommentsModel
}
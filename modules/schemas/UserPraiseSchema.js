'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const userPraiseSchema = new Schema({
        type           : {type:Number,default:0,min:0,max:3,display: '点赞类型(1.动态 2.评论)'},
        read_status    : {type:Number,default:0,min:0,max:3,display: '未读状态(0-未读，1-已读)'},
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

const UserPraiseModel = mongoose.model('user_praise',userPraiseSchema);
module.exports = {
    UserPraiseModel
}
'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const commentsTwoPraiseSchema = new Schema({
        status        : {type:Number,default:1,min:0,max:3,display: '状态（0-停用，1-启用）'},
        read_status   : {type:Number,default:0,min:0,max:3,display: '未读状态(0-未读，1-已读)'},
        _userId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            display: '用户信息ID'
        },
        _commentsTwoId: {
            type: Schema.Types.ObjectId,
            ref: 'comments_two',
            display: '二级评论ID'
        }
        },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const CommentsTwoPraiseModel = mongoose.model('comments_two_praise',commentsTwoPraiseSchema);
module.exports = {
    CommentsTwoPraiseModel
}
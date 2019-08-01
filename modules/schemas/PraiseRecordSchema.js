'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const praiseRecordSchema = new Schema({
        status        : {type:Number,default:0,min:0,max:3,display: '状态'},
        del_status    : {type:Number,default:0,min:0,max:3,display: '删除状态(0-未删除，1-已删除)'},
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

const PraiseRecordModel = mongoose.model('praiseRecord',praiseRecordSchema)
module.exports = {
    PraiseRecordModel
}
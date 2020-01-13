'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const userPraiseSchema = new Schema({
            type           : {type:Number,default:0,min:0,max:3,display: '点赞类型(1.动态 2.评论)'},
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
            }
        },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const UserPraiseModel = mongoose.model('user_praise',userPraiseSchema);
module.exports = {
    UserPraiseModel
}
'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const userVoteSchema = new Schema({
        type          : {type:Number,default:0,min:0,max:3,display: '类型（1-消息,2-评论,3-二级评论）'},
        status        : {type:Number,default:1,min:0,max:3,display: '状态（0-停用，1-启用）'},
        read_status   : {type:Number,default:0,min:0,max:3,display: '未读状态(0-未读，1-已读)'},
        _userId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            display: '用户信息ID'
        },
        _voteId: {
            type: Schema.Types.ObjectId,
            ref: 'vote_info',
            display: '投票信息ID'
        },
        _voteDetailId: {
            type: Schema.Types.ObjectId,
            ref: 'vote_detail',
            display: '投票选项ID'
        }
        },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const UserVoteModel = mongoose.model('user_vote',userVoteSchema);
module.exports = {
    UserVoteModel
}
'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const userVoteSchema = new Schema({
            option_item   : [{
                index     : {type:Number,default:0,display: '选项下标'},
                txt       : {type:String,default:'',trim:true,display: '选项'},
            }],
            _user_id: {
                type: Schema.Types.ObjectId,
                ref: 'user_info',
                display: '用户信息ID'
            },
            _vote_id: {
                type: Schema.Types.ObjectId,
                ref: 'vote_info',
                display: '投票信息ID'
            }
        },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const UserVoteModel = mongoose.model('user_vote',userVoteSchema);
module.exports = {
    UserVoteModel
}
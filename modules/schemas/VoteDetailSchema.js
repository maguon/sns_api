'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const voteDetailSchema = new Schema({
        option             : {type:String,default:'',trim:true,display: '选项'},
        voteNum          : {type:Number,default:0,display: '票数'},
        _voteId: {
            type: Schema.Types.ObjectId,
            ref: 'vote_info',
            display: '投票信息ID'
        }
    },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const VoteDetailModel = mongoose.model('vote_detail',voteDetailSchema);
module.exports = {
    VoteDetailModel
}
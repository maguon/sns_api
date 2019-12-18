'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const voteSchema = new Schema({
        title            : {type:String,default:'',trim:true,display: '标题'},
        info             : {type:String,default:'',trim:true,display: '内容'},
        participantsNum  : {type:Number,default:0,display: '参与人数'},
        maxNum           : {type:Number,default:0,display: '一人最多投票数'},
        startTime        : {type:String,default: '',display: '投票开始时间'},
        endTime          : {type:String,default: '',display: '投票截止时间'},
        status           : {type:Number,default:1,min:0,max:3,display: '投票状态（0-未开启，1-进行中，3-已结束）'},
        option           : {type:Object,trim:true,display: '选项'},
        _adminId: {
            type: Schema.Types.ObjectId,
            ref: 'admin_user',
            display: '管理员ID'
        }
    },
{ timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
});

const VoteModel = mongoose.model('vote_info',voteSchema);
module.exports = {
    VoteModel
}
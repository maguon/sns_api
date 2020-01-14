'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const infoSchema = new Schema({
        type               : {type:Number,default:1,min:0,max:6,display: '消息类型(1.关注我 2.评论我 3.赞我 4.投票提醒 5.系统消息 )'},
        status             : {type:Number,default:1,min:0,max:3,display: '状态（1-未读，2-已读）'},
        content            : {
            txt       : {type:String,default:'',trim:true,display: '文本/投票标题'},
            _user_id  : {
                type: Schema.Types.ObjectId,
                ref: 'user_info',
                display: '接受信息用户ID'
            }
        }
    },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const InfoModel = mongoose.model('info',infoSchema);
module.exports = {
    InfoModel
}
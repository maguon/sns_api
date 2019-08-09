'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const messageSchema = new Schema({
        type          : {type:Number,default:0,min:0,max:3,display: '消息类型'},
        info          : {type:String,default:'',trim:true,display: '内容'},
        address       : {type:Array,index: {type: '2d',sparse: true},display: '地理位置'},
        collectNum    : {type:Number,default:0,display: '收藏次数'},
        commentsNum    : {type:Number,default:0,display: '评论次数'},
        agreeNum      : {type:Number,default:0,display: '点赞次数'},
        readNum       : {type:Number,default:0,display: '阅读次数'},
        label         : {type:String,default:'',trim:true,display: '消息标签'},
        multi_media   : {type:String,default:'',trim:true,display: '图片/视频'},
        status        : {type:Number,default:1,min:0,max:3,display: '状态'},
        del_status    : {type:Number,default:0,min:0,max:3,display: '删除状态(0-未删除，1-已删除)'},
        _userId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            display: '用户信息ID'
        },
    },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const MessageModel = mongoose.model('messages',messageSchema);
module.exports = {
    MessageModel
}
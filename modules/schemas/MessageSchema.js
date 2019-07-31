'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const messageSchema = new Schema({
        type          : {type:Number,default:0,min:0,max:3,display: '消息类型'},
        info          : {type:String,default:'',trim:true,display: '内容'},
        address       : {type:Array,index: {type: '2d',sparse: true},display: '地理位置'},
        collectnum    : {type:Number,default:0,display: '收藏次数'},
        commentnum    : {type:Number,default:0,display: '评论次数'},
        agreenum      : {type:Number,default:0,display: '点赞次数'},
        readnum       : {type:Number,default:0,display: '阅读次数'},
        label         : {type:String,default:'',trim:true,display: '消息标签'},
        Multi_Media   : {type:String,default:'',trim:true,display: '图片/视频'},
        status        : {type:Number,default:0,min:0,max:3,display: '状态'},
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
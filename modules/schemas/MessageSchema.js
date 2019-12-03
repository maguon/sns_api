'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const messageSchema = new Schema({
        type          : {type:Number,default:0,min:0,max:3,display: '消息类型(1.文章 2.图片 3.视频 4.求助 )'},
        info          : {type:String,default:'',trim:true,display: '内容'},
        address       : {type:Array,index: {type: '2d',sparse: true},display: '地理位置'},
        addressName   : {type:String,default:'',trim:true,display: '地理位置名称'},
        addressReal   : {type:String,default:'',trim:true,display: '真实地址'},
        collectNum    : {type:Number,default:0,display: '收藏次数'},
        commentsNum   : {type:Number,default:0,display: '评论次数'},
        agreeNum      : {type:Number,default:0,display: '点赞次数'},
        readNum       : {type:Number,default:0,display: '阅读次数'},
        label         : {type:String,default:'',trim:true,display: '消息标签'},
        multi_media   : {type:String,default:'',trim:true,display: '图片/视频'},
        status        : {type:Number,default:1,min:0,max:3,display: '状态（0-不可见，1-可见）'},
        comment_status    : {type:Number,default:0,min:0,max:3,display: '评论状态(0-允许评论，1-不允许评论)'},
        _userId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            display: '用户信息ID'
        },
    },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const MessageModel = mongoose.model('messages_info',messageSchema);
module.exports = {
    MessageModel
}
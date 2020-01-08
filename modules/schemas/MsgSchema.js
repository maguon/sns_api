'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const msgSchema = new Schema({
        type          : {type:Number,default:0,min:0,max:3,display: '消息类型(1.文章 2.求助 )'},
        carrier       : {type:Number,default:0,min:0,max:5,display: '载体类型(1.文本 2.图片 3.视频 4.位置分享 )'},
        info          : {type:String,default:'',trim:true,display: '内容'},
        address       : {type:Array,index: {type: '2d',sparse: true},display: '发布文章-地理位置(格式： [纬度，经度])'},
        address_name  : {type:String,default:'',trim:true,display: '发布文章-地理位置名称'},
        address_real  : {type:String,default:'',trim:true,display: '发布文章-真实地址'},
        address_show  : {type:Number,default:0,min:0,max:3,display: '发布文章-位置显示状态(0-不可见，1-可见)'},
        collect_num   : {type:Number,default:0,display: '收藏次数'},
        comment_num  : {type:Number,default:0,display: '评论次数'},
        agree_num     : {type:Number,default:0,display: '点赞次数'},
        read_num      : {type:Number,default:0,display: '阅读次数'},
        label         : {type:String,default:'',trim:true,display: '消息标签'},
        media         : {type:Object,trim:true,display: '图片/视频'},
        location      : {type:Array,index: {type: '2d',sparse: true},display: '位置分享-地理位置(格式： [纬度，经度])'},
        location_name : {type:String,default:'',trim:true,display: '位置分享-地理位置名称'},
        location_real : {type:String,default:'',trim:true,display: '位置分享-真实地址'},
        status        : {type:Number,default:1,min:0,max:3,display: '文章状态（0-不可见，1-可见(默认)）'},
        comment_status: {type:Number,default:0,min:0,max:3,display: '评论状态(0-允许评论(默认)，1-不允许评论)'},
        _user_id: {
            type: Schema.Types.ObjectId,
            ref: 'user_info',
            display: '用户信息ID'
        }
    },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const MsgModel = mongoose.model('msg_info',msgSchema);
module.exports = {
    MsgModel
}
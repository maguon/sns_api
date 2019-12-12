'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();

const Schema = mongoose.Schema;
const userDetailSchema = new Schema({
        sex                     : {type:Number,default:0,min:0,max:3,display: '性别（0-女 1-男）'},
        nick_name               : {type:String,default:'',trim:true,display: '用户昵称'},
        real_name               : {type:String,default:'',trim:true,display: '真实姓名'},
        city_name               : {type:String,default:'',trim:true,display: '城市名称'},
        intro                   : {type:String,default:'',trim:true,display: '签名'},
        avatar                  : {type:String,default:'',trim:true,display: '用户头像'},
        messagesNum             : {type:Number,default:0,display: '发布文章数'},
        messagesHelpNum         : {type:Number,default:0,display: '发布求助数'},
        followNum               : {type:Number,default:0,display: '我的关注数'},
        attentionNum            : {type:Number,default:0,display: '被关注数'},
        commentsNum             : {type:Number,default:0,display: '评论次数'},
        commentsReplyNum        : {type:Number,default:0,display: '评论回复次数'},
        voteNum                 : {type:Number,default:0,display: '参与投票数'},
        messageCollectionNum    : {type:Number,default:0,display: '收藏文章数'},
        locationCollectionNum   : {type:Number,default:0,display: '收藏位置数'},
        _userId: {
            type: Schema.Types.ObjectId,
            ref: 'user_info',
            display: '用户信息ID'
        }
    },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const UserDetailModel = mongoose.model('user_detail',userDetailSchema)
module.exports = {
    UserDetailModel
}
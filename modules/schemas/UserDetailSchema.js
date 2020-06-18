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
        msg_num                 : {type:Number,default:0,display: '发布文章数'},
        msg_help_num            : {type:Number,default:0,display: '发布求助数'},
        follow_num              : {type:Number,default:0,display: '我的关注数'},
        attention_num           : {type:Number,default:0,display: '被关注数'},
        comment_num             : {type:Number,default:0,display: '评论次数'},
        comment_reply_num       : {type:Number,default:0,display: '评论回复次数'},
        vote_num                : {type:Number,default:0,display: '参与投票数'},
        msg_coll_num            : {type:Number,default:0,display: '收藏文章数'},
        loca_coll_num           : {type:Number,default:0,display: '收藏位置数'},
        block_list              : {type:Array,default:[],display: '黑名单'},
        _user_id: {
            type: Schema.Types.ObjectId,
            ref: 'user_info',
            display: '用户信息ID'
        }
    },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const UserDetailModel = mongoose.model('user_detail',userDetailSchema);
module.exports = {
    UserDetailModel
}
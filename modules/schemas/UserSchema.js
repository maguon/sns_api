'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const userSchema = new Schema({
        phone         : {type:Number,default:0,display: '用户电话'},
        password      : {type:String,default:'',trim:true,display: '用户密码'},
        nikename      : {type:String,default:'',trim:true,display: '用户昵称'},
        type          : {type:Number,default:0,min:0,max:3,display: '用户类型（1-普通，2-会员）'},
        status        : {type:Number,default:0,min:0,max:3,display: '状态（1-使用 0-禁用）'},
        del_status    : {type:Number,default:0,min:0,max:3,display: '删除状态(0-未删除，1-已删除)'},
        auth_status   : {type:Number,default:0,min:0,max:3,display: '认证状态(0-未认证,1-已认证)'},
        last_login_on : {type:Date,default:new Date(),display: '最后登录时间'},
        _userDetailId: {
            type: Schema.Types.ObjectId,
            ref: 'userDetail',
            display: '用户详细信息ID'
        },
    },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const UserModel = mongoose.model('user',userSchema)
module.exports = {
    UserModel
}
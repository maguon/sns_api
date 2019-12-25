'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const userSchema = new Schema({
        phone         : {type:String,default:'',trim:true,display: '用户电话'},
        password      : {type:String,default:'',trim:true,display: '用户密码'},
        type          : {type:Number,default:0,min:0,max:3,display: '用户类型（1-普通，2-会员）'},
        status        : {type:Number,default:1,min:0,max:3,display: '状态（1-正常，2-禁言，4-停用 ）'},
        auth_status   : {type:Number,default:0,min:0,max:3,display: '认证状态(0-未认证,1-已认证)'},
        auth_time     : {type:Date,default:new Date(),display: '验证时间'},
        last_login_on : {type:Date,default:new Date(),display: '最后登录时间'},
        _userDetailId : {
            type: Schema.Types.ObjectId,
            ref: 'user_detail',
            display: '用户详细信息ID'
        },
        _userDriveId : {
            type: Schema.Types.ObjectId,
            ref: 'user_drive_info',
            display: '用户驾驶信息ID'
        }
    },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const UserModel = mongoose.model('user_info',userSchema)
module.exports = {
    UserModel
}
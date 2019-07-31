'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const userSchema = new Schema({
        phone         : {type:Number,default:0,display: '用户电话'},
        password      : {type:String,default:'',trim:true,display: '用户密码'},
        nikename      : {type:String,default:'',trim:true,display: '用户昵称'},
        status        : {type:Number,default:0,min:0,max:3,display: '验证状态'},
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
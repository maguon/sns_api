'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const adminUserSchema = new Schema({
        name          : {type:String,default:'',trim:true,display: '名称'},
        realname      : {type:String,default:'',trim:true,display: '真实姓名'},
        phone         : {type:String,default:'',trim:true,display: '电话'},
        password      : {type:String,default:'',trim:true,display: '密码'},
        gender        : {type:Number,default:0,min:0,max:3,display: '性别（0-女 1-男）'},
        type          : {type:String,default:0,display: '管理员类型(99-超级管理员)'},
        status        : {type:Number,default:1,min:0,max:3,display: '状态（0-停用，1-启用）'}
    },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const AdminUserModel = mongoose.model('admin_user',adminUserSchema)
module.exports = {
    AdminUserModel
}
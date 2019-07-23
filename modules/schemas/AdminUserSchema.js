'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const adminUserSchema = new Schema({
        name          : {type:String,default:'',trim:true,display: '名称'},
        realname      : {type:String,default:'',trim:true,display: '真实姓名'},
        phone         : {type:Number,default:0,display: '电话'},
        password      : {type:String,default:'',trim:true,display: '密码'},
        status        : {type:Number,default:0,min:0,max:3,display: '状态'},
        gender        : {type:Number,default:0,min:0,max:3,display: '性别'},
        type          : {type:String,default:0,display: '标签'}
    },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const AdminUserModel = mongoose.model('adminUser',adminUserSchema)
module.exports = {
    AdminUserModel
}
'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();

const Schema = mongoose.Schema;
const userDetailSchema = new Schema({
        sex           : {type:Number,default:0,min:0,max:3,display: '性别'},
        birthday      : {type:String,default: '',display: '生日'},
        realmname     : {type:String,default:'',trim:true,display: '个性域名'},
        intro         : {type:String,default:'',trim:true,display: '简介'},
        label         : {type:String,default:'',trim:true,display: '标签'},
        truename      : {type:String,default:'',trim:true,display: '真实姓名'},
        avatar        : {type:String,default:'',trim:true,display: '用户头像'},
        drivingtype   : {type:String,default:'',trim:true,display: '驾驶证类型'},
        _userId: {
            type: Schema.Types.ObjectId,
            ref: 'UserModel',
            display: '用户信息ID'
        },
    },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const UserDetailModel = mongoose.model('userDetail',userDetailSchema)
module.exports = {
    UserDetailModel
}
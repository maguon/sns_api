'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const userDeviceSchema = new Schema({
        device_token  : {type:String,default:'',trim:true,display: '设备标号'},
        version       : {type:String,default:'',trim:true,display: '设备版本'},
        app_type      : {type:Number,default:0,min:0,max:3,display: 'app登录类型（1-司机之家）'},
        device_type   : {type:Number,default:0,min:0,max:3,display: '设备类型(1-android,2-ios)'},
        status        : {type:Number,default:0,min:0,max:3,display: '设备登录状态(-1-退出登录，1-登录中)'},
        _user_id: {
            type: Schema.Types.ObjectId,
            ref: 'user_info',
            display: '用户信息ID'
        }
    },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const UserDeviceModel = mongoose.model('user_deviceS',userDeviceSchema);
module.exports = {
    UserDeviceModel
}
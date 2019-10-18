'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const privacySettingsSchema = new Schema({
        name_display         : {type:Number,default:1,min:0,max:3,display: '显示姓名（0-不显示，1-显示）'},
        phone_display        : {type:Number,default:1,min:0,max:3,display: '显示电话（0-不显示，1-显示）'},
        city_display         : {type:Number,default:1,min:0,max:3,display: '显示城市（0-不显示，1-显示）'},
        car_display          : {type:Number,default:1,min:0,max:3,display: '显示车辆信息（0-不显示，1-显示）'},
        recommend_to_friends : {type:Number,default:1,min:0,max:3,display: '允许将我推荐给好友（0-不允许，1-允许）'},
        message_authority    : {type:Number,default:1,min:0,max:3,display: '发消息权限（0-所有人，1-我关注的，2-相互关注的）'},
        _userId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            display: '用户信息ID'
        }
    },
{ timestamps: { createdAt: 'created_at',updatedAt : 'updated_at'}
});

const PrivacySettingsModel = mongoose.model('privacy_settings',privacySettingsSchema);
module.exports = {
    PrivacySettingsModel
}
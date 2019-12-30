'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const privacySettingsSchema = new Schema({
        name_display           : {type:Number,default:1,display: '显示姓名（0-不显示，1-显示(默认)）'},
        phone_display          : {type:Number,default:1,display: '显示电话（0-不显示，1-显示(默认)）'},
        city_display           : {type:Number,default:1,display: '显示城市（0-不显示，1-显示(默认)）'},
        car_display            : {type:Number,default:1,display: '显示车辆信息（0-不显示，1-显示(默认)）'},
        recommend_to_friends   : {type:Number,default:1,display: '允许将我推荐给好友（0-不允许，1-允许(默认)）'},
        message_authority      : {type:Number,default:1,display: '谁可以发消息给我（0-所有人，1-相互关注，2-我关注的）'},
        _userId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            display: '用户信息ID'
        },
    },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const PrivacySettingsModel = mongoose.model('privacy_settings',privacySettingsSchema);
module.exports = {
    PrivacySettingsModel
}
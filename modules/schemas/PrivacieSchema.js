'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const privacieSchema = new Schema({
        name                  : {type:Number,default:1,display: '显示姓名（0-不显示，1-显示(默认)）'},
        phone                 : {type:Number,default:1,display: '显示电话（0-不显示，1-显示(默认)）'},
        city                  : {type:Number,default:1,display: '显示城市（0-不显示，1-显示(默认)）'},
        car                   : {type:Number,default:1,display: '显示车辆信息（0-不显示，1-显示(默认)）'},
        recommend_to_friends  : {type:Number,default:1,display: '允许将我推荐给好友（0-不允许，1-允许(默认)）'},
        msg_authority         : {type:Number,default:1,display: '谁可以发消息给我（0-所有人，1-相互关注，2-我关注的）'},
        _user_id: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            display: '用户信息ID'
        },
    },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const PrivacieModel = mongoose.model('privacie',privacieSchema);
module.exports = {
    PrivacieModel
}
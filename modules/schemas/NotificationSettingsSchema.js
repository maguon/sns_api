'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const notificationSettingsSchema = new Schema({
        info                       : {type:Number,default:1,display: '消息(0-不通知，1-通知(默认))'},
        praise                     : {type:Number,default:1,display: '点赞(0-不通知，1-通知(默认))'},
        comments                   : {type:Number,default:1,display: '评论(0-不通知，1-通知(默认))'},
        beConcernedAbout           : {type:Number,default:1,display: '被关注(0-不通知，1-通知(默认))'},
        others                     : {type:Number,default:1,display: '@其他人(0-不通知，1-通知(默认))'},
        worksReleasedByFollowers   : {type:Number,default:1,display: '关注人发布的作品(0-不通知，1-通知(默认))'},
        recommendedWorks           : {type:Number,default:1,display: '推荐作品(0-不通知，1-通知(默认))'},
        _userId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            display: '用户信息ID'
        },
    },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const NotificationSettingsModel = mongoose.model('notification_settings',notificationSettingsSchema);
module.exports = {
    NotificationSettingsModel
}
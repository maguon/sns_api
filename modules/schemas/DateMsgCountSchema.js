'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const dateMsgCountSchema = new Schema({
        date              : {type:Number,default:0,display: '日期'},
        day               : {type:Number,default:0,display: '日'},
        week              : {type:Number,default:0,display: '星期'},
        month             : {type:Number,default:0,display: '月'},
        year              : {type:Number,default:0,display: '年'},
        y_month           : {type:Number,default:0,display: '年_月'},
        y_week            : {type:Number,default:0,display: '年_周'},

        new_msg_num       : {type:Number,default:0,display: '新增文章'},
        msg_art_text      : {type:Number,default:0,display: '文章-文本'},
        msg_art_picture   : {type:Number,default:0,display: '文章-图片'},
        msg_art_video     : {type:Number,default:0,display: '文章-视频'},
        msg_art_position  : {type:Number,default:0,display: '文章-地理位置'},
        msg_help_text     : {type:Number,default:0,display: '求助-文本'},
        msg_help_picture  : {type:Number,default:0,display: '求助-图片'},
        msg_help_video    : {type:Number,default:0,display: '求助-视频'},
        msg_help_position : {type:Number,default:0,display: '求助-地理位置'}

    },
        { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const DateMsgCountModel = mongoose.model('date_msg_count',dateMsgCountSchema);
module.exports = {
    DateMsgCountModel
}
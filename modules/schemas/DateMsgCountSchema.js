'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const dateMsgCountSchema = new Schema({
        m_date              : {type:Number,default:0,display: '日期'},
        m_day               : {type:Number,default:0,display: '日'},
        m_week              : {type:Number,default:0,display: '星期'},
        m_month             : {type:Number,default:0,display: '月'},
        m_year              : {type:Number,default:0,display: '年'},
        y_month             : {type:Number,default:0,display: '年_月'},
        y_week              : {type:Number,default:0,display: '年_周'},

        m_type              : {type:Number,default:0,display: '消息类型（1.文章 2.求助 ）'},
        m_carrier           : {type:Number,default:0,display: '载体类型（1.文本 2.图片 3.视频 4.位置分享）'},
        m_count             : {type:Number,default:0,display: '统计'}

    },
        { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const DateMsgCountModel = mongoose.model('date_msg_count',dateMsgCountSchema);
module.exports = {
    DateMsgCountModel
}
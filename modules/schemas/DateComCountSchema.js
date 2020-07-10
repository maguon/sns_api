'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const dateComCountSchema = new Schema({
        c_date              : {type:Number,default:0,display: '日期'},
        c_day               : {type:Number,default:0,display: '日'},
        c_week              : {type:Number,default:0,display: '星期'},
        c_month             : {type:Number,default:0,display: '月'},
        c_year              : {type:Number,default:0,display: '年'},
        y_month             : {type:Number,default:0,display: '年_月'},
        y_week              : {type:Number,default:0,display: '年_周'},

        c_type              : {type:Number,default:0,display: '消息类型(1.文章 2.求助 )'},
        c_level             : {type:Number,default:0,display: '评论类型(1.一级评论 2.二级评论)'},
        c_count             : {type:Number,default:0,display: '统计'}
    },
        { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const DateComCountModel = mongoose.model('date_com_count',dateComCountSchema);
module.exports = {
    DateComCountModel
}
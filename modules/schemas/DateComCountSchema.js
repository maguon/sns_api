'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const dateComCountSchema = new Schema({
        date              : {type:Number,default:0,display: '日期'},
        day               : {type:Number,default:0,display: '日'},
        week              : {type:Number,default:0,display: '星期'},
        month             : {type:Number,default:0,display: '月'},
        year              : {type:Number,default:0,display: '年'},
        y_month           : {type:Number,default:0,display: '年_月'},
        y_week            : {type:Number,default:0,display: '年_周'},

        new_com_num       : {type:Number,default:0,display: '新增评论'},
        com_art_first     : {type:Number,default:0,display: '评论-文章-一级'},
        com_art_two       : {type:Number,default:0,display: '评论-文章-二级'},
        com_help_first    : {type:Number,default:0,display: '评论-求助-一级'},
        com_help_two      : {type:Number,default:0,display: '评论-求助-二级'}
    },
        { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const DateComCountModel = mongoose.model('date_com_count',dateComCountSchema);
module.exports = {
    DateComCountModel
}
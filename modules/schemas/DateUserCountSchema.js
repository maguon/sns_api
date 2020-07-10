'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const dateUserCountSchema = new Schema({
        u_date              : {type:Number,default:0,display: '日期'},
        u_day               : {type:Number,default:0,display: '日'},
        u_week              : {type:Number,default:0,display: '星期'},
        u_month             : {type:Number,default:0,display: '月'},
        u_year              : {type:Number,default:0,display: '年'},
        y_month             : {type:Number,default:0,display: '年_月'},
        y_week              : {type:Number,default:0,display: '年_周'},

        u_type              : {type:Number,default:0,display: '类型（1.新增）'},
        u_count             : {type:Number,default:0,display: '统计'}

    },
        { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const DateUserCountModel = mongoose.model('date_user_count',dateUserCountSchema);
module.exports = {
    DateUserCountModel
}
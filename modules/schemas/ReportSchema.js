'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const reportSchema = new Schema({
        status          : {type:Number,default:1,min:0,max:3,display: '处理状态（1-未处理（默认），2-已处理）'},
        valid_results   : {type:Number,default:2,min:0,max:3,display: '处理结果（1-有效，2-无效(默认)）'},
        remarks         : {type:String,default:'',display: '说明'},
        review          : {type:String,default:'',display: '管理员处理说明'},
        review_time     : {type:Date,display: '处理时间'},
        _user_id: {
            type: Schema.Types.ObjectId,
            ref: 'user_info',
            display: '用户信息ID'
        },
        _msg_id: {
            type: Schema.Types.ObjectId,
            ref: 'msg_info',
            display: '动态ID'
        },
        _admin_id: {
            type: Schema.Types.ObjectId,
            ref: 'admin_user',
            display: '管理员ID'
        }
    },
        { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const ReportModel = mongoose.model('report',reportSchema);
module.exports = {
    ReportModel
}
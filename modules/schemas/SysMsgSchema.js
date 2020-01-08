'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const sysMsgSchema = new Schema({
        info          : {type:String,default:'',trim:true,display: '内容'},
        status        : {type:Number,default:1,min:0,max:3,display: '状态（0-不可见，1-可见(默认)）'},
        type          : {type:Number,default:0,min:0,max:3,display: '类型(1-所有用户 2-单个用户 )'},
        _admin_id: {
            type: Schema.Types.ObjectId,
            ref: 'admin_user',
            display: '管理员ID'
        },
        _user_id: {
            type: Schema.Types.ObjectId,
            ref: 'user_info',
            display: '用户信息ID'
        }
        },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const SysMsgModel = mongoose.model('sys_msg',sysMsgSchema);
module.exports = {
    SysMsgModel
}
'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const systemMessageSchema = new Schema({
        info          : {type:String,default:'',trim:true,display: '内容'},
        status        : {type:Number,default:1,min:0,max:3,display: '状态（0-不可见，1-可见(默认)）'},
        _adminId: {
            type: Schema.Types.ObjectId,
            ref: 'admin_user',
            display: '管理员ID'
        }
        },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const SystemMessageModel = mongoose.model('system_message',systemMessageSchema);
module.exports = {
    SystemMessageModel
}
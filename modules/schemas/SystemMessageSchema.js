'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const systemMessageSchema = new Schema({
        info          : {type:String,default:'',trim:true,display: '内容'},
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
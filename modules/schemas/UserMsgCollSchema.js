'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const userMsgCollSchema = new Schema({
        remarks       : {type:String,default:'',display: '备注'},
        _user_id: {
            type: Schema.Types.ObjectId,
            ref: 'user_info',
            display: '用户信息ID'
        },
        _msg_id: {
            type: Schema.Types.ObjectId,
            ref: 'msg_info',
            display: '动态ID'
        }
    },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const UserMsgCollModel = mongoose.model('user_msg_coll',userMsgCollSchema);
module.exports = {
    UserMsgCollModel
}
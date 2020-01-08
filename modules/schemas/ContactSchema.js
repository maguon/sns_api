'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const contactSchema = new Schema({
        status          : {type:Number,default:0,display: '申请状态（0-未读，1-拒绝，2-同意）'},
        remarks         : {type:String,default:'',display: '备注'},
        _user_id: {
            type: Schema.Types.ObjectId,
            ref: 'user_info',
            display: '申请人ID'
        },
        _be_invited_user_id: {
            type: Schema.Types.ObjectId,
            ref: 'user_info',
            display: '被邀请人ID'
        }
    },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const ContactModel = mongoose.model('contact',contactSchema);
module.exports = {
    ContactModel
}
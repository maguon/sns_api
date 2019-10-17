'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const applicationContactSchema = new Schema({
        status          : {type:Number,default:0,display: '申请状态（0-未读，1-拒绝，2-同意）'},
        _userId: {
            type: Schema.Types.ObjectId,
            ref: 'user_info',
            display: '申请人ID'
        },
        _beInvitedUserId: {
            type: Schema.Types.ObjectId,
            ref: 'user_info',
            display: '被邀请人ID'
        }
    },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const ApplicationContactModel = mongoose.model('application_contact',applicationContactSchema);
module.exports = {
    ApplicationContactModel
}
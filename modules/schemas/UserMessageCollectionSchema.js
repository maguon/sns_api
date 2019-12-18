'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const userMessageCollectionSchema = new Schema({
        remarks       : {type:String,default:'',display: '备注'},
        _userId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            display: '用户信息ID'
        },
        _messageId: {
            type: Schema.Types.ObjectId,
            ref: 'messages',
            display: '动态ID'
        }
    },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const UserMessageCollectionsModel = mongoose.model('user_message_collections',userMessageCollectionSchema);
module.exports = {
    UserMessageCollectionsModel
}
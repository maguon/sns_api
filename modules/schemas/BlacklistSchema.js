'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const blacklistSchema = new Schema({
        _userId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            display: '用户信息ID'
        },
       _addedUserId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            display: '被添加用户信息ID'
        },

    },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const BlacklistModel = mongoose.model('blacklist',blacklistSchema);
module.exports = {
    BlacklistModel
}
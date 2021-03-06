'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const userRelationSchema = new Schema({
        type          : {type:Number,default:0,min:0,max:3,display: '关系类型（0-关注,1-好友）'},
        _user_id: {
            type: Schema.Types.ObjectId,
            ref: 'user_info',
            display: '发表用户ID'
        },
        _user_by_id: {
            type: Schema.Types.ObjectId,
            ref: 'user_info',
            display: '被关注用户'
        }
    },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const UserRelationModel = mongoose.model('user_relation',userRelationSchema);
module.exports = {
    UserRelationModel
}
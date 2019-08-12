'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const relationSchema = new Schema({
        type          : {type:Number,default:0,min:0,max:3,display: '关系类型（0-关注）'},
        groupName     : {type:Number,default:0,min:0,max:3,display: '关系组名（0-好友）'},
        status        : {type:Number,default:1,min:0,max:3,display: '状态（0-停用，1-启用）'},
        del_status    : {type:Number,default:0,min:0,max:3,display: '删除状态(0-未删除，1-已删除)'},
        _userId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            display: '发表用户ID'
        },
        _userById: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            display: '被关注用户'
        }
    },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const RelationModel = mongoose.model('relation',relationSchema)
module.exports = {
    RelationModel
}
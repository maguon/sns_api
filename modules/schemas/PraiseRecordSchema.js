'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const praiseRecordSchema = new Schema({
        _id           : {type:String},
        status        : {type:Number,default:0,min:0,max:3,display: '状态'},
        type          : {type:Number,default:0,display: '类型'},
        },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const PraiseRecordModel = mongoose.model('praiseRecord',praiseRecordSchema)
module.exports = {
    PraiseRecordModel
}
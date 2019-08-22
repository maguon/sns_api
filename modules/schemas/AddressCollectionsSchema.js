'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const addressCollectionsSchema = new Schema({
        address       : {type:Array,index: {type: '2d',sparse: true},display: '地理位置'},
        status        : {type:Number,default:1,min:0,max:3,display: '状态（0-停用，1-启用）'},
        remarks       : {type:String,default:'',display: '备注'},
        _userId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            display: '用户信息ID'
        },
    },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const AddressCollectionsModel = mongoose.model('address_collections',addressCollectionsSchema);
module.exports = {
    AddressCollectionsModel
}
'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const userLocaCollSchema = new Schema({
        address       : {type:Array,index: {type: '2d',sparse: true},display: '地理位置'},
        address_name   : {type:String,default:'',trim:true,display: '地理位置名称'},
        address_real   : {type:String,default:'',trim:true,display: '真实地址'},
        remarks       : {type:String,default:'',display: '备注'},
        _user_id: {
            type: Schema.Types.ObjectId,
            ref: 'user_info',
            display: '用户信息ID'
        }
    },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const UserLocaCollModel = mongoose.model('user_loca_coll',userLocaCollSchema);
module.exports = {
    UserLocaCollModel
}
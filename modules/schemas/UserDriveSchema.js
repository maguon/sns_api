'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();

const Schema = mongoose.Schema;
const userDriveSchema = new Schema({
        driving_type        : {type:Number,default:1,display: '驾驶证类型'},
        certification_date  : {type:String,default:'',trim:true,display: '发证日期'},
        _user_id: {
            type: Schema.Types.ObjectId,
            ref: 'user_info',
            display: '用户信息ID'
        }
    },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const UserDriveModel = mongoose.model('user_drive',userDriveSchema)
module.exports = {
    UserDriveModel
}
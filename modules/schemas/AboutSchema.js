'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const aboutSchema = new Schema({
        corporate_name  : {type:String,default:'',display: '公司名称'},
        info            : {type:String,default:'',display: '详细介绍'},
        phone           : {type:String,default:'',display: '电话'},
        remarks         : {type:String,default:'',display: '备注'},
        _adminId: {
            type: Schema.Types.ObjectId,
            ref: 'admin_user',
            display: '管理员ID'
        },
    },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const AboutModel = mongoose.model('about_info',aboutSchema)
module.exports = {
    AboutModel
}
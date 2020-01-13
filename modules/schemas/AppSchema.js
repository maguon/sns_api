'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const appSchema = new Schema({
        app_type       : {type:Number,default:'',display: 'app类型(1-司机之家)'},
        device_type    : {type:Number,default:'',display: '设备类型(1-安卓 2-苹果)'},
        version        : {type:String,default:'',display: '版本号'},
        version_num    : {type:Number,default:'',display: '版本序号'},
        min_version_num: {type:Number,default:'',display: '最小支持版本'},
        force_update   : {type:Number,default:'',display: '是否强制更新(0-不更新 1-更新)'},
        url            : {type:String,default:'',display: '下载地址'},
        remarks        : {type:String,default:'',display: '备注'},
        status         : {type:Number,default:1,min:0,max:3,display: '状态(0:启用,1:停用)'},
    },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const AppModel = mongoose.model('app_info',appSchema);
module.exports = {
    AppModel
}
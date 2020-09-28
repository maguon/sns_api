'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const adminMenuListSchema = new Schema({
        type          : {type:String,default:0,display: '管理员类型(99-超级管理员, 1-其他)'},
        menu_list     : [{
            label    : {type:String,default:'',trim:true,display: '标签'},
            icon     : {type:String,default:'',trim:true,display: '图标'},
            link     : {type:String,default:'',trim:true,display: '链接'},
            children : {type:Array,default:'',trim:true,display: ''}
        }],
    },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const AdminMenuListModel = mongoose.model('admin_menu_list',adminMenuListSchema);
module.exports = {
    AdminMenuListModel
}
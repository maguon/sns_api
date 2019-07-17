'use strict'

const mongoose = require('../../db/connections/MongoCon.js').getMongo();
const Schema = mongoose.Schema;
const app = new Schema({
        app_type:String,
        device_type:String,
        version:String,
        version_num:Number,
        min_version_num:Number,
        force_update:{type:Number,default:0},
        url:String
    },
    { timestamps: { createdAt: 'created_at',updatedAt : 'updated_at' }
    });

const AppModel = mongoose.model('app',app)
module.exports = {
    AppModel
}
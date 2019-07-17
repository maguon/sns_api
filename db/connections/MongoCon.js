'usestrict'
const mongoose = require('mongoose');
const sysConfig = require('../../config/SystemConfig');
const serverLogger = require('../../util/ServerLogger');
const logger = serverLogger.createLogger('MongoCon');




try{
    mongoose.connect(sysConfig.mongoConfig.connect,{useNewUrlParser: true});
    logger.info('Connect Mongodb Success');
}catch(err){
    logger.error('Connect mongodb error :' +err.stack)
}

const getMongo = ()=>{
    return mongoose ;
}

module.exports = {
    getMongo: getMongo
};


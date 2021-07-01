const httpUtil = require('../util/HttpUtil');
const resUtil = require('../util/ResponseUtil');
const serverLogger = require('../util/ServerLogger');
const logger = serverLogger.createLogger('CommonController');


const getAmapRegeo = (req, res, next) => {

    const queryObj ={
      location:req.query.lon+','+req.query.lat,
      key:'22d16ea40b6fdb3ebc3daa1b48db3287',
      radius:200,
      extensions:'all'
    }
    let url = "/v3/geocode/regeo";
    httpUtil.httpsGet('restapi.amap.com','443',url,queryObj,(error,result)=>{
        if(error){
            logger.error(' getAmapRegeo ' + error);
            resUtil.resInternalError(error,res);
        }else{
            logger.info(' getAmapRegeo ' + 'success');
            resUtil.resetQueryRes(res, result);
        }

    })
}

module.exports = {
    getAmapRegeo
}

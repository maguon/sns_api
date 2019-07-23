'use strict';
const Errors = require('restify-errors');

const resetQueryRes = (res,result,errMsg) =>{
    res.send(200,{success : true,result:result,msg:errMsg});
}

const resetCreateRes = (res,result,errMsg) =>{
    if(result && result._id){
        res.send(200,{success : true,id:result._id});
    }else{
        res.send(200,{success : false,msg:errMsg});
    }
}

const resetUpdateRes = (res,result,errMsg)=>{
    if(result && result !=null){
        res.send(200,{success : true,n:result.valueOf().n,ok:result.valueOf().ok});
    }else{
        res.send(200,{success : false,msg:errMsg});
    }
}

const resetFailedRes = (res,errMsg)=>{
    res.send(200,{success:false,msg:errMsg});
}

const resInternalError = (error,res ,next) => {
    const internalError = Errors.InternalServerError();
    res.send(internalError);
    return next();
}

module.exports = {
    resetQueryRes,
    resetCreateRes,
    resetUpdateRes ,
    resetFailedRes ,
    resInternalError
}
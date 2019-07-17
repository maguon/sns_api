'use strict';
let crypto = require('crypto');


const encryptByMd5=(clearText,key)=>{
    const md5Key = key.toString('ascii');
    let md5 = crypto.createHmac('md5',md5Key);
    return md5.update(clearText).digest('hex').toUpperCase();
}

const encryptByMd5Key=(clearText, key)=>{
    clearText = clearText + key;

    return crypto.createHash('md5').update(clearText, 'utf8').digest("hex");
}

const encryptByMd5NoKey=(clearText)=>{
    let Buffer = require("buffer").Buffer;
    let buf = new Buffer(clearText);
    let str = buf.toString("binary");
    let md5 = crypto.createHash('md5');
    return md5.update(str).digest('hex').toUpperCase();
}

const encryptByAES=(plainText,aceKey)=>{
    let cipher = crypto.createCipher('aes-256-cbc',aceKey);
    let cipherText = cipher.update(plainText,'utf8','hex');
    cipherText += cipher.final('hex');
    return cipherText;
}

const decryptByAES=(cipherText,aceKey)=>{
    let decipher = crypto.createDecipher('aes-256-cbc',aceKey);
    let dec = decipher.update(cipherText,'hex','utf8');
    if(dec == null || dec.length<1){
        return null;
    }
    dec += decipher.final('utf8');
    return dec;
}
const base64Encode=(input)=>{
    let output = "";
    let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    let _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+=";
    let i = 0;
    input = utf8Encode(input);
    while (i < input.length) {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);
        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;
        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }
        output = output +
            _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
            _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
    }
    if(output != null ){
        let l = output.length%4;
        if(l>0){
            for(;l<5;l++){
                output = output + '=';
            }
        }
    }
    return output;
}

const base64Decode=(input)=>{
    let output = "";
    let chr1, chr2, chr3;
    let enc1, enc2, enc3, enc4;
    let i = 0;
    let _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+=";
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    while (i < input.length) {
        enc1 = _keyStr.indexOf(input.charAt(i++));
        enc2 = _keyStr.indexOf(input.charAt(i++));
        enc3 = _keyStr.indexOf(input.charAt(i++));
        enc4 = _keyStr.indexOf(input.charAt(i++));
        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;
        output = output + String.fromCharCode(chr1);
        if (enc3 != 64) {
            output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
            output = output + String.fromCharCode(chr3);
        }
    }
    output = utf8Decode(output);
    return output;
}

const utf8Encode=(string)=>{
    string = string.replace(/\r\n/g,"\n");
    let encodeText = "";
    for(let n = 0; n < string.length; n++) {
        let c = string.charCodeAt(n);
        if(c < 128) {
            encodeText += String.fromCharCode(c);
        }else if((c > 127) && (c < 2048)) {
            encodeText += String.fromCharCode((c >> 6) | 192);
            encodeText += String.fromCharCode((c & 63) | 128);
        }else{
            encodeText += String.fromCharCode((c >> 12) | 224);
            encodeText += String.fromCharCode(((c >> 6) & 63) | 128);
            encodeText += String.fromCharCode((c & 63) | 128);
        }
    }
    return encodeText;
}

const utf8Decode=(encodeText)=>{
    let string = "";
    let i = 0;
    let c1;
    let c2;
    let c3;
    let c = c1 = c2 = 0;
    while ( i < encodeText.length ) {
        c = encodeText.charCodeAt(i);
        if (c < 128) {
            string += String.fromCharCode(c);
            i++;
        } else if((c > 191) && (c < 224)) {
            c2 = encodeText.charCodeAt(i+1);
            string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
            i += 2;
        } else {
            c2 = encodeText.charCodeAt(i+1);
            c3 = encodeText.charCodeAt(i+2);
            string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            i += 3;
        }
    }
    return string;
}

const randomString=(e)=>{
    e = e || 32;
    let t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
        a = t.length,
        n = "";
    for (let i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
    return n
}

module.exports = {
    encryptByMd5,
    encryptByMd5Key,
    base64Decode,
    base64Encode,
    encryptByMd5NoKey,
    randomString
};
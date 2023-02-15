const saltedSha256 = require('salted-sha256');

var parseToJSONFrDB = function(a){
    return JSON.parse(JSON.stringify(a))
}

var generRandString = function(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
   
    return text;
}

var generAccessTokenUser = function(username){
    const headerServer = {
        "typ": "JWT",
        "alg": "HS256",
        "for": "user"
    };
    const payloadServer = {
        username:username
    };
    const base64HeaderStr = Buffer.from(JSON.stringify(headerServer)).toString("base64");
    const base64PayloadStr = Buffer.from(JSON.stringify(payloadServer)).toString("base64");
    const dataCombinHeadPay = base64HeaderStr + '.' + base64PayloadStr;
    const hashedData = saltedSha256(dataCombinHeadPay, process.env.SECRET_KEY);
    const signature = Buffer.from(hashedData).toString("base64");
    const accesstokenServer = base64HeaderStr + '.' + base64PayloadStr + '.' + signature;
    return accesstokenServer.replace(/[;'"-]/g,'');
}

var decodeFromBase64 = function(base64String){
    return Buffer.from(base64String,'base64').toString('ascii');
}

var verifyAuthorizationUser = function(accesstokenClient){
    const headerServer = {
        "typ": "JWT",
        "alg": "HS256",
        "for": "user"
    };
    const payloadAccessClient = JSON.parse(decodeFromBase64(accesstokenClient.split('.')[1]));

    if(typeof payloadAccessClient.username === undefined) return {authState:0,data:null};
    
    const base64HeaderStr = Buffer.from(JSON.stringify(headerServer)).toString("base64");
    const base64PayloadStr = Buffer.from(JSON.stringify(payloadAccessClient)).toString("base64");
    const dataCombinHeadPay = base64HeaderStr + '.' + base64PayloadStr;
    const hashedData = saltedSha256(dataCombinHeadPay, process.env.SECRET_KEY);
    const signature = Buffer.from(hashedData).toString("base64");
    const accesstokenServer = (base64HeaderStr + '.' + base64PayloadStr + '.' + signature);
    return {authState:accesstokenClient == accesstokenServer,data:payloadAccessClient};
};

module.exports = {
    parseToJSONFrDB:parseToJSONFrDB,
    generRandString:generRandString,
    verifyAuthorizationUser:verifyAuthorizationUser,
    generAccessTokenUser:generAccessTokenUser,
}
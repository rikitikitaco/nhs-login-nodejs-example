
const fs            = require('fs');
const jwt           = require('jsonwebtoken');
const uuidv1        = require('uuid/v1');

exports.GenerateAssertionJwt = function (TOKEN_URI, clientId) {
    // You don't want to store secrets in the repository for a prouction application!
    var privateKEY  = fs.readFileSync('./keys/private_key.pem', 'utf8');
    var signOptions = {
        issuer:  clientId,
        subject:  clientId,
        audience:  TOKEN_URI,
        expiresIn:  "30m",
        algorithm:  "RS512"
    };

    return jwt.sign({jti: uuidv1()}, privateKEY, signOptions);
}
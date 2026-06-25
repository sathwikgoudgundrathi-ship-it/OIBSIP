const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function createJwt(user){
    return jwt.sign({ id:user._id, role:user.role }, process.env.JWT_SECRET, { expiresIn:'7d' });
}

function createToken(){
    return crypto.randomBytes(32).toString('hex');
}

module.exports = { createJwt, createToken };

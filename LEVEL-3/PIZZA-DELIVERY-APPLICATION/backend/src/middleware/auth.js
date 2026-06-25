const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function protect(req,res,next){
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if(!token){
        return res.status(401).json({ message:'Authentication required' });
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        next();
    }catch(error){
        res.status(401).json({ message:'Invalid token' });
    }
}

function adminOnly(req,res,next){
    if(req.user?.role !== 'admin'){
        return res.status(403).json({ message:'Admin access required' });
    }
    next();
}

module.exports = { protect, adminOnly };

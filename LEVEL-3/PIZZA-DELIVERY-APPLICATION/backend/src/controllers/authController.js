const User = require('../models/User');
const { createJwt, createToken } = require('../utils/tokens');
const { sendEmail } = require('../utils/email');

async function register(req,res){
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if(exists) return res.status(409).json({ message:'Email already registered' });

    const verificationToken = createToken();
    const user = await User.create({ name, email, password, role, verificationToken });
    await sendEmail({
        to:user.email,
        subject:'Verify your pizza account',
        text:`Use this token to verify your account: ${verificationToken}`
    });

    res.status(201).json({ token:createJwt(user), user:{ id:user._id, name:user.name, email:user.email, role:user.role } });
}

async function login(req,res){
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if(!user || !(await user.matchPassword(password))){
        return res.status(401).json({ message:'Invalid email or password' });
    }

    res.json({ token:createJwt(user), user:{ id:user._id, name:user.name, email:user.email, role:user.role } });
}

async function verifyEmail(req,res){
    const user = await User.findOne({ verificationToken:req.body.token });
    if(!user) return res.status(400).json({ message:'Invalid verification token' });
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    res.json({ message:'Email verified successfully' });
}

async function forgotPassword(req,res){
    const user = await User.findOne({ email:req.body.email });
    if(!user) return res.json({ message:'If the email exists, reset instructions were sent' });

    user.resetToken = createToken();
    user.resetTokenExpires = new Date(Date.now() + 1000 * 60 * 15);
    await user.save();
    await sendEmail({
        to:user.email,
        subject:'Pizza account password reset',
        text:`Use this reset token within 15 minutes: ${user.resetToken}`
    });
    res.json({ message:'If the email exists, reset instructions were sent' });
}

async function resetPassword(req,res){
    const user = await User.findOne({
        resetToken:req.body.token,
        resetTokenExpires:{ $gt:new Date() }
    });
    if(!user) return res.status(400).json({ message:'Invalid or expired reset token' });

    user.password = req.body.password;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();
    res.json({ message:'Password updated successfully' });
}

module.exports = { register, login, verifyEmail, forgotPassword, resetPassword };

const nodemailer = require('nodemailer');

function getTransporter(){
    return nodemailer.createTransport({
        host:process.env.SMTP_HOST,
        port:Number(process.env.SMTP_PORT || 587),
        secure:false,
        auth:{ user:process.env.SMTP_USER, pass:process.env.SMTP_PASS }
    });
}

async function sendEmail({ to, subject, text }){
    if(!process.env.SMTP_USER || !process.env.SMTP_PASS){
        console.log('Email skipped:', subject, text);
        return;
    }

    await getTransporter().sendMail({
        from:process.env.SMTP_USER,
        to,
        subject,
        text
    });
}

async function sendLowStockAlert(item){
    await sendEmail({
        to:process.env.ADMIN_EMAIL,
        subject:`Low stock alert: ${item.name}`,
        text:`${item.name} stock is ${item.stock}, below threshold ${item.threshold}.`
    });
}

module.exports = { sendEmail, sendLowStockAlert };

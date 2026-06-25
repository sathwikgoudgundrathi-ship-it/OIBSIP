const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user:{ type:mongoose.Schema.Types.ObjectId, ref:'User', required:true },
    items:[{
        item:{ type:mongoose.Schema.Types.ObjectId, ref:'InventoryItem' },
        name:String,
        category:String,
        price:Number
    }],
    amount:{ type:Number, required:true },
    paymentStatus:{ type:String, enum:['created','paid','failed'], default:'created' },
    razorpayOrderId:String,
    status:{
        type:String,
        enum:['Order Received','In The Kitchen','Sent To Delivery'],
        default:'Order Received'
    }
}, { timestamps:true });

module.exports = mongoose.model('Order', orderSchema);

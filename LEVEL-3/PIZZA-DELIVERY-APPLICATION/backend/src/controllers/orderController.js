const Razorpay = require('razorpay');
const InventoryItem = require('../models/InventoryItem');
const Order = require('../models/Order');
const { sendLowStockAlert } = require('../utils/email');

function getRazorpay(){
    return new Razorpay({
        key_id:process.env.RAZORPAY_KEY_ID,
        key_secret:process.env.RAZORPAY_KEY_SECRET
    });
}

function hasRealRazorpayKeys(){
    return process.env.RAZORPAY_KEY_ID &&
        process.env.RAZORPAY_KEY_SECRET &&
        !process.env.RAZORPAY_KEY_ID.includes('your_key') &&
        !process.env.RAZORPAY_KEY_SECRET.includes('your_razorpay_secret');
}

async function createOrder(req,res){
    const selectedIds = [req.body.base, req.body.sauce, req.body.cheese, ...(req.body.veggies || [])].filter(Boolean);
    const items = await InventoryItem.find({ _id:{ $in:selectedIds } });

    if(items.length !== selectedIds.length){
        return res.status(400).json({ message:'One or more selected ingredients are unavailable' });
    }

    const outOfStock = items.find(item => item.stock <= 0);
    if(outOfStock){
        return res.status(400).json({ message:`${outOfStock.name} is out of stock` });
    }

    const amount = items.reduce((sum,item) => sum + item.price, 0);
    let razorpayOrder = { id:`test_order_${Date.now()}` };

    if(hasRealRazorpayKeys()){
        razorpayOrder = await getRazorpay().orders.create({
            amount:amount * 100,
            currency:'INR',
            receipt:`pizza_${Date.now()}`
        });
    }

    const order = await Order.create({
        user:req.user._id,
        items:items.map(item => ({ item:item._id, name:item.name, category:item.category, price:item.price })),
        amount,
        razorpayOrderId:razorpayOrder.id
    });

    res.status(201).json({ order, razorpayOrder });
}

async function confirmPayment(req,res){
    const order = await Order.findById(req.params.id);
    if(!order) return res.status(404).json({ message:'Order not found' });
    if(String(order.user) !== String(req.user._id) && req.user.role !== 'admin'){
        return res.status(403).json({ message:'Not allowed' });
    }

    if(order.paymentStatus === 'paid'){
        return res.json(order);
    }

    order.paymentStatus = 'paid';
    await order.save();

    for(const orderedItem of order.items){
        const item = await InventoryItem.findByIdAndUpdate(orderedItem.item, { $inc:{ stock:-1 } }, { new:true });
        if(item && item.stock < item.threshold){
            await sendLowStockAlert(item);
        }
    }

    res.json(order);
}

async function myOrders(req,res){
    const orders = await Order.find({ user:req.user._id }).sort({ createdAt:-1 });
    res.json(orders);
}

async function allOrders(req,res){
    const orders = await Order.find().populate('user','name email').sort({ createdAt:-1 });
    res.json(orders);
}

async function updateStatus(req,res){
    const order = await Order.findByIdAndUpdate(req.params.id, { status:req.body.status }, { new:true });
    res.json(order);
}

module.exports = { createOrder, confirmPayment, myOrders, allOrders, updateStatus };

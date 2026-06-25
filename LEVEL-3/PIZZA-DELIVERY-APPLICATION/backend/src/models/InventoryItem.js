const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
    name:{ type:String, required:true },
    category:{ type:String, enum:['base','sauce','cheese','veggie'], required:true },
    stock:{ type:Number, required:true, min:0 },
    threshold:{ type:Number, default:20 },
    price:{ type:Number, required:true, min:0 },
    image:String
}, { timestamps:true });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);

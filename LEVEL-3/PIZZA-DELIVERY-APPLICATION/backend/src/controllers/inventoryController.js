const InventoryItem = require('../models/InventoryItem');

async function listInventory(req,res){
    const items = await InventoryItem.find().sort({ category:1, name:1 });
    res.json(items);
}

async function upsertInventory(req,res){
    const item = await InventoryItem.findByIdAndUpdate(req.params.id, req.body, { new:true, upsert:true, setDefaultsOnInsert:true });
    res.json(item);
}

async function createInventory(req,res){
    const item = await InventoryItem.create(req.body);
    res.status(201).json(item);
}

async function deleteInventory(req,res){
    await InventoryItem.findByIdAndDelete(req.params.id);
    res.json({ message:'Inventory item deleted' });
}

module.exports = { listInventory, createInventory, upsertInventory, deleteInventory };

const dotenv = require('dotenv');
const connectDB = require('../config/db');
const InventoryItem = require('../models/InventoryItem');
const User = require('../models/User');

dotenv.config();

const items = [
    ['Classic Hand Tossed','base',60,50],['Thin Crust','base',70,50],['Cheese Burst','base',90,50],['Whole Wheat','base',65,50],['Gluten Free','base',95,50],
    ['Tomato Basil','sauce',25,50],['Peri Peri','sauce',30,50],['Barbeque','sauce',35,50],['Pesto','sauce',40,50],['Garlic Ranch','sauce',30,50],
    ['Mozzarella','cheese',55,50],['Cheddar','cheese',50,50],['Parmesan','cheese',65,50],
    ['Onion','veggie',15,50],['Capsicum','veggie',15,50],['Sweet Corn','veggie',20,50],['Olives','veggie',25,50],['Jalapeno','veggie',25,50]
];

async function seed(){
    await connectDB();
    await InventoryItem.deleteMany();
    await InventoryItem.insertMany(items.map(([name, category, price, stock]) => ({ name, category, price, stock, threshold:20 })));

    const adminExists = await User.findOne({ email:'admin@pizza.test' });
    if(!adminExists){
        await User.create({ name:'Admin', email:'admin@pizza.test', password:'admin123', role:'admin', isVerified:true });
    }

    console.log('Seed complete');
    process.exit(0);
}

seed();

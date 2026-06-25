const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const orderRoutes = require('./routes/orderRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(cors({ origin:process.env.CLIENT_URL || '*', credentials:true }));
app.use(express.json());

app.get('/api/health', (req,res) => res.json({ status:'ok', service:'pizza-delivery-api' }));
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Pizza API running on port ${port}`));

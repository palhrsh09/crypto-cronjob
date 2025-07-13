const cron = require('node-cron');
const axios = require('axios');
const History = require('./models/History');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const COINGECKO_API = process.env.COINGECKO_API;
const MONGO_URI = process.env.MONGO_URL;

mongoose.connect(MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

cron.schedule('* * * * *', async () => {
  try {
    console.log('Running cron job to fetch and store coin data...');
    const response = await axios.get(COINGECKO_API);
    const historyRecords = response.data.map(coin => ({
      coinId: coin.id,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      price: coin.current_price,
      marketCap: coin.market_cap,
      change24h: coin.price_change_percentage_24h,
      timestamp: new Date(coin.last_updated),
    }));

    await History.insertMany(historyRecords);
    console.log('History snapshot saved');
  } catch (error) {
    console.error('Cron job error:', error);
  }
});

console.log('Cron job scheduler started');

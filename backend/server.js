const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
const PORT = 3000;

mongoose.connect('mongodb://localhost:27017/mernstack', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const transactionSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  dateOfSale: Date,
  category: String,
  sold: Boolean,
});

const Transaction = mongoose.model('Transaction', transactionSchema);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


app.get('/initialize', async (req, res) => {
    try {
      const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
      await Transaction.insertMany(response.data);
      res.send('Database initialized with seed data');
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  
  app.get('/transactions', async (req, res) => {
    const { page = 1, perPage = 10, search = '' } = req.query;
    const searchRegex = new RegExp(search, 'i');
    try {
      const transactions = await Transaction.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { price: searchRegex },
        ],
      })
        .skip((page - 1) * perPage)
        .limit(Number(perPage));
      res.json(transactions);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  
  app.get('/statistics', async (req, res) => {
    const { month } = req.query;
    try {
      const stats = await Transaction.aggregate([
        {
          $project: {
            month: { $month: '$dateOfSale' },
            price: 1,
            sold: 1,
          },
        },
        { $match: { month: Number(month) } },
        {
          $group: {
            _id: null,
            totalSales: { $sum: '$price' },
            totalSoldItems: { $sum: { $cond: ['$sold', 1, 0] } },
            totalNotSoldItems: { $sum: { $cond: ['$sold', 0, 1] } },
          },
        },
      ]);
      res.json(stats[0]);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  
  app.get('/barchart', async (req, res) => {
    const { month } = req.query;
    try {
      const priceRanges = [
        { range: '0-100', min: 0, max: 100 },
        { range: '101-200', min: 101, max: 200 },
        { range: '201-300', min: 201, max: 300 },
        { range: '301-400', min: 301, max: 400 },
        { range: '401-500', min: 401, max: 500 },
        { range: '501-600', min: 501, max: 600 },
        { range: '601-700', min: 601, max: 700 },
        { range: '701-800', min: 701, max: 800 },
        { range: '801-900', min: 801, max: 900 },
        { range: '901-above', min: 901, max: Infinity },
      ];
  
      const results = await Promise.all(priceRanges.map(async (range) => {
        const count = await Transaction.countDocuments({
          dateOfSale: { $month: new Date(month, 0) },
          price: { $gte: range.min, $lte: range.max },
        });
        return { range: range.range, count };
      }));
  
      res.json(results);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  
  app.get('/piechart', async (req, res) => {
    const { month } = req.query;
    try {
      const categories = await Transaction.aggregate([
        {
          $project: {
            month: { $month: '$dateOfSale' },
            category: 1,
          },
        },
        { $match: { month: Number(month) } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
      ]);
      res.json(categories);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  
  app.get('/combined', async (req, res) => {
    const { month } = req.query;
    try {
      const [statistics, barChart, pieChart] = await Promise.all([
        axios.get(`http://localhost:3000/statistics?month=${month}`),
        axios.get(`http://localhost:3000/barchart?month=${month}`),
        axios.get(`http://localhost:3000/piechart?month=${month}`),
      ]);
      res.json({
        statistics: statistics.data,
        barChart: barChart.data,
        pieChart: pieChart.data,
      });
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
  
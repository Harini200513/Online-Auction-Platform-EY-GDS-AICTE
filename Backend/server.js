const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Load environment variables
const app = express();
//server is being configured to handle json
app.use(express.json());
//cors will help server to accept requests from multiple domains
app.use(cors());

const SECRET_KEY = process.env.SECRET_KEY || 'fallback_secret';

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/auctionDB');

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
/* create table user (username char(10) notnull unique) */
const User = mongoose.model('User', userSchema);

// Auction Item Schema
const auctionItemSchema = new mongoose.Schema({
  itemName: String,
  description: String,
  currentBid: Number,
  highestBidder: String,
  closingTime: Date,
  isClosed: { type: Boolean, default: false },
});

const AuctionItem = mongoose.model('AuctionItem', auctionItemSchema);

// Middleware to verify token
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid Token' });
    req.user = user;
    next();
  });
};

// Signup Route called when signup form is submitted on the frontend
app.post('/Signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) 
    {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password });
    await newUser.save();//a new user is being created in db

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Signin Route
app.post('/signin', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (user) {
    const token = jwt.sign({ userId: user._id, username }, SECRET_KEY, { expiresIn: '1h' });//this token helps the user to remain signed in for an 1hour
      res.json({ message: 'Signin successful', token });
  } else {
    res.status(400).json({ message: 'Invalid credentials' });
  }
});
// app.post('/Signin', async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     const user = await User.findOne({ username, password });
//     if (user) {
//       const token = jwt.sign({ userId: user._id, username }, SECRET_KEY, { expiresIn: '1h' });
//       res.json({ message: 'Signin successful', token });
//     }
//     else {
//       res.status(400).json({ message: 'Invalid credentials' });
//     }
//   } catch (error) {
//     console.error('Signin Error:', error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });

// Create Auction Item (Protected)
app.post('/auction', authenticate, async (req, res) => {
  try {
    const { itemName, description, startingBid, closingTime } = req.body;

    if (!itemName || !description || !startingBid || !closingTime) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newItem = new AuctionItem({
      itemName,
      description,
      currentBid: startingBid,
      highestBidder: '',
      closingTime,
    });

    await newItem.save();
    res.status(201).json({ message: 'Auction item created', item: newItem });
  } catch (error) {
    console.error('Auction Post Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get all auction items
app.get('/auctions', async (req, res) => {
  try {
    const auctions = await AuctionItem.find();//get all
    //select * from actionitem
    res.json(auctions);
  } catch (error) {
    console.error('Fetching Auctions Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get a single auction item by ID
app.get('/auctions/:id', async (req, res) => {
  try {
    const auctionItem = await AuctionItem.findById(req.params.id);
    if (!auctionItem) 
      return res.status(404).json({ message: 'Auction not found' });

    // Check if auction time has passed and update status
    if (!auctionItem.isClosed && new Date() > new Date(auctionItem.closingTime)) {
      auctionItem.isClosed = true;
      await auctionItem.save();
    }

    res.json(auctionItem);
  } catch (error) {
    console.error('Fetching Auction Item Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Bidding on an item (Protected)
app.post('/bid/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { bid } = req.body;
    
    // Convert bid to number
    const bidAmount = parseFloat(bid);
    if (isNaN(bidAmount) || bidAmount <= 0) {
      return res.status(400).json({ message: 'Invalid bid amount' });
    }

    const item = await AuctionItem.findById(id);

    if (!item) return res.status(404).json({ message: 'Auction item not found' });
    
    // Check if auction is already closed
    if (item.isClosed) {
      return res.json({ 
        message: 'Auction is closed', 
        winner: item.highestBidder,
        amount: item.currentBid
      });
    }

    // Check if auction time has passed
    if (new Date() > new Date(item.closingTime)) {
      item.isClosed = true;
      await item.save();
      return res.json({ 
        message: 'Auction closed', 
        winner: item.highestBidder || 'No bids placed',
        amount: item.currentBid
      });
    }

    // Validate bid is higher than current bid
    if (bidAmount > item.currentBid) {
      item.currentBid = bidAmount;
      item.highestBidder = req.user.username;
      await item.save();
      res.json({ message: 'Bid successful', item });
    } else {
      res.status(400).json({ message: `Bid must be higher than current bid of $${item.currentBid}` });
    }
  } catch (error) {
    console.error('Bidding Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete Auction Route
app.delete('/auction/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await AuctionItem.findByIdAndDelete(id);
    if (!deletedItem) return res.status(404).json({ message: 'Auction not found' });
    res.json({ message: 'Auction deleted successfully' });
  } catch (error) {
    console.error('Delete Auction Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Start the server
app.listen(5001, () => {
  console.log('Server is running on port 5001');
});

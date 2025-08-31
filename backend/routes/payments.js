const express = require('express');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get transaction history
router.get('/transactions', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;
    
    let query = { user: req.user._id };
    if (type) {
      query.type = type;
    }
    
    const transactions = await Transaction.find(query)
      .populate('pickup', 'wasteType weight')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Transaction.countDocuments(query);
    
    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Withdraw funds
router.post('/withdraw', auth, async (req, res) => {
  try {
    const { amount, bankDetails } = req.body;
    
    if (amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }
    
    if (amount > req.user.walletBalance) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    
    // Update user balance
    const user = await User.findById(req.user._id);
    user.walletBalance -= amount;
    await user.save();
    
    // Create transaction record
    const transaction = new Transaction({
      user: req.user._id,
      type: 'debit',
      amount: amount,
      description: 'Withdrawal to bank account',
      status: 'pending' // Will be updated when webhook confirms
    });
    
    await transaction.save();
    
    // In a real application, you would integrate with a payment gateway here
    // For demo purposes, we'll simulate a successful withdrawal
    
    // Simulate payment processing delay
    setTimeout(async () => {
      transaction.status = 'completed';
      await transaction.save();
    }, 2000);
    
    res.json({
      message: 'Withdrawal request submitted successfully',
      transactionId: transaction._id,
      newBalance: user.walletBalance
    });
  } catch (error) {
    console.error('Withdraw error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get wallet balance
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('walletBalance');
    res.json({ balance: user.walletBalance });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
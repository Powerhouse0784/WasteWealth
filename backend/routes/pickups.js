const express = require('express');
const Pickup = require('../models/Pickup');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all pickups for a user
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    let query = { user: req.user._id };
    if (status) {
      query.status = status;
    }
    
    const pickups = await Pickup.find(query)
      .populate('collector', 'name phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Pickup.countDocuments(query);
    
    res.json({
      pickups,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get pickups error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Schedule a new pickup
router.post('/', auth, async (req, res) => {
  try {
    const { wasteType, scheduledDate, address, notes } = req.body;
    
    const pickup = new Pickup({
      user: req.user._id,
      wasteType,
      scheduledDate,
      address: address || req.user.address,
      notes
    });
    
    await pickup.save();
    await pickup.populate('user', 'name phone');
    
    res.status(201).json({
      message: 'Pickup scheduled successfully',
      pickup
    });
  } catch (error) {
    console.error('Schedule pickup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific pickup
router.get('/:id', auth, async (req, res) => {
  try {
    const pickup = await Pickup.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('collector', 'name phone');
    
    if (!pickup) {
      return res.status(404).json({ message: 'Pickup not found' });
    }
    
    res.json({ pickup });
  } catch (error) {
    console.error('Get pickup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a pickup
router.put('/:id', auth, async (req, res) => {
  try {
    const { wasteType, scheduledDate, address, notes } = req.body;
    
    const pickup = await Pickup.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { wasteType, scheduledDate, address, notes, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('collector', 'name phone');
    
    if (!pickup) {
      return res.status(404).json({ message: 'Pickup not found' });
    }
    
    res.json({
      message: 'Pickup updated successfully',
      pickup
    });
  } catch (error) {
    console.error('Update pickup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel a pickup
router.delete('/:id', auth, async (req, res) => {
  try {
    const pickup = await Pickup.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, status: 'scheduled' },
      { status: 'cancelled', updatedAt: Date.now() },
      { new: true }
    );
    
    if (!pickup) {
      return res.status(404).json({ message: 'Pickup not found or cannot be cancelled' });
    }
    
    res.json({ message: 'Pickup cancelled successfully' });
  } catch (error) {
    console.error('Cancel pickup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Complete a pickup (for collectors)
router.post('/:id/complete', auth, async (req, res) => {
  try {
    // Check if user is a collector
    if (req.user.userType !== 'collector') {
      return res.status(403).json({ message: 'Only collectors can complete pickups' });
    }
    
    const { weight, notes } = req.body;
    
    const pickup = await Pickup.findOne({
      _id: req.params.id,
      collector: req.user._id,
      status: 'in-progress'
    });
    
    if (!pickup) {
      return res.status(404).json({ message: 'Pickup not found or not assigned to you' });
    }
    
    // Update pickup details
    pickup.weight = weight;
    pickup.amount = pickup.calculateAmount();
    pickup.status = 'completed';
    pickup.completedAt = Date.now();
    pickup.notes = notes || pickup.notes;
    pickup.updatedAt = Date.now();
    
    await pickup.save();
    
    // Credit user's wallet
    const user = await User.findById(pickup.user);
    user.walletBalance += pickup.amount;
    user.totalWasteRecycled += pickup.weight;
    await user.save();
    
    // Create transaction record
    const transaction = new Transaction({
      user: pickup.user,
      type: 'credit',
      amount: pickup.amount,
      description: `Payment for ${pickup.wasteType} waste pickup`,
      pickup: pickup._id,
      status: 'completed'
    });
    
    await transaction.save();
    
    await pickup.populate('user', 'name phone');
    
    res.json({
      message: 'Pickup completed successfully',
      pickup,
      amountCredited: pickup.amount
    });
  } catch (error) {
    console.error('Complete pickup error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
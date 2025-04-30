const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon'); 
const { protect, admin } = require('../middleware/authMiddleware'); 
const asyncHandler = require('express-async-handler'); 

router.use(protect, admin);

// @desc    Create a new coupon
// @route   POST /api/admin/coupons
// @access  Private/Admin
router.post('/', asyncHandler(async (req, res) => {
    const { code, discountType, discountValue, expiryDate, minPurchaseAmount, maxUsageLimit, description, isActive } = req.body;

    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
    if (couponExists) {
        res.status(400);
        throw new Error('Coupon code already exists');
    }

    const coupon = new Coupon({
        code,
        discountType,
        discountValue,
        expiryDate,
        minPurchaseAmount,
        maxUsageLimit,
        description,
        isActive,
    });

    const createdCoupon = await coupon.save();
    res.status(201).json(createdCoupon);
}));

// @desc    Get all coupons
// @route   GET /api/admin/coupons
// @access  Private/Admin
router.get('/', asyncHandler(async (req, res) => {
    // Thêm logic phân trang, tìm kiếm nếu muốn
    const coupons = await Coupon.find({});
    res.json(coupons);
}));

// @desc    Get single coupon by ID
// @route   GET /api/admin/coupons/:id
// @access  Private/Admin
router.get('/:id', asyncHandler(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);
    if (coupon) {
        res.json(coupon);
    } else {
        res.status(404);
        throw new Error('Coupon not found');
    }
}));

// @desc    Update a coupon
// @route   PUT /api/admin/coupons/:id
// @access  Private/Admin
router.put('/:id', asyncHandler(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
        coupon.code = req.body.code?.toUpperCase() || coupon.code;
        coupon.discountType = req.body.discountType || coupon.discountType;
        coupon.discountValue = req.body.discountValue ?? coupon.discountValue; 
        coupon.expiryDate = req.body.expiryDate || coupon.expiryDate;
        coupon.minPurchaseAmount = req.body.minPurchaseAmount ?? coupon.minPurchaseAmount; 
        coupon.maxUsageLimit = req.body.maxUsageLimit ?? coupon.maxUsageLimit; 
        coupon.description = req.body.description || coupon.description;
        coupon.isActive = req.body.isActive ?? coupon.isActive; 
        const updatedCoupon = await coupon.save();
        res.json(updatedCoupon);
    } else {
        res.status(404);
        throw new Error('Coupon not found');
    }
}));

// @desc    Delete a coupon (hoặc set inactive)
// @route   DELETE /api/admin/coupons/:id
// @access  Private/Admin
router.delete('/:id', asyncHandler(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
         coupon.isActive = false;
         await coupon.save();
         res.json({ message: 'Coupon deactivated' });

    } else {
        res.status(404);
        throw new Error('Coupon not found');
    }
}));

module.exports = router;
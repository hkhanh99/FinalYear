const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon'); 
const asyncHandler = require('express-async-handler'); 

 const { protect } = require('../middleware/authMiddleware');


// @desc    Validate a coupon code submitted by user
// @route   POST /api/coupons/validate
// @access  Public (hoặc Private nếu dùng 'protect')
router.post('/validate',  protect,  asyncHandler(async (req, res) => {
    const { couponCode, cartTotal } = req.body;

    if (!couponCode) {
        res.status(400); // Bad Request
        throw new Error('Vui lòng nhập mã giảm giá');
    }
    const numericCartTotal = Number(cartTotal);
    if (isNaN(numericCartTotal) || numericCartTotal < 0) {
        res.status(400);
        throw new Error('Tổng tiền giỏ hàng không hợp lệ');
    }

    const code = couponCode.trim().toUpperCase(); 

    const coupon = await Coupon.findOne({ code: code });

    if (!coupon) {
        res.status(404); // Not Found
        throw new Error(`Mã giảm giá "${couponCode}" không tồn tại.`);
    }

    if (!coupon.isActive) {
        res.status(400);
        throw new Error(`Mã giảm giá "${couponCode}" đã bị vô hiệu hóa.`);
    }

    if (coupon.expiryDate < new Date()) {
        Coupon.updateOne({ _id: coupon._id }, { isActive: false }).exec();
        res.status(400);
        throw new Error(`Mã giảm giá "${couponCode}" đã hết hạn.`);
    }

    if (coupon.maxUsageLimit !== null && coupon.usageCount >= coupon.maxUsageLimit) {
        res.status(400);
        throw new Error(`Mã giảm giá "${couponCode}" đã hết lượt sử dụng.`);
    }
    if (numericCartTotal < coupon.minPurchaseAmount) {
        res.status(400);
        throw new Error(`Bạn cần mua tối thiểu ${coupon.minPurchaseAmount.toLocaleString('vi-VN')}₫ để sử dụng mã "${couponCode}".`);
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
        discountAmount = (numericCartTotal * coupon.discountValue) / 100;
    } else if (coupon.discountType === 'fixed_amount') {
        discountAmount = coupon.discountValue;
        discountAmount = Math.min(discountAmount, numericCartTotal); 
    }

    discountAmount = Math.round(discountAmount); 

    res.status(200).json({
        isValid: true,
        message: `Áp dụng mã giảm giá "${couponCode}" thành công!`,
        coupon: { 
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
        },
        discountAmount: discountAmount,
    });
}));

module.exports = router;
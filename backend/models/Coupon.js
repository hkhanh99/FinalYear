const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      trim: true,
      uppercase: true, 
    },
    discountType: {
      type: String,
      required: true,
      enum: {
        values: ['percentage', 'fixed_amount'],
        message: '{VALUE} is not supported, use percentage or fixed_amount',
      },
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value cannot be negative'],
    },
    description: {
      type: String,
      trim: true,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    minPurchaseAmount: {
      type: Number,
      default: 0,
    },
    maxUsageLimit: { 
      type: Number,
      default: null, 
    },
    usageCount: { 
      type: Number,
      default: 0,
    }, 
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true } 
);

couponSchema.pre('save', function (next) {
  if (this.isModified('expiryDate') && this.expiryDate < new Date()) {
    return next(new Error('Expiry date must be in the future'));
  }
  next();
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
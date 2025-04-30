// models/Coupon.js
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      trim: true,
      uppercase: true, // Tự động chuyển mã thành chữ hoa để dễ so sánh
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
    maxUsageLimit: { // Tổng số lần coupon có thể được dùng
      type: Number,
      default: null, // null nghĩa là không giới hạn
    },
    usageCount: { // Số lần đã dùng
      type: Number,
      default: 0,
    },
    // (Tùy chọn nâng cao) Giới hạn mỗi người dùng
    // maxUsagePerUser: {
    //   type: Number,
    //   default: 1,
    // },
    // usedByUsers: [{
    //   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    //   count: { type: Number, default: 1 }
    // }],
    isActive: {
      type: Boolean,
      default: true,
    },
    // (Tùy chọn nâng cao) Áp dụng cho sản phẩm / danh mục cụ thể
    // applicableCategories: [String],
    // applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true } // Tự động thêm createdAt và updatedAt
);

// Middleware để đảm bảo ngày hết hạn phải sau ngày hiện tại khi tạo/cập nhật
couponSchema.pre('save', function (next) {
  if (this.isModified('expiryDate') && this.expiryDate < new Date()) {
    return next(new Error('Expiry date must be in the future'));
  }
  next();
});

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
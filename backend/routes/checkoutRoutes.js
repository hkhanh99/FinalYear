const express = require("express");
const Checkout = require("../models/Checkout")
const Cart = require("../models/Cart")
const Product = require("../models/Product")
const Order = require("../models/Order")
const {protect} = require("../middleware/authMiddleware");
const Coupon = require("../models/Coupon"); 
const asyncHandler = require("express-async-handler");

const router = express.Router();

//Create new checkout
router.post("/",protect, async (req,res) => {
    const {checkoutItems, shippingAddress, paymentMethod, totalPrice} = req.body;
    console.log("--- Received checkoutItems in POST /api/checkout: ---");
    console.log(JSON.stringify(checkoutItems, null, 2)); 
    if(!checkoutItems || checkoutItems.length === 0) {
        return res.status(400).json({message: "no items in checkout"})
    }
    try{
        const newCheckout = await Checkout.create({
            user: req.user._id,
            checkoutItem: checkoutItems,
            shippingAddress,
            paymentMethod,
            totalPrice,
            paymentStatus: "Pending",
            isPaid: false,
        });
        console.log(`Checkout created for user: ${req.user._id}`);
        res.status(201).json(newCheckout);
    } catch (error){
        console.error("Error Creating checkout session", error);
        res.status(500).json({message:"Server Error"});
    }
});

//Mark as paid after payment
router.put("/:id/pay", protect, async (req, res) => {
    const {paymentStatus, paymentDetails} = req.body;

    try {
        const checkout = await Checkout.findById(req.params.id);

        if(!checkout) {
            return res.status(404).json({message: "Checkout not found"})
        }

        if(paymentStatus === "paid") {
            checkout.isPaid = true;
            checkout.paymentStatus = paymentStatus;
            checkout.paymentDetails = paymentDetails;
            checkout.paidAt = Date.now();
            await checkout.save();

            res.status(200).json(checkout);
        }else {
            res.status(400).json({message: "Invalid Payment Status"});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server Error"});
    }
});

// @desc    Finalize checkout, convert to order, apply coupon
// @route   POST /api/checkout/:id/finalize
// @access  Private
router.post("/:id/finalize", protect, asyncHandler(async (req, res) => {
    const checkoutId = req.params.id;
    const { appliedCouponCode } = req.body;

    const checkout = await Checkout.findById(checkoutId);

    if (checkout) {
        console.log(`--- Read checkout.checkoutItem in /finalize (ID: ${checkoutId}): ---`);
        console.log(JSON.stringify(checkout.checkoutItem || 'Not Found/Empty', null, 2));
    } else {
        res.status(404);
        throw new Error("Checkout session not found");
    }

    if (checkout.isPaid && !checkout.isFinalized) {

        if (!checkout.checkoutItem || checkout.checkoutItem.length === 0) {
            res.status(400);
            throw new Error('Cannot finalize checkout with empty items');
        }

        const itemIds = checkout.checkoutItem.map(item => item.productId);
        const productsFromDB = await Product.find({ _id: { $in: itemIds } });

        const itemsPrice = checkout.checkoutItem.reduce((acc, item) => {
            const productInfo = productsFromDB.find(p => p._id.toString() === item.productId?.toString());
            if (!productInfo) {
                console.warn(`Finalize Step: Product with ID ${item.productId} not found in DB.`);
                return acc;
            }
            return acc + productInfo.price * item.quantity;
        }, 0);

        const shippingPrice = 0;
        const taxPrice = 0;

        let finalDiscountAmount = 0;
        let couponUsedCode = null;
        if (appliedCouponCode) {
            const code = appliedCouponCode.trim().toUpperCase();
            const coupon = await Coupon.findOne({ code: code });
            let isCouponStillValid = false;
            if (coupon && coupon.isActive && coupon.expiryDate >= new Date() && (coupon.maxUsageLimit === null || coupon.usageCount < coupon.maxUsageLimit) && itemsPrice >= coupon.minPurchaseAmount) {
                 isCouponStillValid = true;
            }

            if (isCouponStillValid) {
                if (coupon.discountType === 'percentage') {
                    finalDiscountAmount = Math.round((itemsPrice * coupon.discountValue) / 100);
                } else {
                    finalDiscountAmount = Math.min(coupon.discountValue, itemsPrice);
                }
                couponUsedCode = coupon.code;
            } else {
                console.warn(`Coupon ${code} no longer valid during finalize.`);
                 finalDiscountAmount = 0;
                 couponUsedCode = null;
            }
        }
        const finalTotalPrice = itemsPrice - finalDiscountAmount;

        const finalOrder = await Order.create({
            user: checkout.user,
            orderItems: checkout.checkoutItem.map(item => ({
                productId: item.productId,      
                name: item.name,
                quantity: item.quantity,   
                image: item.image,
                price: productsFromDB.find(p => p._id.toString() === item.productId?.toString())?.price || item.price,
                size: item.size,            
                color: item.color,          
            })),
            shippingAddress: checkout.shippingAddress,
            paymentMethod: checkout.paymentMethod,
            itemsPrice: itemsPrice,
           
            totalPrice: finalTotalPrice < 0 ? 0 : finalTotalPrice,
            couponCode: couponUsedCode,
            discountAmount: finalDiscountAmount,
            isPaid: true,
            paidAt: checkout.paidAt,
            paymentStatus: "paid",
            paymentDetails: checkout.paymentDetails,
            isDelivered: false,
          
        });

        if (couponUsedCode) {
             try {
                await Coupon.updateOne({ code: couponUsedCode }, { $inc: { usageCount: 1 } });
                console.log(`Incremented usage count for coupon: ${couponUsedCode}`);
            } catch (error) {
                console.error(`Error updating usage count for coupon ${couponUsedCode}:`, error);
            }
        }
    
        checkout.isFinalized = true;
        checkout.finalizedAt = Date.now();
        await checkout.save();
        await Cart.findOneAndDelete({ user: checkout.user });

        res.status(201).json(finalOrder);

    } else if (checkout.isFinalized) {
        res.status(400).json({ message: "Checkout session already finalized" });
    } else { 
        res.status(400).json({ message: "Checkout session is not paid yet" });
    }
}));

module.exports = router;
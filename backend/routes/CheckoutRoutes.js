const express = require("express");
const Checkout = require("../models/Checkout")
const Cart = require("../models/Cart")
const Product = require("../models/Product")
const Order = require("../models/Order")
const {protect} = require("../middleware/authMiddleware");

const router = express.Router();

//Create new checkout
router.post("/",protect, async (req,res) => {
    const {checkoutItems, shippingAddress, paymentMethod, totalPrice} = req.body;

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

//Finalize checkout, convert to order
router.post("/:id/finalize", protect, async (req,res) => {
    try{
        const checkout = await Checkout.findById(req.params.id);
        if(!checkout){
            return res.status(404).json({message: "Checkout not found"})
        }

        if(checkout.isPaid && !checkout.isFinalized) {
            const finalOrder = await Order.create({
                user: checkout.user,
                orderItems: checkout.checkoutItem,
                shippingAddress: checkout.shippingAddress,
                paymentMethod: checkout.paymentMethod,
                totalPrice: checkout.totalPrice,
                isPaid: true,
                paidAt: checkout.paidAt,
                isDelivered: false,
                paymentStatus: "paid",
                paymentDetails: checkout.paymentDetails,
            })

            checkout.isFinalized = true;
            checkout.finalizedAt = Date.now();
            await checkout.save();

            await Cart.findOneAndDelete({user: checkout.user})
            res.status(201).json(finalOrder);
        } else if (checkout.isFinalized) {
            res.status(400).json({message:"Checkout already finalized"})
        } else {
            res.status(400).json({message: "Checkout is not paid"});
        }
    } catch (error){
        console.error(error);
        res.status(500).json({message: "Server Error"});
    }
})

module.exports = router;
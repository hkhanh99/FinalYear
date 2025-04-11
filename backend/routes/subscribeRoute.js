const express = require ("express");
const router = express.Router();
const Subscriber = require("../models/Subcribers");

//Newsletter subscription
router.post("/subscribe", async(req,res) => {
    const {email} = req.body;

    if(!email) {
        return res.status(400).json({message: "Email is required"})
    }

    try {
        let subscriber = await Subscriber.findOne({email});

        if (subscriber){
            return res.status(400).json({message: "email is already subscribed"})
        }

        subscriber = new Subscriber({email});
        await subscriber.save();

        res.status(201).json({message: "Successfully subscribed to the newsletter"});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server Error"})
    }
})

module.exports = router
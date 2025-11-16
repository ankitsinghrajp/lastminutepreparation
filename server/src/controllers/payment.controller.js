import { asyncHandler } from "../utils/asyncHandler.js";
import {razorpayInstance} from "../../index.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { configDotenv } from "dotenv";
import crypto from"crypto";
import { ApiError } from "../utils/APIError.js";
import { Payment } from "../models/payment.model.js";
import { User } from "../models/user.model.js";
configDotenv();

const checkout = asyncHandler(async (req, res)=>{
     const {amount, planType, userId} = req.body;
     const options = {
        amount: Number(amount*100),
        currency:"INR",
        notes: {
        planType, 
        userId    
    }
     }

     const order = await razorpayInstance.orders.create(options);

     return res.status(200).json(new ApiResponse(200,{order},"Payment success!"));
})

const paymentVerification = asyncHandler(async (req, res)=>{
     
    const {razorpay_payment_id,razorpay_order_id, razorpay_signature} = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto.createHmac('sha256',process.env.RAZORPAY_KEY_SECRET)
                                    .update(body.toString())
                                    .digest('hex');
    
    const isAuthentic = razorpay_signature === expectedSignature;

    if(!isAuthentic){
        throw new ApiError(400,"Payment failed! Signature is invalid");
    }

    const order = await razorpayInstance.orders.fetch(razorpay_order_id);
    const {planType, userId} = order.notes;

    const expiryDate = new Date(Date.now() + 30 * 24  * 60 * 60 * 1000) //30 days from now

    await User.findByIdAndUpdate(
        userId,
        {
            planType,
            planExpiry:expiryDate
        },
        {
            new:true
        }
    )

    await Payment.create({
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature
    })


    res.redirect(`http://localhost:5173/payment-success?reference=${razorpay_payment_id}`);
})

const getKey = asyncHandler(async (req,res)=>{
    return res.status(200).json(
        new ApiResponse(200,{key:process.env.RAZORPAY_API_KEY})
    )
})




export {
    checkout,
    paymentVerification,
    getKey
}
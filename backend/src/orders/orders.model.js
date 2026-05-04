

const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    orderId: String,
    
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },


    products: [
        {
            productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
            },
            quantity: { type: Number, required: true }
        }
    ],
    
    
    // products: [
    //     {
    //         productId: { type: String, required: true },
    //         quantity: { type: Number, required: true }
    //     }
    // ],
    amount: Number,
    email: { type: String, required: true },
    status: {
        type: String,
        enum: ["pending", "processing", "shipped", "completed"],
        default: "pending"
    },
    // paypal 
    isPaid: {
     type: Boolean,
     default: false
    },
    paidAt: Date,
    paymentMethod: {
      type: String,
      enum: ["stripe", "paypal"],
      required: true
    },
    paymentResult: {
      id: String,
      status: String,
      email_address: String
    }

}, {
    timestamps: true
}
)

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
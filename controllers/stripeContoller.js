const prisma = require("../config/prisma")
const stripe = require("stripe")('sk_test_51QZDO4GvNeTqmrOSuUjjtkCj2X7JBX9Y8pUal3sdK86b4RaJK4Vsx7eHoDd5rxWAUg5Vnr5RNV1QPDhD5FMT8I1a001a7DM10u');



exports.payment = async (req, res) => {
    try {
        // Check User
        // req.user.id
        const cart = await prisma.cart.findFirst({
            where:{
                orderedById: req.user.id
            }
        })
        const amountTHB = cart.cartTotal * 100

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            // amount: calculateOrderAmount(items),
            amount: amountTHB,
            currency: "thb",
            // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
        });


        // res.send('Hello Payment')
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}

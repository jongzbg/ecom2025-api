const { json } = require("express")
const prisma = require("../config/prisma")


exports.listUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                enabled: true,
                address: true
            }
        })
        res.send(users)
    } catch (error) {
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}

exports.changeStatus = async (req, res) => {
    try {
        const { id, enabled } = req.body
        console.log(id, enabled)
        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: { enabled: enabled }
        })
        res.send("hello changeStatus")
    } catch (error) {
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}

exports.changeRole = async (req, res) => {
    try {
        const { id, role } = req.body
        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: { role: role }
        })
        res.send("Update Role Success")
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}

exports.userCart = async (req, res) => {
    try {
        const { cart } = req.body
        console.log(cart)
        console.log(req.user.id)

        const user = await prisma.user.findFirst({
            where: { id: Number(req.user.id) }
        })
        // console.log(user)

        // Check Quantity
        for (const item of cart) {
            // console.log(item)
            const product = await prisma.product.findUnique({
                where: { id: item.id },
                select: { title: true, quantity: true }
            })

            // console.log(item)
            console.log(product)

            if (!product || item.count > product.quantity) {
                return res.status(400).json({
                    ok: false,
                    message: `Sorry, The ${product?.title || 'Product'} Not Ready`
                })
            }
        }

        // Deleted old Cart item
        await prisma.productOnCart.deleteMany({
            where: {
                cart: {
                    orderedById: user.id
                }
            }
        })

        // // Deleted old Cart
        await prisma.cart.deleteMany({
            where: { orderedById: user.id }
        })

        // เตรียมสินค้า
        let products = cart.map((item) => ({
            productId: item.id,
            count: item.count,
            price: item.price
        }))
        console.log(products)

        // หาผลรวม
        let cartTotal = products.reduce((sum, item) =>
            sum + item.price * item.count, 0)

        // New Cart
        const newCart = await prisma.cart.create({
            data: {
                products: {
                    create: products
                },
                cartTotal: cartTotal,
                orderedById: user.id
            }
        })

        console.log(cartTotal)
        res.send("Add to cart success")
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}

exports.getUserCart = async (req, res) => {
    try {
        const cart = await prisma.cart.findFirst({
            where: {
                orderedById: Number(req.user.id)
            },
            include: {
                products: {
                    include: {
                        product: true
                    }
                }
            }
        })
        // console.log(cart)
        res.json({
            products: cart.products,
            cartTotal: cart.cartTotal

        })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}

exports.emptyCart = async (req, res) => {
    try {
        const cart = await prisma.cart.findFirst({
            where: { orderedById: Number(req.user.id) }
        })

        if (!cart) {
            return res.status(400).json({ message: "No cart" })
        }

        await prisma.productOnCart.deleteMany({
            where: { cartId: cart.id }
        })

        const result = await prisma.cart.deleteMany({
            where: { orderedById: Number(req.user.id) }
        })
        // console.log(result)
        // res.json({message: "Cart Empty Success",deleteCount: result.count})
        res.json({ message: "Cart Empty Success", deletedCount: result.count })
    } catch (error) {
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}

exports.saveAddress = async (req, res) => {
    try {
        const { address } = req.body
        console.log(address)
        const addressUser = await prisma.user.update({
            where: {
                id: Number(req.user.id)
            },
            data: {
                address: address
            }
        })
        // res.send("Hello saveAddress")
        res.json({ ok: true, message: "Address update success" })
    } catch (error) {
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}

exports.saveOrder = async (req, res) => {
    try {

        // Step 0 Check Stipe
        // console.log(req.body)
        // return res.send('Hello eiei')
        // stripePaymentId String
        // amout Int
        // status String
        // currency String
        const { id, amount, status, currency } = req.body.paymentIntent

        // Step 1 Get User Cart
        const userCart = await prisma.cart.findFirst({
            where: {
                orderedById: Number(req.user.id)
            },
            include: { products: true }
        })

        // Check Empty
        if (!userCart || userCart.products.length === 0) {
            return res.status(400).json({ ok: false, message: "Cart is Empty" })
        }

        // Check Quantity
        // for (const item of userCart.products) {
        //     // console.log(item)
        //     const product = await prisma.product.findUnique({
        //         where: { id: item.productId },
        //         select: { title: true, quantity: true }
        //     })

        //     // console.log(item)
        //     // console.log(product)

        //     if (!product || item.count > product.quantity) {
        //         return res.status(400).json({ ok: false, message: `Sorry, The ${product?.title || 'Product'} Not Ready` })
        //     }
        // }

        const amountTHB = Number(amount) / 100

        // Create New order
        const order = await prisma.order.create({
            data: {
                products: {
                    create: userCart.products.map((item) => ({
                        productId: item.productId,
                        count: item.count,
                        price: item.price,

                    }))
                },
                orderedBy: {
                    connect: { id: req.user.id },
                },
                cartTotal: userCart.cartTotal,
                stripePaymentId: id,
                amount: amountTHB,
                status: status,
                currency: currency,
            },
        })
        // console.log(order)
        // stripePaymentId String
        // amout Int
        // status String
        // currency String

        // Update Product
        const updateProduct = userCart.products.map((item) => ({
            where: { id: item.productId },
            data: {
                quantity: { decrement: item.count },
                sold: { increment: item.count }
            }
        }))
        console.log(updateProduct)

        await Promise.all(
            updateProduct.map((updated) => prisma.product.update(updated))
        )

        // Delete cart after save order
        await prisma.cart.deleteMany({
            where: { orderedById: Number(req.user.id) }
        })


        // console.log(userCart)
        res.json({ ok: true, order })
        // res.send("Hello saveOrder")
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}

exports.getOrder = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { orderedById: Number(req.user.id) },
            include: {
                products: {
                    include: {
                        product: true
                    }
                }
            }
        })
        if (orders.length === 0) {
            res.status(400).json({ ok: false, message: "No orders" })
        }

        // console.log(orders)
        res.json({ ok: true, orders })
        // res.send("Hello getOrder")
    } catch (error) {
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}
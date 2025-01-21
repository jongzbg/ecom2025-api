const prisma = require("../config/prisma")

exports.chageOrderStatus = async (req, res) => {
    try {
        const { orderId, orderStatus } = req.body
        // console.log(orderId,orderStatus)

        const orderUpdate = await prisma.order.update({
            where: { id: orderId },
            data: { orderStatus: orderStatus }
        })

        // console.log(req.body)
        res.send('change')
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Server error" })
    }
}


exports.getOrderAdmin = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                products: {
                    include: {
                        product: true
                    }
                },
                orderedBy: {
                    select: {
                        id: true,
                        email: true,
                        address: true
                    }
                }
            }

        })
        res.send(orders)
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Server Error" })

    }
}
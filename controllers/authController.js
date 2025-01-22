const prisma = require('../config/prisma')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { token } = require('morgan')

exports.register = async (req, res) => {
    try {
        const { email, password } = req.body

        // Step 1 Validate body
        if (!email) {
            return res.status(400).json({ message: "Email is required!!" })
        }
        if (!password) {
            return res.status(400).json({ message: "Password is required!!" })
        }

        // Step 2 Check Email in DB already?
        const user = await prisma.user.findFirst({
            where: {
                email: email
            }
        })

        if (user) {
            return res.status(400).json({ message: "Email already exits" })
        }

        // Step 3 Hash Password
        const hashPassword = await bcrypt.hash(password, 10)

        // Step 4 Register
        await prisma.user.create({
            data: {
                email: email,
                password: hashPassword
            }
        })

        res.send('Register Success')
    } catch (err) {
        // err
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body

        // Step 1 Check Email
        const user = await prisma.user.findFirst({
            where: {
                email: email
            }
        })
        if (!user || !user.enabled) {
            return res.status(400).json({ message: "User not found or not enabled" })
        }
        // Step 2 Check Password
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(500).json({ message: "Password Invalid!!" })
        }
        // Step 3 Create Payload
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        }

        // Step 4 Generate Token
        jwt.sign(payload, process.env.SECRET, {
            expiresIn: '1d'
        }, (err, token) => {
            if (err) {
                return res.status(500).json({ message: "Server Error Payload Env" })
            }
            res.json({ payload, token })
        })

        // console.log(email, password)  //Must be use medthod res only one time
        // res.send('hello login in controller')
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}

exports.currentUser = async (req, res) => {
    try {
        const user = await prisma.user.findFirst({
            where: { email: req.user.email },
            select: {
                id: true,
                email: true,
                name: true,
                role: true
            }
        })
        console.log('user',user)
        res.json({ user })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}
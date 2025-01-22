// Step 1 import...
const express = require('express')
const app = express()
const morgan = require('morgan')
const { readdirSync } = require('fs')
const cors = require('cors')
// comment authRouter,categoryRouter because using readdirSync
// const authRouter = require('./routes/auth')
// const categoryRouter = require('./routes/category')


// middleware
app.use(morgan('dev'))
app.use(express.json({limit:'20mb'}))
app.use(cors())
// Step 3 Router
// comment authRouter,categoryRouter because using readdirSync
// app.post('/api', (req, res) => {
//     const { username,password } = req.body
//     console.log(username + "," +password)
//     res.send('eiei55')
// })
// app.use('/', authRouter)
// app.use('/', categoryRouter)
// console.log(readdirSync('./routes'))

// test readdirSync
// readdirSync('./routes').map((item) => {
//     console.log(item)
// })

readdirSync('./routes')
    .map((c) => app.use('/', require('./routes/' + c)))

// Step 2 Start Server
app.listen('5001', () => {
    console.log(`Server is running on port 5001`)
})

app.get('/',(req,res)=>{
    res.send('This is my API running...')
})
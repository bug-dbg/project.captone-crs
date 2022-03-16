require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const app = express()

app.set('view engine', 'ejs')
app.use(express.json())
app.use(cookieParser())
app.use(cors())

// Routes
app.use('/user', require('./routes/user.router'))
app.use('/api', require('./routes/user.router'))

// Connect to mongodb
mongoose.connect(process.env.LOCAL_MONGODB_URL, { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongodb'))

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
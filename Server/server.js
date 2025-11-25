import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import connectDB from './config/db.js'
import authRouter from './routes/auth.routes.js'
import userRouter from './routes/user.routes.js'

const app = express()
const port = process.env.PORT || 4000

app.use(express.json())
app.use(cors({ origin: process.env.CLIENT_URL ,credentials: true }))
app.use(cookieParser())

app.get('/', (req, res) => res.send('API Working!'));
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)

app.listen(port, () => {
    console.log(`Server is running in ${port}`)
    connectDB()
})
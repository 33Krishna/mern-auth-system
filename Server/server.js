import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import connectDB from './config/db.js'
import authRouter from './routes/auth.routes.js'
import userRouter from './routes/user.routes.js'
import passport from 'passport'
import passportInit from './config/passport.js'

const app = express()
const port = process.env.PORT || 4000

const allowedOrigins = [process.env.CLIENT_URL || 'http://localhost:5173']

app.use(express.json())
app.use(cors({
    origin: allowedOrigins, 
    credentials: true, 
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], 
    allowedHeaders: ["Content-Type", "Authorization"]
}))
app.use(cookieParser())

// init passport
passportInit()
app.use(passport.initialize())

app.get('/', (req, res) => res.send('API Working!'));
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)

app.listen(port, () => {
    console.log(`Server is running in ${port}`)
    connectDB()
})
const Users = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userCtrl = {
    register: async (req, res) => {
        try {
            const {firstName, lastName, email, password} = req.body;

            const user = await Users.findOne({email})
            if(user){
                return res.status(400).json({msg: "The email already exists."});
            } 
            
            if(password.length < 6){
                return res.status(400).json({msg: "Password is at leat 6 characters long."})
            }

            // Password Encryption
            const passwordHash = await bcrypt.hash(password, 10)
            const newUser = new Users({
                firstName, lastName, email, password: passwordHash
            })
            
            // Save to database
            await newUser.save()

            // Create a jsonwebtoken for authentication
            const accessToken = createAccessToken({id: newUser._id})
            const refreshToken = createRefreshToken({id: newUser._id})

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                path: '/user/refresh_token',
                maxAge: 7*24*60*60*1000 // 7 days
            })
            res.json({accessToken})

        } catch (err) {
            return res.status(500).json({msg: err.message})
      }
    }, 
    login: async (req, res) => {
        try{
            const {email, password} = req.body

            const user = await Users.findOne({email})
            if(!user) return res.status(400).json({msg: "User does not exist."})

            const isMatch = await bcrypt.compare(password, user.password)
            if(!isMatch) return res.status(400).json({msg: "Incorrect password."})

            // if login is successful, create an accesstoken and refreshtoken

            const accessToken = createAccessToken({id: user._id})
            const refreshToken = createRefreshToken({id: user._id})

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                path: '/user/refresh_token',
                maxAge: 7*24*60*60*1000 // 7 days
            })
            res.json({accessToken})
        
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    logout: async (req, res) => {
        try {
            res.clearCookie('refreshToken', {path: '/user/refresh_token'})
            return res.json({msg: "Logged out"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    refreshToken: (req, res) => {
        try {
            const rf_token = req.cookies.refreshToken;

            if(!rf_token) return res.status(400).json({msg: "Please Login or Register"})

            jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
                if(err) return res.status(400).json({msg: "Please Login or Register"})

                const accessToken = createAccessToken({id: user.id})

                res.json({accessToken})
            })
            
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
        
    }, 
    
    getUsers: async (req, res) => {
        try {
            const users = await Users.find({
                role: 0
            })

            res.json({
                status: 'Success',
                users: users
            })
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },

    getUserById: async (req, res) => {
        try {
            const user = await Users.findById(req.user.id).select('-password')
            if(!user) return res.status(400).json({msg: "User does not exist."})
            
            res.json(user)
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    }, 
    
    deleteUser: async (req, res) => {
        try {   
            await Users.findByIdAndDelete(req.params.id)
            res.json({msg: "Deleted a User"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },

    updateUser: async (req, res) => {
        try {
            const { firstName, lastName, email, password } = req.body;

            await Users.findOneAndUpdate({_id: req.params.id}, {
                firstName, lastName, email, password
            })

            res.json({msg: "Updated User!"})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    }
}

const createAccessToken = (user) =>{
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '11m'})
}
const createRefreshToken = (user) =>{
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'})
}


module.exports = userCtrl
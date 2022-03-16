const router = require('express').Router()
const userCtrl = require('../controllers/user.controller')
const auth = require('../middleware/auth.js')
const authAdmin = require('../middleware/auth.admin')

router.post('/register', userCtrl.register)
router.post('/login', userCtrl.login)
router.get('/logout', userCtrl.logout)
router.get('/refresh_token', userCtrl.refreshToken)
router.get('/profile', auth, userCtrl.getUserById)
router.get('/info', auth, authAdmin, userCtrl.getUsers)
router.delete('/user/:id', auth, authAdmin, userCtrl.deleteUser)
router.put('/user/:id', auth, authAdmin, userCtrl.updateUser)



module.exports = router
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const requireAuth = (req, res, next) => {

    const token = req.cookies.jwt

    if(token) {
        jwt.verify(token, 'net ninja secret', (error, decodedToken) => {
            if(error) {
                res.redirect('/login')
            } else {
                next()
            }
        })
    } else {
        res.redirect('/login')
    }

}

const checkUser = (req, res, next) => {

    const token = req.cookies.jwt

    if(token) {
        jwt.verify(token, 'net ninja secret', async (error, decodedToken) => {
            if(error) {
                console.log(error.message)
                res.locals.user = null
                next()
            } else {
                let user = await User.findById(decodedToken.id)
                res.locals.user = user
                next()
            }
        })
    } else {
        res.locals.user = null
        next()
    }

}

module.exports = { requireAuth, checkUser }
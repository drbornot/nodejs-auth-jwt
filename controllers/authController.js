const User = require('../models/User')
const jwt = require('jsonwebtoken')

const maxAge = 3 * 24 * 60 * 60
const createToken = (id) => {
    return jwt.sign({ id }, 'net ninja secret', {
        expiresIn: maxAge
    })
}

const handleErrors = (error) => {
    
    let errors = { name: "", email: "", password: "" }

    // incorrect email
    if(error.message === 'incorrect email') {
        errors.email = 'that email is not registered'
    }

    // incorrect password
    if(error.message === 'incorrect password') {
        errors.password = 'that password is incorrect'
    }

    // duplicate error code
    if(error.code === 11000) {
        errors.email = "Email address already exists"
        return errors
    }

    //validation errors
    if(error.message.includes('user validation failed')) {
        Object.values(error.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message
        })
    }

    return errors
}

signup_get = (req, res) => {
    res.render('signup')
}

signup_post = async (req, res) => {
    
    const { name, email, password } = req.body

    try {
        const user = await User.create({ name, email, password })
        const token = createToken(user._id)
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 }).status(201).json({user: user._id})
    } catch (error) {
        const errors = handleErrors(error)
        res.status(400).json({errors})
    }
}

login_get = (req, res) => {
    res.render('login')
}

login_post = async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await User.login(email, password)
        const token = createToken(user._id)
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 }).status(200).json({user: user._id})
    } catch (error) {
        const errors = handleErrors(error)
        res.status(400).json({ errors })
    }
}

logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 }).redirect('/')
}

module.exports = {
    signup_get,
    signup_post,
    login_get,
    login_post,
    logout_get
}
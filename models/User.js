const mongoose = require('mongoose')
const { isEmail } = require('validator')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter the name'],
    }, 
    email: {
        type: String,
        required: [true, 'Please enter the email'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']
    }, 
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [6, 'Minimun password length is 6 characters']
    }
})

// fire a function after doc saved to db
userSchema.post('save', function (doc, next) {
    console.log('user created and saved ', doc)
    next()
})

userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt()
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

userSchema.statics.login = async function(email, password) {
    const user = await this.findOne({ email: email })

    if(user) {
        const result = await bcrypt.compare(password, user.password)
        if(result) {
            return user
        } else {
            throw Error('incorrect password')
        }
    }
    throw Error('incorrect email')
}

const User = mongoose.model('user', userSchema)

module.exports = User
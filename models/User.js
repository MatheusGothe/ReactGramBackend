const mongoose = require('mongoose')
const {Schema} = mongoose

const userSchema = new Schema({
    name: String,
    email: String,
    password: String,
    profileImage: {
        type: String,
        default: '../users/imagemPadrao.png'
    },
    bio: String,
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }], 
    stories: Array,
    isActive: { // Adicione este campo
        type: Boolean,
        default: false
    }
},{
    timestamps: true
})



const User = mongoose.model('User', userSchema)

module.exports = User

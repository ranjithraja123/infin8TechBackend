import mongoose from 'mongoose'


const twoFactor = new mongoose.Schema({

    userid: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    twofaStatus: {
        type: Boolean,
        required: true,
        default: false
    },
    emailStatus: {
        type: Boolean,
        required: true,
        default: false
    },
    emailToken:{
        type:String,
        default:''
    }

}, {
    timestamps: true
})

const TwoFA = mongoose.model('twofactorauths', twoFactor)

export default TwoFA
import mongoose from 'mongoose'

const useSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        trim: true
    },
    uType: {
        type: String,
        required: true,
        enum: ["C", "M"],
        default: "C"
    },
    orgid: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Organization'
    },
    isFirstLogin: {
        type: Boolean,
        required: true,
        default: false
    },
    useStatus: {
        type: String,
        default: 'UP'
    }

}, {
    timeStamps: true
});

const Users = mongoose.model('User', useSchema)

export default Users
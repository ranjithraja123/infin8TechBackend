import mongoose from 'mongoose'


const merchant = new mongoose.Schema({
    orgid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization', required: true
    },
    merchant: {
        type: String,
        trim: true,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
})

const Merchant = mongoose.model('Merchant', merchant)


export default Merchant
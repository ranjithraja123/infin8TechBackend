import mongoose from 'mongoose'

const rawCategory = new mongoose.Schema({
    orgid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    category: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }

}, {
    timestamps: true
})

const RawCat = mongoose.model('rawcategory', rawCategory)

export default RawCat

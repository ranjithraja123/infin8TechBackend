import mongoose from "mongoose";


const subcategories = new mongoose.Schema({

    catId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categories',
        required: true
    },
    orgid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    subcatname: {
        type: String,
        required: true,
        trim:true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }

}, {
    timestamps: true
})

const Subcategories = mongoose.model('Subcategories', subcategories);

export default Subcategories
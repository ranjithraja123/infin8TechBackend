import mongoose from "mongoose";


const materialSchema = new mongoose.Schema({
    rawmaterial: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RawMaterial',
        required: true
    },
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'rawcategory',
        required: true
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategories',
        required: true
    },
    orgid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    invoiceNumber: {
        type: String
    },
    merchant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Merchant',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        required: true
    },
    unitPrice: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    sgst: {
        type: Number
    },
    cgst: {
        type: Number
    },
    quantityAsConsumption: {
        type: Number
    },
    inConsumUnit: {
        type: Number
    },
    pricePerConsumptionUnit: {
        type: Number
    },
    remainingQuantity: {
        type: Number
    },
    stock: {
        type: String,
        enum: ["IS", "OS"],
        default: "IS"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }


}, {
    timestamps: true
})



const Material = mongoose.model('Material', materialSchema)


export default Material
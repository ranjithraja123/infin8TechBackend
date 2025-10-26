import mongoose from "mongoose";


const expenses = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orgid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true

    },
    merchant:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Merchant',
        required: true
    },
    expdate:{
        type:Date,
        required:true
    },
    total:{
        type:Number,
        required:true
    },
    currency:{
        type:String,
        required:true
    },
    reimbursable:{
        type:Boolean,
        required:true,
        default:false
    },
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categories',
        required: true
    },
    description:{
        type:String,
        required:true,
        trim:true
    },
    report:{
        type:String,
        required:true,
        default:"A"
    },
    status:{
        type:String,
        required:true,
        enum:['O','UR','A','R','UA'],
        default:'O'

    },
    receipt:{
        type:String
    }

}, {
    timestamps: true
})


const Expense = mongoose.model('Expense', expenses)


export default Expense
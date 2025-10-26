import mongoose from "mongoose";
import { type } from "os";


const recepie = new mongoose.Schema({
    orgid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    ingredients: [
        {
            itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
            name: { type: String, required: true },
            quantity: { type: Number },
            unit: { type: String }
        }
    ],
    servings: {
        type: Number
    },
    cuisine: {
        type: String
    },
    difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
        default: "Easy"
    },
    image: {
        type: {
            filepath: { type: String },
            size: { type: Number }
        }
    }
    ,
    tags: [String],
    price:{
        type:Number
    },
    status:{
        type:String,
        default:"A",
        enum:["A","IA"]
    }
})


const Recepie = mongoose.model('recepies', recepie)

export default Recepie
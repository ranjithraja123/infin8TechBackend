import mongoose from "mongoose";

const items = new mongoose.Schema({
    orgid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    items: {
        type: String,
        required: true
    },
    createdby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    minStock: {
        type: Number,
        required: true
    },
    maxStock: {
        type: Number,
        required: true
    },
    consumUnit: {
        type: String,
        required: true
    },
    minStockinMilliorExact: {
        type: Number,
        required: true
    },
    maxStockinMilliOrExact: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
})

const Item = mongoose.model('Item', items);

export default Item
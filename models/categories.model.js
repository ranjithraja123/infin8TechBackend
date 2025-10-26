import mongoose from 'mongoose'


const categories = new mongoose.Schema({
    category:{
        type:String
    }
},{
    timestamps:true
})

const Categories = mongoose.model('Categories',categories)


export default Categories
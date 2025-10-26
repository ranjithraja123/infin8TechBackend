import mongoose from 'mongoose'


const organizationDB = new mongoose.Schema({
    orgname:{
        type:String
    },
    description:{
        type:String
    }
},{
    timestamps:true
})

const Organization = mongoose.model('Organization',organizationDB)


export default Organization
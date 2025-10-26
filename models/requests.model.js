import mongoose from 'mongoose'
import bcrypt from 'bcryptjs';

const requests = new mongoose.Schema({
    userName:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    orgid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Organization',
        required:true
    }
},{
    timestamps:true
})

requests.pre('save', async function (next) {
    try{
        if(!this.isModified('password')) return next();

        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt)
        next()
    } catch (error){
        next(error);
    }
})

const Requests = mongoose.model('requests',requests)

export default Requests
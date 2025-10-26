import mongoose from 'mongoose';

const connectDB = async () => {
    try{
        await mongoose.connect('mongodb+srv://ranjith:PoloGT123456789@expense.hxkqkq6.mongodb.net/?appName=Expense')
        console.log('MongoDB connected...')

    } catch (error) {
        console.error(error)
        process.exit(1)
    }
}

export default connectDB;

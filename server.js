import express from 'express';
import auth from './routes/authRoutes.js';
import org from './routes/organizationRoutes.js';
import expense from './routes/expenseRoute.js';
import rawMaterials from './routes/rawMaterialsRoutes.js';
import recepie from './routes/recepie.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import cors from 'cors';
import connectDB from './db.js';
import dotenv from 'dotenv';

dotenv.config();

const corsOptions = {
  origin: true,
};

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(cors(corsOptions));
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});
// ✅ Serve receipts folder
const publicPath = path.join(process.env.RECEIPTPATH || process.cwd(), 'uploads');
app.use('/receipts', express.static(publicPath));

// // ✅ Serve uploads folder (for food images)
// const uploadsPath = path.join(process.cwd(), 'uploads');
// app.use('/api/uploads', express.static(uploadsPath));

// Serve uploads (deep folder structure included)
const uploadsPath = path.join(process.cwd(), 'uploads');
app.use('/api/uploads', express.static(uploadsPath));


app.use('/api/auth', auth);
app.use('/api/organization', org);
app.use('/api/expense', expense);
app.use('/api/rawmaterials', rawMaterials);
app.use('/api/recepie', recepie);

const PORT = process.env.PORT || 3000;

await connectDB();

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

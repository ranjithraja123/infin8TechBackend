import multer from 'multer';
import path from 'path';
import fs from 'fs'

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const wallId = req.params.wallid;
        const orgid = req.params.orgid;
        const uploadPath = path.join(process.env.RECEIPTPATH || __dirname, 'uploads', orgid, wallId);

        // Ensure the directory exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.basename(file.originalname);
        cb(null, 'receipt_' + uniqueSuffix + ext);
    }
});

// File filter to allow only images and PDFs
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, PNG images and PDF files are allowed'), false);
    }
};

// Multer upload middleware
const uploadREC = multer({
    storage,
    fileFilter
}).any();

export default uploadREC;

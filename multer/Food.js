import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const orgid = req.params.orgid;
    const foodUploadPath = path.join(process.cwd(), 'uploads', orgid, 'food');

    if (!fs.existsSync(foodUploadPath)) {
      fs.mkdirSync(foodUploadPath, { recursive: true });
    }
    cb(null, foodUploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname); // ✅ use extension only
    cb(null, 'food_' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG and WEBP images are allowed'), false);
  }
};

const uploadFood = multer({ storage, fileFilter }).any();

export default uploadFood;

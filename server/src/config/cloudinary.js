const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ── Use Cloudinary if all 3 keys are set, otherwise local storage ─────────
const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME &&
                      process.env.CLOUDINARY_API_KEY &&
                      process.env.CLOUDINARY_API_SECRET;

let upload;
let cloudinary = null;

if (useCloudinary) {
  cloudinary = require('cloudinary').v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const { CloudinaryStorage } = require('multer-storage-cloudinary');
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'hireindia/cvs',
      allowed_formats: ['pdf', 'txt', 'doc', 'docx'],
      resource_type: 'raw',
    },
  });
  upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
  console.log('☁️  File storage: Cloudinary');
} else {
  // Local disk storage fallback
  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename:    (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random()*1E6)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  });
  upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowed = ['.pdf', '.txt', '.doc', '.docx'];
      if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
      else cb(new Error('Only PDF, TXT, DOC, DOCX files are allowed'));
    },
  });
  console.log('💾  File storage: Local disk (set Cloudinary keys in .env to use cloud storage)');
}

module.exports = { cloudinary, upload, useCloudinary };

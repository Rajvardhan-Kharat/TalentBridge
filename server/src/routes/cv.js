const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const { uploadBaseCv, tailorCvForJob, getCvVault, getCvVersion, deleteCvVersion } = require('../controllers/cvController');

router.post('/upload', protect, upload.single('cv'), uploadBaseCv);
router.post('/tailor', protect, tailorCvForJob);
router.get('/vault', protect, getCvVault);
router.get('/:id', protect, getCvVersion);
router.delete('/:id', protect, deleteCvVersion);

module.exports = router;

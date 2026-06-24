const express = require('express');
const router = express.Router();
const { protect, jobseekerOnly } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const { uploadBaseCv, tailorCvForJob, getCvVault, getCvVersion, deleteCvVersion } = require('../controllers/cvController');

router.use(protect);
router.use(jobseekerOnly);

router.post('/upload', upload.single('cv'), uploadBaseCv);
router.post('/tailor', tailorCvForJob);
router.get('/vault', getCvVault);
router.get('/:id', getCvVersion);
router.delete('/:id', deleteCvVersion);

module.exports = router;

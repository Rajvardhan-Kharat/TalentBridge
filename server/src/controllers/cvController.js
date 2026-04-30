const { tailorCv } = require('../services/aiService');
const CvVersion = require('../models/CvVersion');
const User = require('../models/User');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

// Helper: extract text from uploaded file
const extractText = async (file) => {
  try {
    const { useCloudinary } = require('../config/cloudinary');
    if (useCloudinary) {
      // Cloudinary: fetch from URL
      const res = await fetch(file.path);
      const buffer = Buffer.from(await res.arrayBuffer());
      if (file.mimetype === 'application/pdf' || file.originalname?.endsWith('.pdf')) {
        const data = await pdfParse(buffer);
        return data.text;
      }
      return buffer.toString('utf-8');
    } else {
      // Local: read from disk
      const buffer = fs.readFileSync(file.path);
      if (path.extname(file.originalname).toLowerCase() === '.pdf') {
        const data = await pdfParse(buffer);
        return data.text;
      }
      return buffer.toString('utf-8');
    }
  } catch (e) {
    console.warn('Text extraction failed:', e.message);
    return '';
  }
};

// @POST /api/cv/upload
exports.uploadBaseCv = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const extractedText = await extractText(req.file);
    const fileUrl = req.file.path; // local path or cloudinary URL

    await User.findByIdAndUpdate(req.user._id, {
      baseCv: {
        url: fileUrl,
        publicId: req.file.filename,
        extractedText,
        uploadedAt: new Date(),
      },
    });

    // Save as base version in vault
    const existing = await CvVersion.findOne({ user: req.user._id, isBase: true });
    if (existing) {
      existing.tailoredContent = extractedText;
      existing.pdfUrl = fileUrl;
      await existing.save();
    } else {
      await CvVersion.create({
        user: req.user._id,
        label: 'Base CV',
        isBase: true,
        tailoredContent: extractedText,
        pdfUrl: fileUrl,
      });
    }

    res.json({
      success: true,
      message: 'CV uploaded and parsed successfully!',
      url: fileUrl,
      previewText: extractedText.slice(0, 300) + (extractedText.length > 300 ? '...' : ''),
    });
  } catch (err) { next(err); }
};

// @POST /api/cv/tailor
exports.tailorCvForJob = async (req, res, next) => {
  try {
    const { jobDescription, jobTitle, company } = req.body;
    if (!jobDescription) return res.status(400).json({ success: false, message: 'jobDescription required' });

    const user = await User.findById(req.user._id);
    const cvText = user.baseCv?.extractedText;
    if (!cvText || cvText.trim().length < 50)
      return res.status(400).json({ success: false, message: 'Please upload your base CV first (minimum content required)' });

    const tailored = await tailorCv(jobDescription, cvText);

    const cvVersion = await CvVersion.create({
      user: req.user._id,
      jobTitle: jobTitle || 'Unknown Role',
      company: company || 'Unknown Company',
      jobDescription,
      tailoredContent: tailored,
      label: `${jobTitle || 'Role'} @ ${company || 'Company'}`,
      aiChanges: ['ATS-optimized keywords', 'Rewritten bullet points', 'Tailored professional summary'],
    });

    res.json({ success: true, cvVersion });
  } catch (err) { next(err); }
};

// @GET /api/cv/vault
exports.getCvVault = async (req, res, next) => {
  try {
    const versions = await CvVersion.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, versions });
  } catch (err) { next(err); }
};

// @GET /api/cv/:id
exports.getCvVersion = async (req, res, next) => {
  try {
    const version = await CvVersion.findOne({ _id: req.params.id, user: req.user._id });
    if (!version) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, version });
  } catch (err) { next(err); }
};

// @DELETE /api/cv/:id
exports.deleteCvVersion = async (req, res, next) => {
  try {
    const v = await CvVersion.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!v) return res.status(404).json({ success: false, message: 'Not found' });
    // If local file, delete it
    if (v.pdfUrl && !v.pdfUrl.startsWith('http') && fs.existsSync(v.pdfUrl)) {
      fs.unlinkSync(v.pdfUrl);
    }
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};

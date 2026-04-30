const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  avatar: { type: String, default: '' },
  role: { type: String, default: 'jobseeker' },
  onboardingComplete: { type: Boolean, default: false },

  // ── Subscription / Revenue Model ────────────────────────────────────────
  subscription: {
    plan: { type: String, enum: ['free', 'gold', 'platinum'], default: 'free' },
    status: { type: String, enum: ['active', 'cancelled', 'expired', 'trial'], default: 'active' },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    startDate: Date,
    endDate: Date,
    autoRenew: { type: Boolean, default: false },
  },

  // ── Comprehensive Career/Professional Profile ────────────────────────────
  profile: {
    // Basic info
    currentTitle: String,
    headline: String,            // e.g. "AI Researcher | Speaker | Mentor"
    sector: String,              // kept for backward compat
    sectors: [String],           // multi-sector selection
    experience: String,          // fresher, 1-3, 3-5, 5-10, 10+
    bio: String,
    phone: String,
    dateOfBirth: String,
    gender: String,
    nationality: String,
    city: String,
    state: String,
    pincode: String,
    languages: [{ language: String, proficiency: String }],

    // Skills (multi-select, categorised)
    skills: [{ name: String, category: String, level: String }],  // level: beginner/intermediate/expert
    targetRoles: [String],
    targetSalaryMin: Number,
    targetSalaryMax: Number,
    preferredLocations: [String],
    workMode: { type: String, enum: ['remote', 'hybrid', 'onsite', 'any'], default: 'any' },
    industry: String,
    openToRelocation: { type: Boolean, default: false },

    // Social links
    linkedinUrl: String,
    portfolioUrl: String,
    githubUrl: String,
    twitterUrl: String,
    websiteUrl: String,
    behanceUrl: String,

    // Education
    education: [{
      degree: String,         // B.Tech, MBBS, MBA, BA, etc.
      field: String,          // Computer Science, Medicine, Finance, etc.
      institution: String,
      university: String,
      startYear: String,
      endYear: String,
      grade: String,          // CGPA / Percentage / Grade
      achievements: String,
    }],

    // Work Experience
    workExperience: [{
      title: String,
      company: String,
      location: String,
      startDate: String,
      endDate: String,
      currentlyWorking: { type: Boolean, default: false },
      description: String,
      sector: String,
    }],

    // Projects
    projects: [{
      title: String,
      description: String,
      techStack: [String],
      role: String,
      url: String,
      githubUrl: String,
      startDate: String,
      endDate: String,
      ongoing: { type: Boolean, default: false },
      highlights: String,
    }],

    // Research / Publications
    research: [{
      title: String,
      journal: String,
      conference: String,
      year: String,
      doi: String,
      url: String,
      abstract: String,
      coAuthors: String,
      type: String,  // journal, conference, book chapter, thesis, patent
    }],

    // Certifications
    certifications: [{
      name: String,
      issuer: String,
      issueDate: String,
      expiryDate: String,
      credentialId: String,
      url: String,
    }],

    // Achievements / Awards
    achievements: [{
      title: String,
      issuer: String,
      year: String,
      description: String,
    }],

    // Volunteering / Extra-curricular
    volunteering: [{
      role: String,
      organization: String,
      startDate: String,
      endDate: String,
      description: String,
    }],

    // Additional
    hobbies: [String],
    references: [{
      name: String,
      designation: String,
      organization: String,
      email: String,
      phone: String,
    }],
  },

  // ── CV data ──────────────────────────────────────────────────────────────
  baseCv: {
    url: String,
    publicId: String,
    extractedText: String,
    uploadedAt: Date,
  },

  // ── Job search settings ──────────────────────────────────────────────────
  searchGoals: {
    weeklyApplicationTarget: { type: Number, default: 10 },
    deadline: Date,
    priorityRoles: [String],
  },

  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);

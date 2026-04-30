// ── Comprehensive Cross-Sector Skills Taxonomy ──────────────────────────────
// Covers: Technology, Healthcare, Finance, Education, Arts, Engineering,
// Management, Agriculture, Law, Media, Hospitality, Manufacturing, Research, etc.

export const SKILL_TAXONOMY = {
  'Software Development': {
    icon: '💻',
    color: '#6366f1',
    skills: [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Swift', 'Kotlin',
      'PHP', 'Ruby', 'Scala', 'Dart', 'R', 'MATLAB', 'Julia',
      'React', 'Vue.js', 'Angular', 'Next.js', 'Svelte', 'Node.js', 'Express.js',
      'Django', 'FastAPI', 'Flask', 'Spring Boot', 'Laravel', 'Ruby on Rails',
      'HTML', 'CSS', 'SASS/SCSS', 'Tailwind CSS', 'Bootstrap',
      'REST APIs', 'GraphQL', 'WebSockets', 'gRPC', 'Microservices',
      'Git', 'GitHub', 'GitLab', 'Bitbucket',
    ],
    related: ['Cloud & DevOps', 'Databases', 'AI & Machine Learning', 'Mobile Development'],
  },
  'AI & Machine Learning': {
    icon: '🤖',
    color: '#8b5cf6',
    skills: [
      'Machine Learning', 'Deep Learning', 'Natural Language Processing', 'Computer Vision',
      'TensorFlow', 'PyTorch', 'Keras', 'scikit-learn', 'Pandas', 'NumPy', 'OpenCV',
      'LLMs', 'Prompt Engineering', 'RAG', 'Fine-tuning', 'Hugging Face',
      'Data Science', 'Data Analysis', 'Statistical Modeling', 'Time Series Analysis',
      'Reinforcement Learning', 'Neural Networks', 'Transformers', 'Generative AI',
      'MLOps', 'Model Deployment', 'A/B Testing', 'Experiment Design',
      'ChatGPT API', 'Gemini API', 'Stable Diffusion', 'Midjourney Prompting',
    ],
    related: ['Software Development', 'Data & Analytics', 'Research'],
  },
  'Cloud & DevOps': {
    icon: '☁️',
    color: '#06b6d4',
    skills: [
      'AWS', 'Azure', 'Google Cloud Platform', 'Cloudflare', 'DigitalOcean',
      'Docker', 'Kubernetes', 'Helm', 'Terraform', 'Ansible', 'Vagrant',
      'CI/CD', 'Jenkins', 'GitHub Actions', 'GitLab CI', 'CircleCI',
      'Linux', 'Bash Scripting', 'Shell Scripting', 'Nginx', 'Apache',
      'Monitoring', 'Grafana', 'Prometheus', 'Datadog', 'ELK Stack',
      'Serverless', 'Lambda', 'Cloud Functions', 'Edge Computing',
    ],
    related: ['Software Development', 'Networking & Security'],
  },
  'Data & Analytics': {
    icon: '📊',
    color: '#10b981',
    skills: [
      'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch',
      'Power BI', 'Tableau', 'Metabase', 'Looker', 'Google Analytics',
      'Excel', 'Google Sheets', 'Python Data Analysis', 'Jupyter Notebooks',
      'ETL Pipelines', 'Apache Spark', 'Hadoop', 'Kafka', 'Airflow',
      'Data Warehousing', 'BigQuery', 'Snowflake', 'Redshift',
      'Business Intelligence', 'KPI Tracking', 'Dashboard Design',
      'Statistical Analysis', 'Regression Analysis', 'Data Visualization',
    ],
    related: ['AI & Machine Learning', 'Software Development', 'Finance & Accounting'],
  },
  'Mobile Development': {
    icon: '📱',
    color: '#f59e0b',
    skills: [
      'React Native', 'Flutter', 'SwiftUI', 'Jetpack Compose', 'Ionic', 'Xamarin',
      'iOS Development', 'Android Development', 'App Store Optimization',
      'Mobile UI/UX', 'Push Notifications', 'Mobile Security', 'Performance Optimization',
      'Firebase', 'Expo', 'Capacitor', 'In-App Purchases',
    ],
    related: ['Software Development', 'UI/UX Design'],
  },
  'UI/UX Design': {
    icon: '🎨',
    color: '#ec4899',
    skills: [
      'Figma', 'Adobe XD', 'Sketch', 'InVision', 'Zeplin', 'Framer', 'Webflow',
      'User Research', 'Wireframing', 'Prototyping', 'Usability Testing', 'A/B Testing',
      'Design Systems', 'Design Tokens', 'Component Libraries',
      'Information Architecture', 'User Journey Mapping', 'Persona Creation',
      'Accessibility (WCAG)', 'Responsive Design', 'Motion Design',
      'Adobe Photoshop', 'Adobe Illustrator', 'After Effects',
      'Interaction Design', 'Visual Design', 'Typography', 'Color Theory',
    ],
    related: ['Graphic Design & Arts', 'Software Development', 'Mobile Development'],
  },
  'Project Management': {
    icon: '📋',
    color: '#f97316',
    skills: [
      'Agile', 'Scrum', 'Kanban', 'SAFe', 'Waterfall', 'PRINCE2', 'PMP',
      'JIRA', 'Trello', 'Asana', 'Monday.com', 'Notion', 'Confluence', 'ClickUp',
      'Risk Management', 'Stakeholder Management', 'Budget Management',
      'Resource Planning', 'Sprint Planning', 'Retrospectives', 'OKRs',
      'Change Management', 'Vendor Management', 'SLA Management',
      'MS Project', 'Gantt Charts', 'Critical Path Analysis',
    ],
    related: ['Business & Strategy', 'Leadership & Management', 'Software Development'],
  },
  'Business & Strategy': {
    icon: '💼',
    color: '#0ea5e9',
    skills: [
      'Business Analysis', 'Market Research', 'Competitive Analysis', 'SWOT Analysis',
      'Business Development', 'Strategy Planning', 'Business Model Canvas',
      'P&L Management', 'Revenue Growth', 'Go-to-Market Strategy',
      'Mergers & Acquisitions', 'Due Diligence', 'Valuation',
      'Consulting', 'Management Consulting', 'Process Improvement', 'Six Sigma',
      'KPI Definition', 'Balanced Scorecard', 'Business Intelligence',
      'CRM Strategy', 'Partnership Development',
    ],
    related: ['Finance & Accounting', 'Marketing & Sales', 'Leadership & Management'],
  },
  'Marketing & Sales': {
    icon: '📣',
    color: '#ef4444',
    skills: [
      'Digital Marketing', 'SEO', 'SEM', 'Google Ads', 'Facebook Ads', 'Instagram Ads',
      'Content Marketing', 'Email Marketing', 'Social Media Marketing', 'Influencer Marketing',
      'Brand Management', 'Brand Strategy', 'Copywriting', 'Content Writing',
      'HubSpot', 'Salesforce', 'Mailchimp', 'Google Analytics', 'Meta Business Suite',
      'Lead Generation', 'Sales Funnel', 'CRM', 'Account Management', 'B2B Sales', 'B2C Sales',
      'Market Segmentation', 'PR & Communications', 'Event Marketing',
      'Video Marketing', 'Podcast Marketing', 'Affiliate Marketing',
    ],
    related: ['Business & Strategy', 'Creative & Content Writing', 'Graphic Design & Arts'],
  },
  'Finance & Accounting': {
    icon: '💰',
    color: '#16a34a',
    skills: [
      'Financial Analysis', 'Financial Modeling', 'Budgeting', 'Forecasting',
      'Accounting', 'Bookkeeping', 'Tally', 'QuickBooks', 'SAP FICO',
      'Taxation', 'GST', 'Income Tax', 'TDS', 'Auditing', 'Internal Controls',
      'Investment Banking', 'Equity Research', 'Portfolio Management',
      'Risk Analysis', 'Compliance', 'Regulatory Reporting',
      'IFRS', 'GAAP', 'ICAI Standards', 'CFA', 'CA',
      'Treasury Management', 'Forex Management', 'Trade Finance',
      'Venture Capital', 'Private Equity', 'Credit Analysis',
    ],
    related: ['Business & Strategy', 'Data & Analytics', 'Law & Compliance'],
  },
  'Healthcare & Medicine': {
    icon: '🏥',
    color: '#14b8a6',
    skills: [
      'Clinical Medicine', 'Patient Care', 'Diagnosis & Treatment', 'Surgery', 'Telemedicine',
      'Pharmacology', 'Drug Interactions', 'Clinical Trials', 'Medical Research',
      'Nursing', 'Patient Assessment', 'Critical Care', 'Emergency Medicine',
      'Radiology', 'Pathology', 'Laboratory Skills', 'Medical Imaging',
      'Healthcare Administration', 'Hospital Management', 'NABH Standards',
      'Electronic Health Records', 'Medical Coding', 'ICD-10', 'CPT Coding',
      'Public Health', 'Epidemiology', 'Health Policy', 'Biostatistics',
      'Ayurveda', 'Homeopathy', 'Physiotherapy', 'Occupational Therapy',
      'Dental Care', 'Ophthalmology', 'Mental Health', 'Psychiatry', 'Counseling',
    ],
    related: ['Research & Publications', 'Leadership & Management', 'Biotechnology & Life Sciences'],
  },
  'Education & Teaching': {
    icon: '🎓',
    color: '#a855f7',
    skills: [
      'Curriculum Development', 'Lesson Planning', 'Pedagogy', 'Differentiated Instruction',
      'Classroom Management', 'Student Assessment', 'Formative Assessment',
      'E-Learning', 'LMS Platforms', 'Moodle', 'Blackboard', 'Canvas',
      'Instructional Design', 'ADDIE Model', 'Bloom\'s Taxonomy',
      'Special Education', 'Inclusive Education', 'English Language Teaching',
      'STEM Education', 'Online Teaching', 'Virtual Classrooms',
      'Educational Technology', 'Gamification', 'Montessori', 'CBSE', 'IB Curriculum',
      'Academic Research', 'Publishing', 'Grant Writing', 'Mentoring', 'Coaching',
    ],
    related: ['Research & Publications', 'Content Writing & Copywriting', 'Leadership & Management'],
  },
  'Engineering (Non-IT)': {
    icon: '⚙️',
    color: '#78716c',
    skills: [
      'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering',
      'Chemical Engineering', 'Aerospace Engineering', 'Structural Engineering',
      'AutoCAD', 'SolidWorks', 'CATIA', 'ANSYS', 'MATLAB/Simulink',
      'BIM', 'Revit', 'Construction Management', 'Project Estimation',
      'PLC Programming', 'SCADA', 'Industrial Automation', 'Robotics',
      'Quality Control', 'ISO Standards', 'Six Sigma', 'Lean Manufacturing',
      'Supply Chain', 'Procurement', 'Logistics', 'Inventory Management',
      'Safety Management', 'OHSAS 18001', 'Environmental Management', 'ISO 14001',
    ],
    related: ['Project Management', 'Manufacturing & Operations', 'Research & Publications'],
  },
  'Law & Compliance': {
    icon: '⚖️',
    color: '#dc2626',
    skills: [
      'Legal Research', 'Contract Drafting', 'Contract Review', 'Negotiation',
      'Corporate Law', 'Commercial Law', 'Criminal Law', 'Civil Litigation',
      'Intellectual Property', 'Patent Law', 'Trademark', 'Copyright',
      'Data Privacy', 'GDPR', 'PDPB', 'Regulatory Compliance',
      'Labour Law', 'Employment Law', 'Company Law', 'SEBI Regulations',
      'Arbitration', 'Mediation', 'Alternative Dispute Resolution',
      'Legal Drafting', 'Due Diligence', 'Legal Advisory', 'Court Appearances',
    ],
    related: ['Finance & Accounting', 'Business & Strategy', 'Government & Public Policy'],
  },
  'Creative & Content Writing': {
    icon: '✍️',
    color: '#f472b6',
    skills: [
      'Content Writing', 'Copywriting', 'Technical Writing', 'UX Writing',
      'Blog Writing', 'Article Writing', 'SEO Writing', 'Creative Writing',
      'Script Writing', 'Screenplay Writing', 'Editing', 'Proofreading',
      'Social Media Content', 'Newsletter Writing', 'Grant Writing',
      'Research Writing', 'Academic Writing', 'White Papers', 'Case Studies',
      'Storytelling', 'Narrative Development', 'Brand Voice',
      'Translation', 'Localization', 'Hindi Writing', 'Regional Language Writing',
    ],
    related: ['Marketing & Sales', 'UI/UX Design', 'Media & Journalism'],
  },
  'Graphic Design & Arts': {
    icon: '🖼️',
    color: '#e879f9',
    skills: [
      'Adobe Photoshop', 'Adobe Illustrator', 'Adobe InDesign', 'CorelDRAW',
      'Canva', 'Figma', 'Procreate', 'Blender', 'Maya', '3ds Max',
      'Logo Design', 'Brand Identity', 'Print Design', 'Packaging Design',
      'Social Media Design', 'Infographic Design', 'Motion Graphics',
      'Video Editing', 'Premiere Pro', 'Final Cut Pro', 'After Effects', 'DaVinci Resolve',
      'Photography', 'Photo Editing', 'Lightroom', 'Color Grading',
      'Illustration', 'Digital Art', 'Animation', '2D Animation', '3D Modeling',
      'Game Design', 'NFT Art', 'Web Design',
    ],
    related: ['UI/UX Design', 'Marketing & Sales', 'Media & Journalism'],
  },
  'Human Resources': {
    icon: '👥',
    color: '#fb923c',
    skills: [
      'Talent Acquisition', 'Recruitment', 'Headhunting', 'Boolean Search',
      'Employee Relations', 'HR Policies', 'Onboarding', 'Performance Management',
      'Learning & Development', 'Training Design', 'Leadership Development',
      'Compensation & Benefits', 'Payroll', 'HRIS', 'SAP HR', 'Workday',
      'Labour Law', 'HR Compliance', 'Disciplinary Proceedings',
      'Diversity & Inclusion', 'Employee Engagement', 'Culture Building',
      'HR Analytics', 'Workforce Planning', 'Organizational Development',
      'HR Business Partnering', 'Exit Management', 'Grievance Handling',
    ],
    related: ['Leadership & Management', 'Business & Strategy', 'Law & Compliance'],
  },
  'Leadership & Management': {
    icon: '🌟',
    color: '#fbbf24',
    skills: [
      'Team Leadership', 'People Management', 'Team Building', 'Conflict Resolution',
      'Executive Leadership', 'C-Suite Management', 'P&L Ownership',
      'Strategic Planning', 'Vision Setting', 'Decision Making',
      'Coaching', 'Mentoring', 'Performance Reviews', 'Feedback Culture',
      'Remote Team Management', 'Cross-functional Collaboration',
      'Communication', 'Presentation Skills', 'Public Speaking', 'Negotiation',
      'Emotional Intelligence', 'Critical Thinking', 'Problem Solving',
      'Change Management', 'Crisis Management',
    ],
    related: ['Business & Strategy', 'Human Resources', 'Project Management'],
  },
  'Media & Journalism': {
    icon: '📰',
    color: '#38bdf8',
    skills: [
      'Journalism', 'Investigative Reporting', 'News Writing', 'Feature Writing',
      'Broadcast Journalism', 'TV Anchoring', 'Radio Jockeying', 'Podcasting',
      'Video Journalism', 'Documentary Filmmaking', 'Video Production',
      'Social Media Management', 'Content Strategy', 'Media Planning',
      'Press Release Writing', 'PR Management', 'Media Relations',
      'Adobe Premiere', 'Final Cut Pro', 'Sound Editing', 'Camera Operation',
      'OTT Content Creation', 'YouTube', 'Instagram Reels', 'Shorts',
    ],
    related: ['Creative & Content Writing', 'Graphic Design & Arts', 'Marketing & Sales'],
  },
  'Research & Publications': {
    icon: '🔬',
    color: '#34d399',
    skills: [
      'Academic Research', 'Literature Review', 'Research Methodology',
      'Quantitative Research', 'Qualitative Research', 'Mixed Methods',
      'SPSS', 'R Programming', 'Python (Research)', 'NVivo',
      'Grant Writing', 'Research Proposals', 'Scientific Writing',
      'Peer Review', 'Journal Publishing', 'Conference Papers',
      'Patents', 'Technology Transfer', 'Ethics & IRB',
      'Systematic Review', 'Meta Analysis', 'Clinical Research',
      'Field Research', 'Survey Design', 'Focus Groups', 'Interviews',
    ],
    related: ['AI & Machine Learning', 'Healthcare & Medicine', 'Education & Teaching'],
  },
  'Agriculture & Farming': {
    icon: '🌾',
    color: '#65a30d',
    skills: [
      'Crop Production', 'Agronomy', 'Horticulture', 'Precision Agriculture',
      'Irrigation Management', 'Soil Science', 'Fertilizer Management',
      'Pest Management', 'Organic Farming', 'Natural Farming',
      'AgriTech', 'Drone Spraying', 'IoT in Agriculture', 'Farm Management Software',
      'Animal Husbandry', 'Dairy Farming', 'Poultry Management', 'Aquaculture',
      'Food Processing', 'Post-Harvest Management', 'Cold Chain Management',
      'Agricultural Extension', 'Rural Development', 'Farm Business Management',
    ],
    related: ['Research & Publications', 'Engineering (Non-IT)', 'Business & Strategy'],
  },
  'Hospitality & Tourism': {
    icon: '🏨',
    color: '#fb7185',
    skills: [
      'Hotel Management', 'Front Office Operations', 'Housekeeping Management',
      'Food & Beverage Service', 'Kitchen Operations', 'Menu Planning',
      'Restaurant Management', 'Banquet & Event Management', 'Catering',
      'Travel & Tourism', 'Tour Operations', 'Ticketing', 'IATA Certification',
      'Customer Service', 'Guest Relations', 'Complaint Handling',
      'Revenue Management', 'OTA Management', 'Property Management Systems',
      'MICE Industry', 'Spa & Wellness Management', 'Cruise Management',
    ],
    related: ['Marketing & Sales', 'Leadership & Management', 'Business & Strategy'],
  },
  'Biotechnology & Life Sciences': {
    icon: '🧬',
    color: '#4ade80',
    skills: [
      'Molecular Biology', 'Cell Biology', 'Genetics', 'Genomics', 'Proteomics',
      'PCR', 'ELISA', 'Western Blotting', 'Flow Cytometry', 'Microscopy',
      'Bioinformatics', 'Computational Biology', 'Drug Discovery',
      'Clinical Trials', 'Regulatory Affairs', 'FDA Guidelines',
      'Fermentation Technology', 'Bioprocessing', 'Downstream Processing',
      'Environmental Biotechnology', 'Agricultural Biotechnology',
      'Bioinformatics Tools', 'BLAST', 'NCBI', 'Lab Management',
    ],
    related: ['Healthcare & Medicine', 'Research & Publications', 'AI & Machine Learning'],
  },
  'Networking & Security': {
    icon: '🔒',
    color: '#94a3b8',
    skills: [
      'Cybersecurity', 'Ethical Hacking', 'Penetration Testing', 'VAPT',
      'Network Security', 'Firewall Management', 'SIEM', 'SOC Operations',
      'Cloud Security', 'Zero Trust Architecture', 'IAM',
      'Malware Analysis', 'Reverse Engineering', 'Digital Forensics',
      'CISSP', 'CEH', 'CompTIA Security+', 'OSCP',
      'CCNA', 'CCNP', 'Cisco', 'Juniper', 'Network Monitoring',
      'VPN', 'SD-WAN', 'MPLS', 'BGP', 'OSPF',
    ],
    related: ['Cloud & DevOps', 'Software Development', 'IT Support'],
  },
  'Government & Public Policy': {
    icon: '🏛️',
    color: '#6366f1',
    skills: [
      'Public Policy Analysis', 'Policy Drafting', 'Legislative Research',
      'Government Relations', 'Lobbying', 'Regulatory Affairs',
      'Urban Planning', 'Rural Development', 'Smart Cities',
      'Public Administration', 'e-Governance', 'Digital India',
      'IAS/IPS Preparation', 'UPSC Exam', 'Civil Services',
      'International Relations', 'Foreign Policy', 'Diplomacy',
      'Public Finance', 'Budget Analysis', 'Social Welfare Programs',
      'RTI', 'Grievance Redressal', 'Procurement (GEM)',
    ],
    related: ['Law & Compliance', 'Business & Strategy', 'Research & Publications'],
  },
  'Soft Skills': {
    icon: '💡',
    color: '#a3e635',
    skills: [
      'Communication', 'Presentation Skills', 'Public Speaking', 'Active Listening',
      'Teamwork', 'Collaboration', 'Adaptability', 'Flexibility',
      'Time Management', 'Prioritization', 'Multitasking',
      'Problem Solving', 'Critical Thinking', 'Analytical Skills', 'Creativity',
      'Leadership', 'Initiative', 'Self-Motivation', 'Work Ethic',
      'Emotional Intelligence', 'Empathy', 'Networking', 'Relationship Building',
      'Attention to Detail', 'Organizational Skills', 'Project Management',
      'Customer Focus', 'Negotiation', 'Conflict Resolution',
    ],
    related: ['Leadership & Management', 'Marketing & Sales', 'Human Resources'],
  },
};

// Get all unique skills flat list
export const ALL_SKILLS_FLAT = Object.entries(SKILL_TAXONOMY).flatMap(([category, data]) =>
  data.skills.map(skill => ({ name: skill, category, color: data.color, icon: data.icon }))
);

// Get related categories for a given category
export const getRelatedCategories = (categoryName) => {
  const cat = SKILL_TAXONOMY[categoryName];
  if (!cat) return [];
  return cat.related || [];
};

// Search skills across all categories
export const searchSkills = (query, limit = 20) => {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase();
  return ALL_SKILLS_FLAT
    .filter(s => s.name.toLowerCase().includes(q))
    .slice(0, limit);
};

// Get skills by category
export const getSkillsByCategory = (categoryName) => {
  return SKILL_TAXONOMY[categoryName]?.skills || [];
};

export const SECTORS = [
  'Technology & IT', 'Healthcare & Medicine', 'Finance & Banking',
  'Education & Academia', 'Engineering', 'Legal & Compliance',
  'Media & Entertainment', 'Marketing & Advertising', 'Agriculture',
  'Government & Public Sector', 'Hospitality & Tourism', 'Manufacturing',
  'Retail & E-Commerce', 'Real Estate & Construction', 'Biotechnology',
  'Research & Development', 'Non-Profit & NGO', 'Consulting',
  'Logistics & Supply Chain', 'Energy & Environment', 'Defence & Aerospace',
  'Sports & Fitness', 'Fashion & Lifestyle', 'Arts & Culture',
  'Social Work & Development', 'Other',
];

export const DEGREE_OPTIONS = [
  'B.Tech / B.E.', 'M.Tech / M.E.', 'B.Sc', 'M.Sc', 'B.Com', 'M.Com',
  'BBA', 'MBA', 'B.A.', 'M.A.', 'MBBS', 'MD', 'MS (Medical)', 'BDS', 'MDS',
  'B.Pharm', 'M.Pharm', 'BCA', 'MCA', 'B.Arch', 'M.Arch',
  'LLB', 'LLM', 'B.Ed', 'M.Ed', 'Ph.D', 'D.Sc', 'Diploma', 'Post Graduate Diploma',
  'Certificate', '12th / HSC', '10th / SSC', 'Other',
];

export const EXPERIENCE_OPTIONS = [
  { label: 'Fresher (0-1 yr)', value: 'fresher' },
  { label: '1-3 years', value: '1-3' },
  { label: '3-5 years', value: '3-5' },
  { label: '5-10 years', value: '5-10' },
  { label: '10-15 years', value: '10-15' },
  { label: '15+ years', value: '15+' },
];

export const WORK_MODES = ['Remote', 'Hybrid', 'On-site', 'Flexible'];

export const LANGUAGE_PROFICIENCY = ['Basic', 'Conversational', 'Professional', 'Native'];

export const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

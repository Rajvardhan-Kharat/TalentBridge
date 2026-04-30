/**
 * HireIndia AI Service
 * Primary:  Google Gemini API (gemini-1.5-flash — FREE tier, generous limits)
 * Fallback: Groq API (llama-3.3-70b-versatile — FREE tier)
 *
 * Logic: Try Gemini first → if it fails (quota/rate-limit/error) → auto-switch to Groq
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');

// ── Clients ──────────────────────────────────────────────────────────────
const geminiClient = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const groqClient = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

// ── Core: Call Gemini ────────────────────────────────────────────────────
const callGemini = async (systemPrompt, userMessage, maxTokens = 2000) => {
  if (!geminiClient) throw new Error('GEMINI_API_KEY not configured');
  const model = geminiClient.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    systemInstruction: systemPrompt,
  });
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 },
  });
  return result.response.text();
};

// ── Core: Call Groq ──────────────────────────────────────────────────────
const callGroq = async (systemPrompt, userMessage, maxTokens = 2000) => {
  if (!groqClient) throw new Error('GROQ_API_KEY not configured');
  const completion = await groqClient.chat.completions.create({
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userMessage },
    ],
    max_tokens: maxTokens,
    temperature: 0.7,
  });
  return completion.choices[0].message.content;
};

// ── Core: Call AI with Gemini→Groq fallback ──────────────────────────────
const callAI = async (systemPrompt, userMessage, maxTokens = 2000) => {
  // Try Gemini first
  try {
    const result = await callGemini(systemPrompt, userMessage, maxTokens);
    console.log('✅ AI: Gemini responded');
    return result;
  } catch (geminiErr) {
    console.warn(`⚠️  Gemini failed (${geminiErr.message}), trying Groq fallback...`);
    try {
      const result = await callGroq(systemPrompt, userMessage, maxTokens);
      console.log('✅ AI: Groq fallback responded');
      return result;
    } catch (groqErr) {
      console.error('❌ Both Gemini and Groq failed');
      throw new Error(`AI unavailable. Gemini: ${geminiErr.message} | Groq: ${groqErr.message}`);
    }
  }
};

// ── Helper: Extract JSON from AI response (handles markdown code fences) ─
const extractJSON = (raw) => {
  // Remove markdown code fences if present
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '').trim();
  }
  return JSON.parse(cleaned);
};

// ════════════════════════════════════════════════════════════════════════
// MODULE 2: AI Job Evaluator — 10-dimension scoring
// ════════════════════════════════════════════════════════════════════════
const evaluateJob = async (jobDescription, cvText, userProfile) => {
  const system = `You are an expert career coach and senior recruiter with 15+ years of experience.
Evaluate job descriptions against candidate profiles precisely and honestly.
CRITICAL: Return ONLY valid JSON. No markdown, no explanations outside JSON.`;

  const user = `
JOB DESCRIPTION:
${jobDescription}

CANDIDATE PROFILE / CV:
${cvText}

Evaluate this candidate for this job across 10 dimensions (each 0.0-5.0).
Return this exact JSON structure:
{
  "dimensions": {
    "skills_match":                   { "score": 0.0, "reasoning": "1-2 sentence explanation" },
    "experience_level_fit":           { "score": 0.0, "reasoning": "1-2 sentence explanation" },
    "salary_alignment":               { "score": 0.0, "reasoning": "1-2 sentence explanation" },
    "role_title_relevance":           { "score": 0.0, "reasoning": "1-2 sentence explanation" },
    "company_culture_fit":            { "score": 0.0, "reasoning": "1-2 sentence explanation" },
    "growth_potential":               { "score": 0.0, "reasoning": "1-2 sentence explanation" },
    "location_remote_compatibility":  { "score": 0.0, "reasoning": "1-2 sentence explanation" },
    "industry_relevance":             { "score": 0.0, "reasoning": "1-2 sentence explanation" },
    "ats_keyword_density":            { "score": 0.0, "reasoning": "1-2 sentence explanation" },
    "overall_opportunity_score":      { "score": 0.0, "reasoning": "1-2 sentence explanation" }
  },
  "overallScore": 0.0,
  "grade": "A",
  "recommendation": "Apply",
  "summary": "2-3 sentence honest summary",
  "missingSkills": ["skill1", "skill2"],
  "strongMatches": ["match1", "match2"],
  "redFlags": ["flag1"]
}

Grade scale: A=4.5-5.0, B=3.5-4.4, C=2.5-3.4, D=1.5-2.4, F=0-1.4
Recommendation: "Apply" if overallScore >= 3.5, else "Skip"`;

  const raw = await callAI(system, user, 3000);
  return extractJSON(raw);
};

// ════════════════════════════════════════════════════════════════════════
// MODULE 3: CV Tailoring & Profile Enhancement
// ════════════════════════════════════════════════════════════════════════
const enhanceProfile = async (profile) => {
  const system = `You are a world-class ATS-optimized resume writer and career strategist.
Enhance the provided JSON profile (workExperience, projects).
1. Rewrite descriptions using strong action verbs.
2. Quantify impact where possible.
3. Optimize for ATS tracking.
4. ONLY return valid JSON matching exactly this structure:
{
  "workExperience": [{ "title": "", "company": "", "description": "" }],
  "projects": [{ "title": "", "description": "", "highlights": "" }]
}`;
  const user = JSON.stringify({ workExperience: profile.workExperience || [], projects: profile.projects || [] });
  const raw = await callAI(system, user, 3000);
  return extractJSON(raw);
};

const tailorCv = async (jobDescription, cvText) => {
  const system = `You are a world-class ATS-optimized resume writer and career strategist.
Rewrite CVs to maximize ATS pass-through and recruiter engagement.
Use strong action verbs, quantify impact, mirror JD keywords naturally.
Return the complete tailored resume in clean plain text format.`;

  const user = `
JOB DESCRIPTION:
${jobDescription}

ORIGINAL CV:
${cvText}

Create a tailored, ATS-optimized version of this CV for the specific job above.

Include:
1. PROFESSIONAL SUMMARY (3-4 lines targeting this exact role)
2. KEY SKILLS (matched to JD keywords)
3. PROFESSIONAL EXPERIENCE (rewritten bullets with metrics, action verbs, JD keywords)
4. EDUCATION (unchanged)
5. CERTIFICATIONS (if any)

Output the complete tailored resume text now:`;

  return callAI(system, user, 4000);
};

// ════════════════════════════════════════════════════════════════════════
// MODULE 4: AI Prompt Toolkit — 20 tools
// ════════════════════════════════════════════════════════════════════════
const runPromptTool = async (toolId, inputs) => {
  const tools = {
    'resume-positioning': {
      system: 'You are an expert resume strategist and career coach. Create compelling, ATS-optimized content.',
      user: `Rewrite this person's professional positioning for the target role.

Target Role: ${inputs.targetRole || 'Not specified'}
Current Experience: ${inputs.experience || 'Not provided'}
Key Achievements: ${inputs.achievements || 'Not provided'}

Provide:
1. A powerful 3-line professional summary targeting this role
2. 5 achievement-focused bullet points (with metrics) most relevant to this role
3. A "value proposition" statement (1 sentence) for use in emails/LinkedIn
Format clearly with headers.`
    },

    'cover-letter': {
      system: 'You are a master cover letter writer who crafts personalized, compelling letters that get responses.',
      user: `Write a tailored, human-sounding cover letter.

Company: ${inputs.company || 'the company'}
Role: ${inputs.role || 'the position'}
Candidate Background: ${inputs.background || 'Not provided'}
Key Selling Points: ${inputs.sellingPoints || 'Not provided'}

Write a 3-paragraph cover letter (opening hook, value proof, closing CTA).
Tone: Professional but warm, confident not arrogant. Under 350 words.`
    },

    'personal-pitch': {
      system: 'You are a personal branding expert and speech coach. Create memorable, authentic elevator pitches.',
      user: `Create a 60-second elevator pitch.

Name: ${inputs.name || 'the candidate'}
Target Role: ${inputs.targetRole || 'Not specified'}
Background: ${inputs.background || 'Not provided'}
Key Strengths: ${inputs.strengths || 'Not provided'}

Output:
1. The 60-second pitch (spoken word format, ~150 words)
2. A 10-second "tweet-sized" version
3. 2 variations (formal/casual)`
    },

    'linkedin-upgrade': {
      system: 'You are a LinkedIn optimization expert. You understand recruiter search algorithms and what makes profiles stand out.',
      user: `Optimize this LinkedIn profile.

Target Role: ${inputs.targetRole || 'Not specified'}
Current Headline: ${inputs.currentHeadline || 'Not provided'}
Current About: ${inputs.currentAbout || 'Not provided'}
Industry: ${inputs.industry || 'Technology'}

Provide:
1. 3 headline options (under 220 chars each, keyword-rich)
2. A complete optimized About section (1st person, 2000 chars max)
3. 5 skills to add/reorder for maximum visibility`
    },

    'interview-kit': {
      system: 'You are a senior interview coach who has helped 1000+ candidates land offers at top companies.',
      user: `Generate a comprehensive interview prep kit.

Role: ${inputs.role || 'the role'}
Company: ${inputs.company || 'the company'}
Candidate Background: ${inputs.background || 'Not provided'}

Create 15 likely interview questions with model answers:
- 5 behavioral (STAR format answers)
- 5 technical/role-specific (with key points to hit)
- 3 situational
- 2 culture-fit

Format: Q: [question] → A: [model answer]`
    },

    'behavioral-stories': {
      system: 'You are an expert behavioral interview coach. You help candidates craft compelling STAR stories.',
      user: `Create 3 powerful STAR-format behavioral stories.

Name: ${inputs.name || 'the candidate'}
Target Role: ${inputs.targetRole || 'Not specified'}
Background/Experience: ${inputs.background || 'Not provided'}
Themes to cover: ${inputs.themes || 'leadership, problem-solving, collaboration'}

For each story provide:
**Story [N]: [Title]**
Situation: ...
Task: ...
Action: ... (most detailed, 3-5 steps)
Result: ... (with specific metrics)
Best used for: [question types]

Make stories specific, believable, and memorable.`
    },

    'compensation-strategy': {
      system: 'You are a compensation negotiation expert who has helped candidates increase offers by 20-40%.',
      user: `Build a salary negotiation strategy and script.

Role: ${inputs.role || 'the position'}
Company: ${inputs.company || 'the company'}
Current Salary: ${inputs.currentSalary || 'Not disclosed'}
Target Salary: ${inputs.targetSalary || 'Not specified'}
Competing Offer: ${inputs.competingOffer || 'None'}

Provide:
1. Opening negotiation script (exact words)
2. 3 key value arguments to make
3. Responses to: "We can't go higher", "That's above our band", "Others earn less"
4. Non-salary benefits to negotiate if salary is fixed
5. Walk-away signals and how to handle them`
    },

    'company-intel': {
      system: 'You are a corporate research analyst who prepares job seekers with deep company intelligence.',
      user: `Write a comprehensive company intelligence brief for interview prep.

Company: ${inputs.company || 'the company'}
Role: ${inputs.role || 'the role'}

Cover:
1. Company overview (mission, size, stage, funding)
2. Culture & values (based on known reputation)
3. Interview style & difficulty (what to expect)
4. Recent news/milestones
5. Why people love working there / potential challenges
6. 5 smart questions to ask interviewers
7. How to stand out as a candidate`
    },

    'networking-outreach': {
      system: 'You are an expert at professional networking and crafting messages that get responses.',
      user: `Write networking outreach messages.

Target Person: ${inputs.targetName || 'the contact'}
Their Company: ${inputs.company || 'the company'}
Sender Background: ${inputs.senderBackground || 'Not provided'}
Purpose: ${inputs.purpose || 'exploring opportunities'}

Create:
1. LinkedIn connection request (under 300 chars — LinkedIn limit)
2. Follow-up message after connection accepted (under 1000 chars)
3. Cold email version (if no LinkedIn connection)
All should feel human, not templated.`
    },

    'skill-gap': {
      system: 'You are a career skills strategist with deep knowledge of job market requirements.',
      user: `Analyze the skills gap and create a learning plan.

Target Role: ${inputs.targetRole || 'Not specified'}
Current Skills: ${inputs.currentSkills || 'Not provided'}
Job Description Reference: ${inputs.jobDescription || 'Use general market requirements for this role'}

Provide:
✅ Skills you already have (match rate %)
🔴 Critical missing skills (must-have for this role)
🟡 Nice-to-have skills to develop
📚 90-day learning plan (week by week)
🔗 Top 3 resources for each critical skill (courses, projects, certifications)`
    },

    'portfolio-enhancer': {
      system: 'You are an expert at showcasing technical projects to maximize their perceived value to employers.',
      user: `Rewrite these project descriptions for maximum impact.

Target Role: ${inputs.targetRole || 'the role'}
Projects: ${inputs.projects || 'Not provided'}

For each project provide:
- Rewritten title (more impressive)
- Impact statement (what problem it solved)
- Tech stack highlight
- Quantified results or scale
- One-line "wow factor" for resume bullets
Make even simple projects sound impressive while staying honest.`
    },

    'mock-interview': {
      system: 'You are a tough but fair interviewer conducting a realistic mock interview. Give honest, actionable feedback.',
      user: `Evaluate this interview answer and provide coaching.

Role: ${inputs.role || 'the role'}
Question Asked: ${inputs.question || 'Not provided'}
Candidate's Answer: ${inputs.answer || 'Not provided'}

Provide:
📊 Score: X/10
✅ What worked well (be specific)
⚠️ What to improve (be direct)
🚫 Red flags or things to avoid
✨ Improved version of the answer (rewrite it)
💡 Follow-up questions the interviewer might ask`
    },

    'career-direction': {
      system: 'You are a seasoned career counselor who helps people find fulfilling, well-paying career paths.',
      user: `Suggest 5 career paths based on this profile.

Background: ${inputs.background || 'Not provided'}
Current Skills: ${inputs.skills || 'Not provided'}
Interests/Passions: ${inputs.interests || 'Not provided'}

For each of the 5 paths:
1. Job title(s) on this path
2. Why it's a great fit for this person
3. Salary range in India (fresher → senior)
4. Skills to develop (already have vs need to learn)
5. 2-year roadmap to get there
6. Best companies hiring for this in India`
    },

    'job-search-system': {
      system: 'You are a systematic job search coach who builds data-driven action plans.',
      user: `Build a structured 4-week job search plan.

Name: ${inputs.name || 'the candidate'}
Target Role: ${inputs.targetRole || 'Not specified'}
Hours per Week: ${inputs.hoursPerWeek || '10'}
Target Applications: ${inputs.targetApplications || '20'}

Create a detailed plan with:
📅 Week-by-week breakdown (daily tasks)
🎯 Platform strategy (which job boards, LinkedIn tactics)
🤝 Networking goals (outreach targets per week)
📊 Tracking system (what metrics to monitor)
🔄 Revision checkpoints (when to adjust strategy)
⚡ Quick wins to implement in first 48 hours`
    },

    'personal-brand': {
      system: 'You are a personal branding and LinkedIn content strategy expert.',
      user: `Build a LinkedIn content strategy for thought leadership.

Name: ${inputs.name || 'the professional'}
Industry: ${inputs.industry || 'Technology'}
Target Audience: ${inputs.targetAudience || 'recruiters and peers'}
Goals: ${inputs.goals || 'attract job opportunities'}

Provide:
1. Personal brand positioning statement
2. Content pillars (3-4 themes to post about)
3. 4-week content calendar (3 posts/week)
4. 5 post templates with hooks that drive engagement
5. LinkedIn engagement tactics (commenting, DMs)
6. Profile sections to optimize`
    },

    'confidence-coach': {
      system: 'You are a performance psychologist specializing in interview anxiety and peak performance.',
      user: `Create a personalized interview confidence plan.

Main Fears/Anxieties: ${inputs.fears || 'blanking out, rejection, difficult questions'}
Interview Type: ${inputs.interviewType || 'general job interview'}

Provide:
🧠 5 evidence-based anxiety techniques (with how-to instructions)
⚡ Pre-interview ritual (day-before and morning-of)
💪 Power phrases to use when stuck or nervous
🔄 Reframe 3 common negative thoughts → empowering alternatives
🎯 "Worst case scenario" planning (what if I blank? what if I fail?)
✨ Post-interview mindset regardless of outcome`
    },

    'follow-up-writer': {
      system: 'You are an expert at post-interview communication that keeps candidates top-of-mind.',
      user: `Write a compelling post-interview follow-up.

Role: ${inputs.role || 'the position'}
Company: ${inputs.company || 'the company'}
Interviewer: ${inputs.interviewerName || 'the interviewer'}
Interview Highlights: ${inputs.highlights || 'Not specified'}
Days Since Interview: ${inputs.daysSince || '1'}

Write:
1. Thank-you email (send within 24hrs) — warm, specific, memorable
2. Check-in email (if no response after 1 week)
3. Final follow-up (2 weeks, graceful exit)
Each should reference something specific from the interview.`
    },

    'gap-reframer': {
      system: 'You are a career coach who specializes in helping candidates confidently explain career gaps.',
      user: `Help reframe this career gap as a strength.

Gap Period: ${inputs.gapPeriod || 'Not specified'}
Reason for Gap: ${inputs.reason || 'personal reasons'}
Activities During Gap: ${inputs.activities || 'personal development, upskilling'}
Target Role: ${inputs.targetRole || 'the target role'}

Provide:
1. Honest, positive narrative (2-3 sentences)
2. How to address it on resume (one line)
3. How to answer "What did you do during this gap?" (45 second answer)
4. Proactive way to bring it up before asked
5. Skills/insights gained during the gap to highlight`
    },

    'strength-positioning': {
      system: 'You are a strengths assessment expert and interview coach.',
      user: `Identify and position the top 3 professional strengths.

Name: ${inputs.name || 'the candidate'}
Target Role: ${inputs.targetRole || 'the role'}
Background/Experience: ${inputs.background || 'Not provided'}

For each of the 3 strengths:
💪 Strength name & definition
📖 Evidence from their background (specific example)
📊 How it directly benefits the employer
🎯 Answer to "What is your greatest strength?" (using this)
⚡ Proof story (30-second version)

Make it authentic, specific, and compelling.`
    },

    'offer-analyzer': {
      system: 'You are an expert compensation analyst who helps professionals make smart offer decisions.',
      user: `Analyze and compare these job offers.

Offers: ${inputs.offers || 'Not provided'}
Personal Priorities: ${inputs.priorities || 'salary, growth, work-life balance, learning'}

Provide:
1. Side-by-side comparison table (all key factors)
2. Weighted score for each offer based on stated priorities
3. Hidden costs/benefits to consider (commute, equity, culture)
4. 5 questions to ask each company before deciding
5. Final recommendation with reasoning
6. Negotiation opportunity with the preferred offer`
    },
  };

  const prompt = tools[toolId];
  if (!prompt) throw new Error(`Unknown tool: ${toolId}`);
  return callAI(prompt.system, prompt.user, 3000);
};

// ════════════════════════════════════════════════════════════════════════
// MODULE 1: Skills-based match scoring (no AI needed — pure algorithm)
// ════════════════════════════════════════════════════════════════════════
const computeMatchScore = (job, userSkills = [], userExperience = '') => {
  if (!job.skills || job.skills.length === 0) {
    return { score: 2.5, grade: 'C', matchedSkills: 0, totalSkills: 0 };
  }

  const userSkillsLower = userSkills.map(s => (s.name || s).toLowerCase().trim());
  const jobSkillsLower  = job.skills.map(s => s.toLowerCase().trim());

  let matched = 0;
  jobSkillsLower.forEach(jSkill => {
    if (userSkillsLower.some(uSkill =>
      uSkill.includes(jSkill) || jSkill.includes(uSkill) ||
      uSkill.replace(/[.\s]/g, '').includes(jSkill.replace(/[.\s]/g, ''))
    )) matched++;
  });

  const ratio = matched / jobSkillsLower.length;
  const score = Math.min(5, Math.round(ratio * 5 * 10) / 10);

  let grade = 'F';
  if (score >= 4.5) grade = 'A';
  else if (score >= 3.5) grade = 'B';
  else if (score >= 2.5) grade = 'C';
  else if (score >= 1.5) grade = 'D';

  return { score, grade, matchedSkills: matched, totalSkills: jobSkillsLower.length };
};

// ════════════════════════════════════════════════════════════════════════
// MODULE 8: Skills gap analysis
// ════════════════════════════════════════════════════════════════════════
const analyzeSkillsGap = async (userSkills, targetRole, industry) => {
  const system = `You are a labor market analyst with real-time knowledge of hiring trends in India and globally.
CRITICAL: Return ONLY valid JSON, no markdown, no text outside the JSON object.`;

  const user = `
User's current skills: ${userSkills.map(s => s.name || s).join(', ') || 'None listed'}
Target role: ${targetRole}
Industry: ${industry}

Analyze the current job market and return this exact JSON:
{
  "topInDemandSkills": [
    { "skill": "skill name", "demandLevel": "high", "trend": "rising", "isAI": false }
  ],
  "skillsGap": ["skill1", "skill2", "skill3"],
  "userHasSkills": ["skill1"],
  "matchRateWithSkills": 72,
  "matchRateWithoutSkills": 38,
  "insights": "2 sentence market insight for this role in India",
  "learningPriority": [
    "Skill Name — why it matters for this role",
    "Skill Name — why it matters for this role"
  ]
}

Include 8-10 in-demand skills. Be specific to the Indian job market.`;

  const raw = await callAI(system, user, 2000);
  return extractJSON(raw);
};

module.exports = {
  callAI,
  extractJSON,
  analyzeSkillsGap,
  evaluateJobScore: computeMatchScore,
  tailorCv,
  enhanceProfile,
  runPromptTool,
  computeMatchScore
};

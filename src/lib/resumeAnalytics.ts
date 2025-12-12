/**
 * Resume Analytics Utility
 * Provides comprehensive analytics and insights for resumes
 */

import { ResumeData } from '../components/resume/ResumeControlPanel';

export interface ResumeAnalytics {
  atsScore: number;
  wordCount: number;
  sectionCompleteness: {
    personalInfo: number;
    summary: number;
    experience: number;
    education: number;
    skills: number;
    certifications: number;
    projects: number;
    languages: number;
  };
  keywordDensity: {
    actionVerbs: number;
    quantifiableMetrics: number;
    technicalTerms: number;
  };
  readability: {
    averageSentenceLength: number;
    fleschReadingEase: number;
    gradeLevel: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

/**
 * Calculate comprehensive resume analytics
 */
export function calculateResumeAnalytics(resumeData: ResumeData): ResumeAnalytics {
  const analytics: ResumeAnalytics = {
    atsScore: 0,
    wordCount: 0,
    sectionCompleteness: {
      personalInfo: 0,
      summary: 0,
      experience: 0,
      education: 0,
      skills: 0,
      certifications: 0,
      projects: 0,
      languages: 0,
    },
    keywordDensity: {
      actionVerbs: 0,
      quantifiableMetrics: 0,
      technicalTerms: 0,
    },
    readability: {
      averageSentenceLength: 0,
      fleschReadingEase: 0,
      gradeLevel: 0,
    },
    strengths: [],
    weaknesses: [],
    recommendations: [],
  };

  // Calculate word count
  let fullText = '';
  fullText += resumeData.summary || '';
  resumeData.experience.forEach(exp => {
    fullText += ` ${exp.description || ''}`;
  });
  resumeData.education.forEach(edu => {
    fullText += ` ${edu.degree || ''} ${edu.school || ''}`;
  });
  analytics.wordCount = fullText.split(/\s+/).filter(w => w.length > 0).length;

  // Section Completeness
  // Personal Info
  let personalInfoScore = 0;
  if (resumeData.personalInfo.fullName) personalInfoScore += 20;
  if (resumeData.personalInfo.email) personalInfoScore += 20;
  if (resumeData.personalInfo.phone) personalInfoScore += 20;
  if (resumeData.personalInfo.location) personalInfoScore += 20;
  if (resumeData.personalInfo.jobTitle) personalInfoScore += 20;
  analytics.sectionCompleteness.personalInfo = personalInfoScore;

  // Summary
  if (resumeData.summary) {
    const summaryLength = resumeData.summary.length;
    analytics.sectionCompleteness.summary = Math.min(100, (summaryLength / 200) * 100);
  }

  // Experience
  if (resumeData.experience.length > 0) {
    const avgCompleteness = resumeData.experience.reduce((sum, exp) => {
      let score = 0;
      if (exp.jobTitle) score += 25;
      if (exp.company) score += 25;
      if (exp.startDate) score += 25;
      if (exp.description && exp.description.length > 50) score += 25;
      return sum + score;
    }, 0) / resumeData.experience.length;
    analytics.sectionCompleteness.experience = avgCompleteness;
  }

  // Education
  if (resumeData.education.length > 0) {
    const avgCompleteness = resumeData.education.reduce((sum, edu) => {
      let score = 0;
      if (edu.degree) score += 33;
      if (edu.school) score += 33;
      if (edu.endDate) score += 34;
      return sum + score;
    }, 0) / resumeData.education.length;
    analytics.sectionCompleteness.education = avgCompleteness;
  }

  // Skills
  analytics.sectionCompleteness.skills = Math.min(100, (resumeData.skills.length / 10) * 100);

  // Certifications
  if (resumeData.certifications && resumeData.certifications.length > 0) {
    analytics.sectionCompleteness.certifications = 100;
  }

  // Projects
  if (resumeData.projects && resumeData.projects.length > 0) {
    analytics.sectionCompleteness.projects = 100;
  }

  // Languages
  if (resumeData.languages && resumeData.languages.length > 0) {
    analytics.sectionCompleteness.languages = 100;
  }

  // Keyword Density Analysis
  const actionVerbs = [
    'led', 'managed', 'created', 'developed', 'designed', 'implemented',
    'improved', 'increased', 'decreased', 'reduced', 'optimized', 'built',
    'established', 'launched', 'delivered', 'achieved', 'executed', 'coordinated',
    'supervised', 'trained', 'mentored', 'collaborated', 'initiated', 'streamlined',
    'transformed', 'enhanced', 'generated', 'produced', 'facilitated', 'organized'
  ];

  const textLower = fullText.toLowerCase();
  actionVerbs.forEach(verb => {
    const regex = new RegExp(`\\b${verb}\\w*\\b`, 'gi');
    const matches = textLower.match(regex);
    if (matches) {
      analytics.keywordDensity.actionVerbs += matches.length;
    }
  });

  // Quantifiable metrics (numbers, percentages, dollar amounts)
  const metricPatterns = [
    /\d+%/g, // Percentages
    /\$\d+/g, // Dollar amounts
    /\d+\+/g, // Years of experience
    /\d+[km]?/g, // Numbers with k/m suffixes
  ];
  metricPatterns.forEach(pattern => {
    const matches = fullText.match(pattern);
    if (matches) {
      analytics.keywordDensity.quantifiableMetrics += matches.length;
    }
  });

  // Technical terms (common tech keywords)
  const technicalTerms = [
    'api', 'database', 'framework', 'algorithm', 'architecture', 'system',
    'software', 'application', 'platform', 'technology', 'methodology', 'process',
    'javascript', 'python', 'react', 'node', 'sql', 'aws', 'cloud', 'devops'
  ];
  technicalTerms.forEach(term => {
    const regex = new RegExp(`\\b${term}\\w*\\b`, 'gi');
    const matches = textLower.match(regex);
    if (matches) {
      analytics.keywordDensity.technicalTerms += matches.length;
    }
  });

  // Readability Analysis
  const sentences = fullText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = fullText.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((sum, word) => {
    return sum + countSyllables(word);
  }, 0);

  analytics.readability.averageSentenceLength = sentences.length > 0
    ? words.length / sentences.length
    : 0;

  // Flesch Reading Ease Score
  if (sentences.length > 0 && words.length > 0) {
    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    analytics.readability.fleschReadingEase = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    analytics.readability.gradeLevel = (0.39 * avgSentenceLength) + (11.8 * avgSyllablesPerWord) - 15.59;
  }

  // Generate Strengths and Weaknesses
  if (resumeData.experience.length >= 3) {
    analytics.strengths.push('Strong work experience with multiple positions');
  }
  if (analytics.keywordDensity.actionVerbs >= 10) {
    analytics.strengths.push('Effective use of action verbs');
  }
  if (analytics.keywordDensity.quantifiableMetrics >= 5) {
    analytics.strengths.push('Good use of quantifiable achievements');
  }
  if (resumeData.skills.length >= 10) {
    analytics.strengths.push('Comprehensive skill set');
  }
  if (analytics.sectionCompleteness.personalInfo >= 80) {
    analytics.strengths.push('Complete personal information');
  }

  if (resumeData.experience.length === 0) {
    analytics.weaknesses.push('No work experience listed');
  }
  if (analytics.keywordDensity.actionVerbs < 5) {
    analytics.weaknesses.push('Limited use of action verbs');
  }
  if (analytics.keywordDensity.quantifiableMetrics < 3) {
    analytics.weaknesses.push('Add more quantifiable achievements');
  }
  if (analytics.sectionCompleteness.summary < 50) {
    analytics.weaknesses.push('Professional summary needs improvement');
  }
  if (resumeData.skills.length < 5) {
    analytics.weaknesses.push('Add more relevant skills');
  }

  // Generate Recommendations
  if (analytics.readability.gradeLevel > 12) {
    analytics.recommendations.push('Simplify language for better readability');
  }
  if (analytics.wordCount < 300) {
    analytics.recommendations.push('Expand resume content for better detail');
  }
  if (analytics.wordCount > 800) {
    analytics.recommendations.push('Consider condensing content to keep resume concise');
  }
  if (!resumeData.certifications || resumeData.certifications.length === 0) {
    analytics.recommendations.push('Consider adding relevant certifications');
  }
  if (!resumeData.projects || resumeData.projects.length === 0) {
    analytics.recommendations.push('Add personal projects to showcase skills');
  }

  return analytics;
}

/**
 * Count syllables in a word (simplified algorithm)
 */
function countSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

/**
 * Get analytics history for a resume
 */
export function getAnalyticsHistory(resumeId: string): ResumeAnalytics[] {
  const historyKey = `resume_analytics_history_${resumeId}`;
  const history = localStorage.getItem(historyKey);
  return history ? JSON.parse(history) : [];
}

/**
 * Save analytics snapshot
 */
export function saveAnalyticsSnapshot(resumeId: string, analytics: ResumeAnalytics): void {
  const historyKey = `resume_analytics_history_${resumeId}`;
  const history = getAnalyticsHistory(resumeId);
  history.push({
    ...analytics,
    timestamp: new Date().toISOString(),
  });
  // Keep only last 30 snapshots
  const recentHistory = history.slice(-30);
  localStorage.setItem(historyKey, JSON.stringify(recentHistory));
}


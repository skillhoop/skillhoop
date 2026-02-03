/**
 * Resume Analytics Utility
 * Provides comprehensive analytics and insights for resumes
 */

import { supabase } from './supabase';
import { ResumeData } from '../types/resume';

export interface ResumeAnalytics {
  atsScore: number;
  wordCount: number;
  /**
   * Optional timestamp used by legacy localStorage history snapshots.
   * (Not present on "live" analytics objects.)
   */
  timestamp?: string;
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

export interface ScoreHistoryPoint {
  date: string;
  score: number;
}

export interface SectionCompleteness {
  summary: number;
  experience: number;
  education: number;
  skills: number;
}

/**
 * Get ATS score history from resume_versions table
 * Returns data formatted for Recharts line chart
 */
export async function getScoreHistory(resumeId: string): Promise<ScoreHistoryPoint[]> {
  try {
    // Fetch all versions for this resume, ordered by created_at
    const { data, error } = await supabase
      .from('resume_versions')
      .select('content, created_at')
      .eq('resume_id', resumeId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching score history:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Extract ATS scores and dates from the content JSONB
    const historyPoints: ScoreHistoryPoint[] = [];

    for (const row of data) {
      try {
        const content = typeof row.content === 'string' 
          ? JSON.parse(row.content) 
          : row.content;
        
        const atsScore = content?.atsScore || 0;
        const createdAt = new Date(row.created_at);
        
        // Format date as "Oct 24" or "Oct 25"
        const dateStr = createdAt.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });

        historyPoints.push({
          date: dateStr,
          score: Math.round(atsScore),
        });
      } catch (e) {
        console.error('Error parsing version content:', e);
        // Skip invalid entries
        continue;
      }
    }

    return historyPoints;
  } catch (error) {
    console.error('Error getting score history:', error);
    return [];
  }
}

/**
 * Get section completeness percentages for Summary, Experience, Education, and Skills
 */
export function getSectionCompleteness(resumeData: ResumeData): SectionCompleteness {
  const completeness: SectionCompleteness = {
    summary: 0,
    experience: 0,
    education: 0,
    skills: 0,
  };

  // Summary completeness (based on length and content)
  if (resumeData.personalInfo?.summary) {
    const summaryLength = resumeData.personalInfo.summary.length;
    // Consider 200+ characters as 100% complete
    completeness.summary = Math.min(100, (summaryLength / 200) * 100);
  }

  // Experience completeness
  if (resumeData.sections) {
    const experienceSection = resumeData.sections.find(s => s.type === 'experience');
    if (experienceSection && experienceSection.items) {
      const items = experienceSection.items;
      if (items.length > 0) {
        // Calculate average completeness per item
        const avgCompleteness = items.reduce((sum, item) => {
          let score = 0;
          if (item.title) score += 25; // Job title
          if (item.subtitle) score += 25; // Company
          if (item.date) score += 25; // Date
          if (item.description && item.description.length > 50) score += 25; // Description
          return sum + score;
        }, 0) / items.length;
        completeness.experience = avgCompleteness;
      }
    }
  }

  // Education completeness
  if (resumeData.sections) {
    const educationSection = resumeData.sections.find(s => s.type === 'education');
    if (educationSection && educationSection.items) {
      const items = educationSection.items;
      if (items.length > 0) {
        const avgCompleteness = items.reduce((sum, item) => {
          let score = 0;
          if (item.title) score += 33; // Degree
          if (item.subtitle) score += 33; // School
          if (item.date) score += 34; // Date
          return sum + score;
        }, 0) / items.length;
        completeness.education = avgCompleteness;
      }
    }
  }

  // Skills completeness (based on number of skills)
  if (resumeData.sections) {
    const skillsSection = resumeData.sections.find(s => s.type === 'skills');
    if (skillsSection && skillsSection.items) {
      const skillsCount = skillsSection.items.length;
      // Consider 10+ skills as 100% complete
      completeness.skills = Math.min(100, (skillsCount / 10) * 100);
    }
  }

  return completeness;
}

/**
 * Calculate comprehensive resume analytics
 */
export function calculateResumeAnalytics(resumeData: ResumeData): ResumeAnalytics {
  const analytics: ResumeAnalytics = {
    atsScore: resumeData.atsScore || 0,
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
  if (resumeData.personalInfo?.summary) {
    fullText += resumeData.personalInfo.summary;
  }
  
  if (resumeData.sections) {
    resumeData.sections.forEach(section => {
      if (section.items) {
        section.items.forEach(item => {
          if (item.description) fullText += ` ${item.description}`;
          if (item.title) fullText += ` ${item.title}`;
          if (item.subtitle) fullText += ` ${item.subtitle}`;
        });
      }
    });
  }
  
  analytics.wordCount = fullText.split(/\s+/).filter(w => w.length > 0).length;

  // Section Completeness
  const completeness = getSectionCompleteness(resumeData);
  analytics.sectionCompleteness.summary = completeness.summary;
  analytics.sectionCompleteness.experience = completeness.experience;
  analytics.sectionCompleteness.education = completeness.education;
  analytics.sectionCompleteness.skills = completeness.skills;

  // Personal Info
  if (resumeData.personalInfo) {
    let personalInfoScore = 0;
    if (resumeData.personalInfo.fullName) personalInfoScore += 20;
    if (resumeData.personalInfo.email) personalInfoScore += 20;
    if (resumeData.personalInfo.phone) personalInfoScore += 20;
    if (resumeData.personalInfo.location) personalInfoScore += 20;
    if (resumeData.personalInfo.jobTitle) personalInfoScore += 20;
    analytics.sectionCompleteness.personalInfo = personalInfoScore;
  }

  // Additional sections
  if (resumeData.sections) {
    const certSection = resumeData.sections.find(s => s.type === 'custom' && s.title.toLowerCase().includes('certification'));
    if (certSection && certSection.items && certSection.items.length > 0) {
      analytics.sectionCompleteness.certifications = 100;
    }

    const projectSection = resumeData.sections.find(s => s.type === 'custom' && s.title.toLowerCase().includes('project'));
    if (projectSection && projectSection.items && projectSection.items.length > 0) {
      analytics.sectionCompleteness.projects = 100;
    }

    const langSection = resumeData.sections.find(s => s.type === 'custom' && s.title.toLowerCase().includes('language'));
    if (langSection && langSection.items && langSection.items.length > 0) {
      analytics.sectionCompleteness.languages = 100;
    }
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

  // Quantifiable metrics
  const metricPatterns = [
    /\d+%/g,
    /\$\d+/g,
    /\d+\+/g,
    /\d+[km]?/g,
  ];
  metricPatterns.forEach(pattern => {
    const matches = fullText.match(pattern);
    if (matches) {
      analytics.keywordDensity.quantifiableMetrics += matches.length;
    }
  });

  // Technical terms
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

  if (sentences.length > 0 && words.length > 0) {
    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    analytics.readability.fleschReadingEase = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    analytics.readability.gradeLevel = (0.39 * avgSentenceLength) + (11.8 * avgSyllablesPerWord) - 15.59;
  }

  // Generate Strengths and Weaknesses
  if (analytics.sectionCompleteness.experience >= 70) {
    analytics.strengths.push('Strong work experience section');
  }
  if (analytics.keywordDensity.actionVerbs >= 10) {
    analytics.strengths.push('Effective use of action verbs');
  }
  if (analytics.keywordDensity.quantifiableMetrics >= 5) {
    analytics.strengths.push('Good use of quantifiable achievements');
  }
  if (analytics.sectionCompleteness.skills >= 80) {
    analytics.strengths.push('Comprehensive skill set');
  }
  if (analytics.sectionCompleteness.personalInfo >= 80) {
    analytics.strengths.push('Complete personal information');
  }

  if (analytics.sectionCompleteness.experience < 30) {
    analytics.weaknesses.push('Work experience section needs more detail');
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
  if (analytics.sectionCompleteness.skills < 50) {
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
 * Get analytics history for a resume (legacy localStorage function)
 */
export function getAnalyticsHistory(resumeId: string): ResumeAnalytics[] {
  const historyKey = `resume_analytics_history_${resumeId}`;
  const history = localStorage.getItem(historyKey);
  return history ? JSON.parse(history) : [];
}

/**
 * Save analytics snapshot (legacy localStorage function)
 */
export function saveAnalyticsSnapshot(resumeId: string, analytics: ResumeAnalytics): void {
  const historyKey = `resume_analytics_history_${resumeId}`;
  const history = getAnalyticsHistory(resumeId);
  history.push({
    ...analytics,
    timestamp: new Date().toISOString(),
  });
  const recentHistory = history.slice(-30);
  localStorage.setItem(historyKey, JSON.stringify(recentHistory));
}

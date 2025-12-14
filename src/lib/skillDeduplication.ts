/**
 * Skill Deduplication Utilities
 * Provides robust deduplication logic for skills that handles:
 * - Case-insensitive matching
 * - Whitespace normalization
 * - Common variations (e.g., "JavaScript" vs "Javascript" vs "JS")
 * - Special characters normalization
 */

/**
 * Normalize a skill name for comparison
 * - Converts to lowercase
 * - Trims whitespace
 * - Normalizes special characters
 * - Handles common abbreviations
 */
export function normalizeSkillName(skill: string): string {
  if (!skill || typeof skill !== 'string') {
    return '';
  }

  // Trim and convert to lowercase
  let normalized = skill.trim().toLowerCase();

  // Remove extra whitespace (multiple spaces, tabs, newlines)
  normalized = normalized.replace(/\s+/g, ' ');

  // Normalize common special characters
  normalized = normalized.replace(/[–—]/g, '-'); // En/em dashes to hyphens
  normalized = normalized.replace(/[''"]/g, "'"); // Smart quotes to regular quotes
  normalized = normalized.replace(/[.]/g, ''); // Remove periods (e.g., "C++" vs "C++.")

  // Handle common abbreviations and variations
  const abbreviations: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'html5': 'html',
    'css3': 'css',
    'react.js': 'react',
    'reactjs': 'react',
    'vue.js': 'vue',
    'vuejs': 'vue',
    'node.js': 'nodejs',
    'nodejs': 'nodejs',
    'ai': 'artificial intelligence',
    'ml': 'machine learning',
    'ui': 'user interface',
    'ux': 'user experience',
    'api': 'application programming interface',
    'rest api': 'rest',
    'graphql api': 'graphql',
    'aws': 'amazon web services',
    'gcp': 'google cloud platform',
    'azure': 'microsoft azure',
  };

  // Check for exact abbreviation match
  if (abbreviations[normalized]) {
    normalized = abbreviations[normalized];
  } else {
    // Check for abbreviation at the end (e.g., "React JS" -> "React JavaScript")
    for (const [abbr, full] of Object.entries(abbreviations)) {
      const regex = new RegExp(`\\b${abbr}\\b$`, 'i');
      if (regex.test(normalized)) {
        normalized = normalized.replace(regex, full);
        break;
      }
    }
  }

  return normalized;
}

/**
 * Check if two skill names are duplicates (case-insensitive, normalized)
 */
export function areSkillsDuplicate(skill1: string, skill2: string): boolean {
  if (!skill1 || !skill2) {
    return false;
  }

  const normalized1 = normalizeSkillName(skill1);
  const normalized2 = normalizeSkillName(skill2);

  // Exact match after normalization
  if (normalized1 === normalized2) {
    return true;
  }

  // Check if one is contained in the other (for cases like "React" vs "React.js")
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    // But avoid false positives (e.g., "Java" vs "JavaScript")
    // Only consider it a duplicate if the shorter one is at least 3 characters
    const shorter = normalized1.length < normalized2.length ? normalized1 : normalized2;
    const longer = normalized1.length >= normalized2.length ? normalized1 : normalized2;
    
    if (shorter.length >= 3 && longer.startsWith(shorter)) {
      // Check if the longer one is just the shorter one with a suffix
      const suffix = longer.slice(shorter.length);
      // Common suffixes that indicate they're the same skill
      const validSuffixes = ['.js', '.jsx', '.ts', '.tsx', 'js', 'jsx', 'ts', 'tsx', ' framework', ' library'];
      if (validSuffixes.some(s => suffix === s || suffix.startsWith(s))) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Deduplicate an array of skills, keeping the first occurrence (with original casing)
 * Returns an array of unique skills
 */
export function deduplicateSkills(skills: string[]): string[] {
  if (!Array.isArray(skills) || skills.length === 0) {
    return [];
  }

  const seen = new Set<string>();
  const result: string[] = [];

  for (const skill of skills) {
    if (!skill || typeof skill !== 'string' || skill.trim() === '') {
      continue; // Skip empty or invalid skills
    }

    const normalized = normalizeSkillName(skill);

    // Check if we've seen this normalized skill before
    if (!seen.has(normalized)) {
      seen.add(normalized);
      result.push(skill.trim()); // Keep original casing and trim
    } else {
      // Check if the current skill has better casing (e.g., "React" vs "react")
      const existingIndex = result.findIndex(s => normalizeSkillName(s) === normalized);
      if (existingIndex !== -1) {
        const existing = result[existingIndex];
        // Prefer the version with proper casing (starts with uppercase)
        if (skill.trim()[0]?.toUpperCase() === skill.trim()[0] && 
            existing[0]?.toLowerCase() === existing[0]) {
          result[existingIndex] = skill.trim();
        }
      }
    }
  }

  return result;
}

/**
 * Merge two arrays of skills and deduplicate them
 * Preserves the order: existing skills first, then new skills
 */
export function mergeAndDeduplicateSkills(existingSkills: string[], newSkills: string[]): string[] {
  if (!Array.isArray(existingSkills)) {
    existingSkills = [];
  }
  if (!Array.isArray(newSkills)) {
    newSkills = [];
  }

  // Combine arrays (existing first to preserve their order)
  const combined = [...existingSkills, ...newSkills];

  // Deduplicate
  return deduplicateSkills(combined);
}

/**
 * Find duplicate skills in an array
 * Returns an array of objects with the skill and its duplicates
 */
export function findDuplicateSkills(skills: string[]): Array<{ skill: string; duplicates: string[] }> {
  if (!Array.isArray(skills) || skills.length === 0) {
    return [];
  }

  const duplicates: Array<{ skill: string; duplicates: string[] }> = [];
  const processed = new Set<string>();

  for (let i = 0; i < skills.length; i++) {
    const skill = skills[i];
    if (!skill || typeof skill !== 'string' || skill.trim() === '') {
      continue;
    }

    const normalized = normalizeSkillName(skill);
    if (processed.has(normalized)) {
      continue; // Already processed
    }

    const skillDuplicates: string[] = [];

    // Find all duplicates of this skill
    for (let j = i + 1; j < skills.length; j++) {
      const otherSkill = skills[j];
      if (!otherSkill || typeof otherSkill !== 'string' || otherSkill.trim() === '') {
        continue;
      }

      if (areSkillsDuplicate(skill, otherSkill)) {
        skillDuplicates.push(otherSkill.trim());
      }
    }

    if (skillDuplicates.length > 0) {
      duplicates.push({
        skill: skill.trim(),
        duplicates: skillDuplicates,
      });
    }

    processed.add(normalized);
  }

  return duplicates;
}



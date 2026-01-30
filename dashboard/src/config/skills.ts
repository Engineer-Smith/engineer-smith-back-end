// config/skills.ts
import { 
  Code,
  Palette,
  Smartphone,
  Server,
  Monitor,
  Database,
  FileJson,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Skill {
  name: string;
  skill: string;
  description: string;
  icon: LucideIcon;
  color: string;
  // Add sub-categories for filtering
  subCategories?: string[];
}

export const skills: Skill[] = [
  { 
    name: "HTML", 
    skill: "html", 
    description: "Questions about HTML structure and semantics.",
    icon: Code,
    color: "danger"
  },
  { 
    name: "CSS", 
    skill: "css", 
    description: "Questions about styling and layouts.",
    icon: Palette,
    color: "info"
  },
  { 
    name: "JavaScript", 
    skill: "javascript", 
    description: "Questions about JavaScript programming.",
    icon: Code,
    color: "warning"
  },
  { 
    name: "TypeScript", 
    skill: "typescript", 
    description: "Questions about TypeScript and type safety.",
    icon: Code,
    color: "primary"
  },
  { 
    name: "React", 
    skill: "react", 
    description: "Questions about React components and hooks.",
    icon: Monitor,
    color: "success"
  },
  { 
    name: "React Native", 
    skill: "reactNative", 
    description: "Questions about mobile app development with React Native.",
    icon: Smartphone,
    color: "secondary"
  },
  { 
    name: "Flutter/Dart", 
    skill: "flutter", 
    description: "Questions about Flutter app development and Dart programming.",
    icon: Smartphone,
    color: "info",
    subCategories: ["flutter", "dart"] // Both languages combined in UI
  },
  { 
    name: "Backend", 
    skill: "backend", 
    description: "Questions about server-side development.",
    icon: Server,
    color: "dark",
    subCategories: ["express", "python"] 
  },
  { 
    name: "Database", 
    skill: "sql", 
    description: "Questions about SQL and database management.",
    icon: Database,
    color: "primary"
  },
  {
    name: "JSON/APIs",
    skill: "json",
    description: "Questions about JSON data and API handling.",
    icon: FileJson,
    color: "success"
  },
  {
    name: "Swift/SwiftUI",
    skill: "swift",
    description: "Questions about Swift programming and SwiftUI interfaces.",
    icon: Smartphone,
    color: "warning",
    subCategories: ["swift", "swiftui"]
  },
];

// Helper function to get count for a skill (handles backend aggregation)
export const getSkillCount = (skill: Skill, languageStats: Array<{language: string, count: number}>) => {
  if (skill.subCategories) {
    // For skills with sub-categories, sum them up
    return skill.subCategories.reduce((total, subCat) => {
      const stat = languageStats.find(s => s.language === subCat);
      return total + (stat?.count || 0);
    }, 0);
  } else {
    // For regular skills, find the matching language
    const stat = languageStats.find(s => s.language === skill.skill);
    return stat?.count || 0;
  }
};4
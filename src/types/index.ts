// ─── Engineering OS — Global Types ────────────────────────────────────────

export type LearnerLevel = "foundation" | "apprentice" | "practitioner" | "professional" | "expert";

export type MasteryState = "locked" | "available" | "in_progress" | "mastered";

export type AcademyId =
  | "foundations"
  | "programming"
  | "computer-science"
  | "software-engineering"
  | "systems-engineering"
  | "ai-engineering"
  | "founder-architect";

// ─── Curriculum Types ─────────────────────────────────────────────────────

export interface Academy {
  id: AcademyId;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  modules: Module[];
  prerequisites: AcademyId[];
  estimatedWeeks: number;
  outcome: string;
  projects: string[];
}

export interface Module {
  id: string;
  academyId: AcademyId;
  title: string;
  description: string;
  topics: Topic[];
  prerequisites: string[];
  estimatedHours: number;
  project: string;
}

export interface Topic {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  difficulty: LearnerLevel;
  estimatedMinutes: number;
  tags: string[];
}

// ─── User / Progress Types ────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  level: LearnerLevel;
  goal: string;
  xp: number;
  streak: number;
  joinedAt: string;
  currentAcademy: AcademyId;
  currentModule: string;
}

export interface TopicProgress {
  userId: string;
  topicId: string;
  state: MasteryState;
  attempts: number;
  lastAttemptAt?: string;
  masteredAt?: string;
  score?: number;
}

export interface AcademyProgress {
  academyId: AcademyId;
  completedTopics: number;
  totalTopics: number;
  state: MasteryState;
  percentage: number;
}

// ─── Lesson Types ─────────────────────────────────────────────────────────

export interface LessonRequest {
  academy: string;
  module: string;
  topic: string;
  level: LearnerLevel;
}

export interface LessonSection {
  id: string;
  title: string;
  content: string;
  type: "text" | "code" | "quiz" | "exercise" | "callout";
}

export interface GeneratedLesson {
  topic: string;
  level: LearnerLevel;
  sections: LessonSection[];
  rawContent: string;
  generatedAt: string;
}

// ─── Code Execution Types ─────────────────────────────────────────────────

export interface ExecuteRequest {
  language: string;
  version: string;
  code: string;
  stdin?: string;
  args?: string[];
}

export interface ExecuteResult {
  language: string;
  version: string;
  run: {
    stdout: string;
    stderr: string;
    output: string;
    code: number;
    signal: string | null;
  };
  compile?: {
    stdout: string;
    stderr: string;
    output: string;
    code: number;
    signal: string | null;
  };
}

export interface Runtime {
  language: string;
  version: string;
  aliases: string[];
}

// ─── AI Professor Types ───────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface AIProfessorContext {
  academy: string;
  module: string;
  topic: string;
  level: LearnerLevel;
}

// ─── Roadmap Types ────────────────────────────────────────────────────────

export interface RoadmapNode {
  id: string;
  label: string;
  type: "academy" | "module" | "topic";
  state: MasteryState;
  x?: number;
  y?: number;
  data?: {
    academyId?: AcademyId;
    moduleId?: string;
    topicId?: string;
    color?: string;
    icon?: string;
  };
}

export interface RoadmapEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
}

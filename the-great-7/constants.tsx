
import React from 'react';
import { Tool, ToolKey } from './types'; 
import { ClipboardCheck, Zap, BarChart3, ListChecks, CalendarDays, Target, Users, LayoutDashboard, AlertTriangle, Lightbulb, TrendingUp, Briefcase, Rocket, ShieldAlert, Award, CalendarClock, MessageSquareWarning, HelpCircle, CheckCircle, XCircle, Info, Edit3, Trash2, PlusCircle, Save, Sliders, ChevronsUpDown, Eye, Grid, Sparkles } from 'lucide-react'; 

export const TOOLS_CONFIG: Tool[] = [
  {
    key: ToolKey.EISENHOWER_MATRIX,
    name: 'Eisenhower Matrix',
    description: 'Prioritize tasks by urgency and importance.',
    icon: Sliders,
    path: `/tool/${ToolKey.EISENHOWER_MATRIX}`,
    tagline: "80% of my tasks can wait!"
  },
  {
    key: ToolKey.SWOT_ANALYSIS,
    name: 'SWOT Analysis',
    description: 'Evaluate projects or ideas objectively.',
    icon: ChevronsUpDown,
    path: `/tool/${ToolKey.SWOT_ANALYSIS}`,
    tagline: "Here’s why my startup’s SWOT analysis says ‘GO!’"
  },
  {
    key: ToolKey.PARETO_CHART,
    name: 'Pareto Chart',
    description: 'Identify which 20% of efforts drive 80% of results.',
    icon: BarChart3,
    path: `/tool/${ToolKey.PARETO_CHART}`,
    tagline: "3 tasks give me 80% of my results!"
  },
  {
    key: ToolKey.DECISION_MATRIX,
    name: 'Decision Matrix',
    description: 'Compare options based on weighted criteria.',
    icon: ListChecks,
    path: `/tool/${ToolKey.DECISION_MATRIX}`,
    tagline: "My Decision Matrix says ‘Job B is the best fit!’"
  },
  {
    key: ToolKey.GANTT_CHART,
    name: 'Gantt Chart',
    description: 'Plan project timelines with dependencies.',
    icon: CalendarDays,
    path: `/tool/${ToolKey.GANTT_CHART}`,
    tagline: "This project is 10 days ahead of schedule!"
  },
  {
    key: ToolKey.SMART_GOALS,
    name: 'SMART Goals',
    description: 'Create actionable goals using SMART criteria.',
    icon: Target,
    path: `/tool/${ToolKey.SMART_GOALS}`,
    tagline: "100 push-ups daily by December!"
  },
  {
    key: ToolKey.RACI_MATRIX,
    name: 'RACI Matrix',
    description: 'Assign roles in projects clearly.',
    icon: Users,
    path: `/tool/${ToolKey.RACI_MATRIX}`,
    tagline: "No more blaming in this project!"
  },
  {
    key: ToolKey.MANDALA_CHART,
    name: 'Mandala Chart',
    description: 'Expand ideas and goals in a 3x3 grid (Lotus Blossom).',
    icon: Grid,
    path: `/tool/${ToolKey.MANDALA_CHART}`,
    tagline: "Unlocking deeper insights, one square at a time."
  },
];

// Hex values for brand colors, mirroring tailwind.config.js for JS access
export const BRAND_THEME_COLORS = {
  accent: '#3b82f6',      // blue-500
  accentHover: '#2563eb', // blue-600
  accentText: '#ffffff',   // white

  gray: '#6b7280',         // gray-500
  grayLight: '#d1d5db',    // gray-300
  grayDark: '#4b5563',     // gray-600

  textLight: '#18181b',     // zinc-900
  textDark: '#f4f4f5',      // zinc-100
  textMutedLight: '#71717a',// zinc-500
  textMutedDark: '#a1a1aa', // zinc-400

  bgLight: '#ffffff',       // white
  bgDark: '#111111',        // near black
  
  cardLight: '#f4f4f5',     // zinc-100
  cardDark: '#27272a',      // zinc-800

  borderLight: '#d4d4d8',   // zinc-300
  borderDark: '#3f3f46',    // zinc-700
};


// Monochromatic theme with accent for "Do Now"
export const QUADRANT_COLORS: { [key: string]: string } = {
  'Do Now': 'bg-brand-accent/[0.05] dark:bg-brand-accent/[0.1] border-brand-accent', 
  'Schedule': 'bg-brand-card-light dark:bg-brand-card-dark border-brand-border-light dark:border-brand-border-dark', 
  'Delegate': 'bg-brand-card-light dark:bg-brand-card-dark border-brand-border-light dark:border-brand-border-dark', 
  'Eliminate': 'bg-zinc-200 dark:bg-zinc-700 border-zinc-400 dark:border-zinc-600', 
};

// Text color will generally be brand-text-light/dark, ensure specific overrides if needed against quadrant backgrounds
export const QUADRANT_TEXT_COLORS: { [key: string]: string } = {
  'Do Now': 'text-brand-accent', // Emphasize text for Do Now
  'Schedule': 'text-brand-text-light dark:text-brand-text-dark',
  'Delegate': 'text-brand-text-light dark:text-brand-text-dark',
  'Eliminate': 'text-zinc-700 dark:text-zinc-300',
};


export const SWOT_CATEGORY_ICONS: { [key: string]: React.ElementType } = {
  Strengths: Award,
  Weaknesses: AlertTriangle,
  Opportunities: Rocket,
  Threats: ShieldAlert,
};

// Monochromatic theme for SWOT, relying on icons and borders primarily
export const SWOT_CATEGORY_COLORS: { [key: string]: string } = {
  Strengths: 'bg-brand-card-light dark:bg-brand-card-dark border-brand-gray-light dark:border-brand-gray-dark',
  Weaknesses: 'bg-brand-card-light dark:bg-brand-card-dark border-brand-gray-light dark:border-brand-gray-dark',
  Opportunities: 'bg-brand-card-light dark:bg-brand-card-dark border-brand-gray-light dark:border-brand-gray-dark',
  Threats: 'bg-brand-card-light dark:bg-brand-card-dark border-brand-gray-light dark:border-brand-gray-dark',
};


export const RACI_ROLE_DEFINITIONS: { [key: string]: { name: string, description: string, icon: string } } = {
  R: { name: 'Responsible', description: 'Does the work to complete the task.', icon: '🛠️' },
  A: { name: 'Accountable', description: 'Owns the task and is answerable for its completion.', icon: '👑' },
  C: { name: 'Consulted', description: 'Provides input and expertise.', icon: '💬' },
  I: { name: 'Informed', description: 'Kept up-to-date on progress.', icon: '🔔' },
};

export const EDUCATIONAL_CONTENT: { [key in ToolKey]?: { principle: string, video?: string, guide?: string, examples?: string, caseStudy?: string, tooltip: string } } = {
  [ToolKey.EISENHOWER_MATRIX]: {
    principle: "The Eisenhower Principle, also known as the Urgent/Important Matrix, helps you distinguish between tasks that are urgent (require immediate attention) and important (contribute to long-term goals). This allows you to focus on what truly matters and avoid being reactive.",
    tooltip: "Prioritize tasks based on urgency and importance. Focus first on tasks that are both urgent and important."
  },
  [ToolKey.SWOT_ANALYSIS]: {
    principle: "SWOT analysis is a strategic planning technique used to identify Strengths, Weaknesses, Opportunities, and Threats related to a project or business venture. It provides a framework for reviewing strategy, position and direction.",
    video: "https://www.youtube.com/embed/P9i_2Yf2i7s", 
    tooltip: "Identify internal strengths/weaknesses and external opportunities/threats to make informed decisions."
  },
  [ToolKey.PARETO_CHART]: {
    principle: "The Pareto Principle (80/20 rule) states that for many events, roughly 80% of the effects come from 20% of the causes. In task management, this means identifying the vital few tasks that yield the most results.",
    tooltip: "Find the 20% of causes/efforts that produce 80% of effects/results. Focus on high-impact activities."
  },
  [ToolKey.DECISION_MATRIX]: {
    principle: "A decision matrix is a list of values in rows and columns that allows an analyst to systematically identify, analyze, and rate the performance of relationships between sets of values and information. It's particularly useful for making complex decisions with multiple criteria.",
    guide: "1. List options (rows).\n2. Define criteria (columns).\n3. Assign weights to criteria (0-100%).\n4. Score each option against each criterion (e.g., 1-10).\n5. Calculate weighted scores and sum them up for each option.\nThe option with the highest total score is often the preferred choice.",
    tooltip: "Objectively compare multiple options against various weighted criteria to find the best choice."
  },
  [ToolKey.GANTT_CHART]: {
    principle: "A Gantt chart is a type of bar chart that illustrates a project schedule. It lists tasks to be performed on the vertical axis, and time intervals on the horizontal axis. The width of the horizontal bars in the graph shows the duration of each activity, and dependencies can be visualized.",
    tooltip: "Visualize project timelines, dependencies, and progress. Helps in planning and tracking."
  },
  [ToolKey.SMART_GOALS]: {
    principle: "SMART is an acronym for Specific, Measurable, Achievable, Relevant, and Time-bound. This framework helps in setting clear and attainable goals, rather than vague resolutions, by ensuring goals are well-defined and trackable.",
    examples: "Vague Goal: 'Improve fitness.'\nSMART Goal: 'Run a 5K race in under 30 minutes by June 1st. This will be achieved by following a beginner running plan, training 3 times per week, and tracking my run times. This is relevant to my desire for a healthier lifestyle.'",
    tooltip: "Define goals that are Specific, Measurable, Achievable, Relevant, and Time-bound for better focus and success."
  },
  [ToolKey.RACI_MATRIX]: {
    principle: "A RACI matrix describes the participation by various roles in completing tasks or deliverables for a project or business process. It clarifies roles (Responsible, Accountable, Consulted, Informed) and responsibilities, thereby reducing confusion and improving project execution.",
    caseStudy: "In a software project, defining who is Responsible for coding a feature, Accountable for its successful deployment, Consulted for UX design input, and Informed of release status prevents overlap, ensures all stakeholders are appropriately involved, and minimizes miscommunication.",
    tooltip: "Clarify roles (Responsible, Accountable, Consulted, Informed) for tasks to ensure clear ownership and communication."
  },
  [ToolKey.MANDALA_CHART]: {
    principle: "The Mandala Chart, or Lotus Blossom Technique, is a Japanese planning tool. It uses a 3x3 grid where the central idea is surrounded by 8 related sub-themes. Each sub-theme can then become the center of its own 3x3 grid, allowing for deep exploration and organization of thoughts.",
    guide: "1. Place your main theme/goal in the central square of the main 3x3 grid.\n2. Brainstorm 8 related sub-goals or actions and place them in the surrounding squares.\n3. For deeper exploration, take any of the 8 sub-goals, place it in the center of a new 3x3 grid, and repeat step 2.\n4. This creates a cascading structure of interconnected ideas.",
    tooltip: "Visually organize and expand on a central theme using a 3x3 grid structure. Each part can become a new center."
  }
};


export const UI_ICONS = {
  Dashboard: LayoutDashboard,
  Add: PlusCircle, 
  Edit: Edit3,
  Delete: Trash2,
  Save: Save,
  Export: TrendingUp,
  Learn: HelpCircle,
  Info: Info,
  Close: XCircle,
  Task: Briefcase,
  Project: Rocket,
  Goal: Target,
  TeamMember: Users,
  Dependency: Zap,
  Milestone: Award,
  Conflict: MessageSquareWarning,
  Urgent: Zap, 
  Important: ClipboardCheck, 
  Timeline: CalendarClock, 
  View: Eye,
  Success: CheckCircle,
  Warning: AlertTriangle,
  Grid: Grid,
  Sparkles: Sparkles, 
};

export const DEFAULT_DARK_MODE = false;

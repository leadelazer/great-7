
export enum ToolKey {
  EISENHOWER_MATRIX = 'eisenhower-matrix',
  SWOT_ANALYSIS = 'swot-analysis',
  PARETO_CHART = 'pareto-chart',
  DECISION_MATRIX = 'decision-matrix',
  GANTT_CHART = 'gantt-chart',
  SMART_GOALS = 'smart-goals',
  RACI_MATRIX = 'raci-matrix',
  MANDALA_CHART = 'mandala-chart',
  // KJ_METHOD and PRE_MORTEM_ANALYSIS will be added later
}

export interface Tool {
  key: ToolKey;
  name: string;
  description: string;
  icon: React.ElementType; // For Lucide icons
  path: string;
  tagline: string;
}

// Eisenhower Matrix Types
export enum EisenhowerQuadrant {
  DO_NOW = 'Do Now', // Urgent & Important
  SCHEDULE = 'Schedule', // Not Urgent & Important
  DELEGATE = 'Delegate', // Urgent & Not Important
  ELIMINATE = 'Eliminate', // Not Urgent & Not Important
}

export interface EisenhowerTask {
  id: string;
  text: string;
  quadrant: EisenhowerQuadrant;
}

// SWOT Analysis Types
export enum SWOTCategory {
  STRENGTHS = 'Strengths',
  WEAKNESSES = 'Weaknesses',
  OPPORTUNITIES = 'Opportunities',
  THREATS = 'Threats',
}

export interface SWOTItem {
  id: string;
  text: string;
  category: SWOTCategory;
  icon?: string; // e.g., emoji or SVG name
}

// Pareto Chart Types
export interface ParetoTask {
  id: string;
  name: string;
  impactScore: number; // 1-10
}

// Decision Matrix Types
export interface DecisionOption {
  id: string;
  name: string;
  scores: { [criteriaId: string]: number }; // criteriaId -> score (1-10)
}

export interface DecisionCriteria {
  id: string;
  name: string;
  weight: number; // 0-100 (percentage)
}

// Gantt Chart Types
export interface GanttTask {
  id: string;
  name: string;
  startDate: string; // ISO Date string
  endDate: string; // ISO Date string
  dependencies: string[]; // array of task IDs
  color?: string; // Optional color for milestones/status
}

// SMART Goals Types
export interface SMARTGoal {
  id: string;
  mainIdea: string; // Changed from goalStatement
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: string;
  progress: number; // 0-100
}

// RACI Matrix Types
export enum RACIRole {
  RESPONSIBLE = 'R',
  ACCOUNTABLE = 'A',
  CONSULTED = 'C',
  INFORMED = 'I',
}

export interface RACITeamMember {
  id: string;
  name: string;
}

export interface RACITaskAssignment {
  [teamMemberId: string]: RACIRole | undefined;
}
export interface RACITask {
  id: string;
  name: string;
  assignments: RACITaskAssignment;
}

// Mandala Chart Types
export const MANDALA_MAIN_CENTER_ID = 'main_center';
export const MANDALA_GRID_SIZE = 3; // 3x3 grid

export interface MandalaCell {
  id: string; // Unique ID, e.g., "main_center", "main_center_0_0" (for cell at row 0, col 0 of main_center's grid)
  parentId: string | null; // ID of the cell this grid expands from (null for main_center)
  text: string;
  isCenterTopic?: boolean; // Is this cell the central topic of its own 3x3 grid?
  isExpandable?: boolean; // Can this cell be clicked to become a new center?
  gridRow?: number; // Row in its parent's 3x3 grid (0-2)
  gridCol?: number; // Col in its parent's 3x3 grid (0-2)
}

export interface MandalaChartData {
  cells: Record<string, MandalaCell>; // All cells stored flat, identified by their ID
  activeCenterId: string; // ID of the cell currently displayed as the center of the 3x3 grid
}

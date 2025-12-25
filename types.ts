// ============================================
// APP PHASE STATE MACHINE
// ============================================
export enum AppPhase {
  CHAT = 'CHAT',             // Steps 1-3: Brand discovery
  GENERATING = 'GENERATING', // Logo generation in progress
  SELECTION = 'SELECTION',   // 3 options displayed
  DOWNLOADING = 'DOWNLOADING', // Asset generation in progress
  COMPLETE = 'COMPLETE',     // ZIP ready/downloaded
  REVISION = 'REVISION'      // Revision flow active
}

// ============================================
// CHAT TYPES
// ============================================
export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export enum ChatStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  ERROR = 'ERROR',
  COMPLETE = 'COMPLETE'
}

// ============================================
// BRAND STRATEGY (from GPT-4o)
// ============================================
export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface BrandStrategy {
  brandName: string;
  industry: string;
  audience: string;
  tone: 'professional' | 'modern';
  tagline: string;
  colors: BrandColors;
  logoPrompts: {
    A: string;
    B: string;
    C: string;
  };
}

// ============================================
// LOGO OPTIONS (from DALL-E 3)
// ============================================
export type LogoOptionId = 'A' | 'B' | 'C';

export interface LogoOption {
  id: LogoOptionId;
  imageUrl: string;  // data:image/png;base64,...
  prompt: string;
  label?: string;    // e.g., "Abstract Icon", "Lettermark", "Wordmark"
}

// ============================================
// REVISION TYPES
// ============================================
export type RevisionType = 'color' | 'switch';

export interface ColorRevision {
  type: 'color';
  shade: 'lighter' | 'darker';
}

export interface SwitchRevision {
  type: 'switch';
  newOption: LogoOptionId;
}

export type Revision = ColorRevision | SwitchRevision;

// ============================================
// APP STATE
// ============================================
export interface AppState {
  phase: AppPhase;
  chatStep: 1 | 2 | 3 | 4;
  messages: Message[];
  brandStrategy: BrandStrategy | null;
  logoOptions: LogoOption[] | null;
  selectedOption: LogoOptionId | null;
  revisionsUsed: number;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================
export interface ChatRequest {
  messages: Message[];
  sessionId?: string;
}

export interface ChatResponse {
  reply: string;
  step: 1 | 2 | 3 | 4;
  brandStrategy: BrandStrategy | null;
  readyForLogos: boolean;
}

export interface GenerateLogosRequest {
  logoPrompts: {
    A: string;
    B: string;
    C: string;
  };
}

export interface GenerateLogosResponse {
  options: LogoOption[];
}

export interface GenerateAssetsRequest {
  selectedOption: LogoOptionId;
  logoBase64: string;
  brandStrategy: BrandStrategy;
  revision?: Revision | null;
}

// ============================================
// CONSTANTS
// ============================================
export const MAX_FREE_REVISIONS = 1;
export const REVISION_COST_USD = 2;

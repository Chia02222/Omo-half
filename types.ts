export type PointStatus = 'positive' | 'neutral' | 'negative';

export interface Point {
  text: string;
  status: PointStatus;
}

export interface PrivateNote {
  author: string;
  date: string;
  content: string;
}

export interface SmarsEvaluation {
  name: string;
  role: string;
  scores: {
    hr: number;
    tech: number;
    culture: number;
  };
  overallScore: number;
  points: Point[];
}

export type CandidateStatus = 'Pass' | 'Rejected' | 'Pending';

export type StageEvaluation = {
    mark?: number;
    feedback?: string;
};

export type StageMarks = {
    [evaluator: string]: StageEvaluation;
};

export interface Candidate {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  score: number;
  points: Point[];
  stage: 'OMOED' | 'SCREENING' | 'TECHNICAL_TEST' | 'FINAL_INTERVIEW' | 'HIRED' | 'REJECTED';
  stageMarks?: {
    [stageName: string]: StageMarks;
  };
  
  // New fields for Omo-ed stage AI summary
  summaryPoints?: Point[];
  percentileScore?: string; // e.g. "Top 5%"

  // New fields for All Candidates Page
  appliedRole: string; // The role they actually applied for
  phone?: string;
  email?: string;
  country?: string;
  status?: 'ACTIVE' | 'REJECTED' | 'HIRED' | 'WITHDRAWN';


  // Fields for Candidate Detail Page
  matchPercentage?: number;
  yearsExperience?: number;
  appliedDate?: string;
  appliedVia?: string;
  personalInfo?: {
    gender?: string;
    dob?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  languages?: { name: string; proficiency: string }[];
  interests?: string[];
  overview?: string;
  experience?: {
    company: string;
    logoUrl: string;
    title: string;
    period: string;
    description: string[];
  }[];
  education?: {
    institution: string;
    degree: string;
    period: string;
  }[];
  skills?: string[];
  certifications?: {
    name: string;
    issuingBody?: string;
  }[];
  scoreDetails?: {
    overall: number; // as percentage
    applicationCompleteness: { current: number; max: number };
    skillsMatch: { current: number; max: number };
    culturalFit: { current: number; max: number };
  };
  upcomingSchedule?: {
    title: string;
    dateTime: string;
    platform: string;
    participants: { name: string; role: string; avatarUrl: string }[];
  };
  jobApplied?: {
    title: string;
    type: string[];
    level: string;
    experience: string;
    salary: string;
  };
  attachments?: {
    type: 'Resume' | 'Portfolio';
    fileName: string;
  }[];
  privateNotes?: PrivateNote[];
}


export interface HiringStage {
  title: string;
  candidates: Candidate[];
}

export interface Job {
  id: string;
  title: string;
  department: string;
  status: 'ACTIVE' | 'INACTIVE' | 'CLOSED' | 'DRAFT';
  level: string;
  experience: string;
  employmentType: string;
  workType: string;
  salary: string;
  applicantCount: number;
  latestUpdate: string;
  createdAt: string;
  location: string;
  deadline: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  candidates: Candidate[];
}
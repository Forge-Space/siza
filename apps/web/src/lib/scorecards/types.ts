export interface ProjectScorecard {
  id: string;
  project_id: string;
  overall_score: number;
  security_score: number;
  quality_score: number;
  performance_score: number;
  compliance_score: number;
  breakdowns: Record<string, Record<string, number>>;
  violations: string[];
  recommendations: string[];
  created_at: string;
}

export interface ScorecardHistoryParams {
  projectId: string;
  limit?: number;
}

export type ScoreLevel = 'excellent' | 'good' | 'needs-work' | 'critical';

export function getScoreLevel(score: number): ScoreLevel {
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'needs-work';
  return 'critical';
}

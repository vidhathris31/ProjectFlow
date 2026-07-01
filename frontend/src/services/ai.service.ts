import api from './api';
import { ApiResponse } from '../types';

export interface AIResultResponse {
  result: string;
}

export type ReportType =
  | 'Project Status Report'
  | 'Sprint Summary'
  | 'Weekly Progress Report'
  | 'Risk Analysis Report'
  | 'Team Productivity Report'
  | 'Executive Summary';

/**
 * All AI Assistant calls are proxied through the backend, which securely
 * holds the Gemini API key. The frontend never talks to Gemini directly.
 */
export const aiService = {
  analyzeProject: async (context: string): Promise<string> => {
    const response = await api.post<ApiResponse<AIResultResponse>>('/ai/analyst', { context });
    return response.data.data!.result;
  },

  reviewCode: async (code: string, language?: string): Promise<string> => {
    const response = await api.post<ApiResponse<AIResultResponse>>('/ai/code-review', {
      code,
      language,
    });
    return response.data.data!.result;
  },

  analyzeBurndown: async (context: string): Promise<string> => {
    const response = await api.post<ApiResponse<AIResultResponse>>('/ai/burndown', { context });
    return response.data.data!.result;
  },

  generateSprintPlan: async (
    goals: string,
    teamSize?: number,
    sprintLength?: number
  ): Promise<string> => {
    const response = await api.post<ApiResponse<AIResultResponse>>('/ai/sprint-planner', {
      goals,
      teamSize,
      sprintLength,
    });
    return response.data.data!.result;
  },

  scanTechDebt: async (context: string): Promise<string> => {
    const response = await api.post<ApiResponse<AIResultResponse>>('/ai/tech-debt', { context });
    return response.data.data!.result;
  },

  generateReport: async (reportType: ReportType, context: string): Promise<string> => {
    const response = await api.post<ApiResponse<AIResultResponse>>('/ai/report', {
      reportType,
      context,
    });
    return response.data.data!.result;
  },
};

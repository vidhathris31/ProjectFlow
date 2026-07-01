import { Request, Response } from 'express';
import { generateAIContent } from '../services/gemini.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

/**
 * AI Assistant Controller
 * ────────────────────────────────────────────────────────────────
 * All handlers proxy structured prompts to Gemini via gemini.service.
 * They are purely additive — no existing business logic, models, or
 * routes are touched. Every endpoint requires authentication (enforced
 * in ai.routes.ts) and never trusts the client for the API key.
 */

const BASE_PERSONA =
  'You are the AI Assistant embedded inside "ProjectFlow", a professional project management ' +
  'system. You write clear, concise, well-structured, and actionable responses using short ' +
  'headings and bullet points where helpful. Avoid unnecessary preamble. Respond in plain text ' +
  'with light markdown-style formatting (headings with "##", bullet points with "-", bold with "**").';

/**
 * POST /api/ai/analyst
 * Analyzes overall project health, bottlenecks, risks, and productivity.
 */
export const runAIAnalyst = async (req: Request, res: Response): Promise<void> => {
  const { context } = req.body as { context?: string };

  if (!context || !context.trim()) {
    sendError(res, 'Project context is required for analysis.', 400);
    return;
  }

  const systemInstruction =
    `${BASE_PERSONA}\n\nYou act as an expert AI Project Analyst. Given a summary of a project ` +
    `(tasks, statuses, deadlines, team workload), you must:\n` +
    `1. Assess overall project health (On Track / At Risk / Critical) with a one-line justification.\n` +
    `2. Identify bottlenecks (e.g. overloaded members, stalled tasks, dependency chains).\n` +
    `3. Detect high-risk tasks (overdue, blocked, or close to deadline with no progress).\n` +
    `4. Suggest concrete productivity improvements.\n` +
    `5. Provide 2-3 key insights a project manager should act on this week.`;

  const userPrompt = `Here is the current project data:\n\n${context}\n\nProvide the full analysis.`;

  const result = await generateAIContent(systemInstruction, userPrompt, { maxOutputTokens: 2048 });
  sendSuccess(res, 'Project analysis generated successfully', { result });
};

/**
 * POST /api/ai/code-review
 * Reviews pasted code for bugs, code smells, and best practices.
 */
export const runCodeReview = async (req: Request, res: Response): Promise<void> => {
  const { code, language } = req.body as { code?: string; language?: string };

  if (!code || !code.trim()) {
    sendError(res, 'Code is required for review.', 400);
    return;
  }

  const systemInstruction =
    `${BASE_PERSONA}\n\nYou act as a senior software engineer performing a thorough code review. ` +
    `For the given code snippet:\n` +
    `1. List any bugs or correctness issues (be specific, reference line context).\n` +
    `2. Point out code smells and anti-patterns.\n` +
    `3. Suggest concrete improvements and best practices.\n` +
    `4. Explain the reasoning behind each recommendation clearly and briefly.\n` +
    `5. End with an overall quality rating out of 10.`;

  const userPrompt = `Language: ${language || 'auto-detect'}\n\nCode to review:\n\n\`\`\`\n${code}\n\`\`\``;

  const result = await generateAIContent(systemInstruction, userPrompt, { maxOutputTokens: 2048 });
  sendSuccess(res, 'Code review generated successfully', { result });
};

/**
 * POST /api/ai/burndown
 * Analyzes sprint progress and predicts completion.
 */
export const runBurndownAI = async (req: Request, res: Response): Promise<void> => {
  const { context } = req.body as { context?: string };

  if (!context || !context.trim()) {
    sendError(res, 'Sprint data is required for burndown analysis.', 400);
    return;
  }

  const systemInstruction =
    `${BASE_PERSONA}\n\nYou act as an Agile coach analyzing sprint burndown data. Given the sprint's ` +
    `tasks, story points/effort, and progress, you must:\n` +
    `1. Summarize current sprint progress vs. the ideal burndown trend.\n` +
    `2. Predict whether the sprint will complete on time (with a rough confidence %).\n` +
    `3. Highlight delayed or at-risk work items.\n` +
    `4. Suggest a concrete recovery plan if the sprint is behind.\n` +
    `5. Provide 2-3 burndown insights for the team retro.`;

  const userPrompt = `Here is the current sprint data:\n\n${context}\n\nProvide the full burndown analysis.`;

  const result = await generateAIContent(systemInstruction, userPrompt, { maxOutputTokens: 2048 });
  sendSuccess(res, 'Burndown analysis generated successfully', { result });
};

/**
 * POST /api/ai/sprint-planner
 * Generates a sprint plan from project goals.
 */
export const runSprintPlanner = async (req: Request, res: Response): Promise<void> => {
  const { goals, teamSize, sprintLength } = req.body as {
    goals?: string;
    teamSize?: number;
    sprintLength?: number;
  };

  if (!goals || !goals.trim()) {
    sendError(res, 'Project goals are required to generate a sprint plan.', 400);
    return;
  }

  const systemInstruction =
    `${BASE_PERSONA}\n\nYou act as an expert Scrum Master creating a sprint plan. Given the project ` +
    `goals, team size, and sprint length, you must:\n` +
    `1. Break the goals down into a clear task list (grouped by theme/epic if relevant).\n` +
    `2. Estimate rough effort per task (story points or hours).\n` +
    `3. Assign a priority (High/Medium/Low) to each task.\n` +
    `4. Propose a suggested sprint timeline / day-by-day cadence.\n` +
    `5. Flag any risks or dependencies to watch for.`;

  const userPrompt =
    `Project goals:\n${goals}\n\n` +
    `Team size: ${teamSize || 'not specified'}\n` +
    `Sprint length: ${sprintLength ? `${sprintLength} days` : 'not specified (assume 2 weeks)'}\n\n` +
    `Generate the full sprint plan.`;

  const result = await generateAIContent(systemInstruction, userPrompt, { maxOutputTokens: 2048 });
  sendSuccess(res, 'Sprint plan generated successfully', { result });
};

/**
 * POST /api/ai/tech-debt
 * Analyzes technical debt and recommends refactoring priorities.
 */
export const runTechDebtScanner = async (req: Request, res: Response): Promise<void> => {
  const { context } = req.body as { context?: string };

  if (!context || !context.trim()) {
    sendError(res, 'Codebase or project description is required to scan for tech debt.', 400);
    return;
  }

  const systemInstruction =
    `${BASE_PERSONA}\n\nYou act as a principal engineer performing a technical debt assessment. Given ` +
    `a description of the codebase, architecture, or pasted code, you must:\n` +
    `1. Identify areas of technical debt (outdated dependencies, risky patterns, missing tests, etc.).\n` +
    `2. Flag outdated or risky areas specifically.\n` +
    `3. Recommend refactoring priorities, ranked High/Medium/Low.\n` +
    `4. Suggest maintainability improvements (testing, documentation, tooling).\n` +
    `5. Provide an overall tech-debt risk score out of 10.`;

  const userPrompt = `Here is the codebase/project description:\n\n${context}\n\nProvide the full tech debt assessment.`;

  const result = await generateAIContent(systemInstruction, userPrompt, { maxOutputTokens: 2048 });
  sendSuccess(res, 'Tech debt scan generated successfully', { result });
};

const REPORT_TYPES = [
  'Project Status Report',
  'Sprint Summary',
  'Weekly Progress Report',
  'Risk Analysis Report',
  'Team Productivity Report',
  'Executive Summary',
] as const;

/**
 * POST /api/ai/report
 * Generates a professional report of a given type from project context.
 */
export const runReportGenerator = async (req: Request, res: Response): Promise<void> => {
  const { reportType, context } = req.body as { reportType?: string; context?: string };

  if (!reportType || !REPORT_TYPES.includes(reportType as any)) {
    sendError(res, `reportType must be one of: ${REPORT_TYPES.join(', ')}`, 400);
    return;
  }

  if (!context || !context.trim()) {
    sendError(res, 'Project context is required to generate a report.', 400);
    return;
  }

  const systemInstruction =
    `${BASE_PERSONA}\n\nYou act as a professional project reporting assistant. Generate a polished, ` +
    `well-formatted "${reportType}" suitable for sharing with stakeholders. Use clear section headings, ` +
    `concise language, and highlight the most important numbers and risks. Keep it professional and ` +
    `readable in under ~500 words unless the data genuinely requires more detail.`;

  const userPrompt = `Project data to base the report on:\n\n${context}\n\nGenerate the "${reportType}" now.`;

  const result = await generateAIContent(systemInstruction, userPrompt, { maxOutputTokens: 2560 });
  sendSuccess(res, `${reportType} generated successfully`, { result });
};

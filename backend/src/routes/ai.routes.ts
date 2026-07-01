import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  runAIAnalyst,
  runCodeReview,
  runBurndownAI,
  runSprintPlanner,
  runTechDebtScanner,
  runReportGenerator,
} from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// AI calls are more expensive than regular CRUD — apply a dedicated, slightly
// stricter rate limit on top of the global one so a single user can't exhaust quota.
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many AI requests. Please wait a few minutes and try again.',
  },
});

router.use(authenticate, aiLimiter);

router.post('/analyst', runAIAnalyst);
router.post('/code-review', runCodeReview);
router.post('/burndown', runBurndownAI);
router.post('/sprint-planner', runSprintPlanner);
router.post('/tech-debt', runTechDebtScanner);
router.post('/report', runReportGenerator);

export default router;

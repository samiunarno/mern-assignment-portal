import { Router } from 'express';
import authRouter from './auth.routes';
import userRouter from './user.routes';
import assignmentRouter from './assignment.routes';
import statsRouter from './stats.routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/assignments', assignmentRouter);
router.use('/stats', statsRouter);

export default router;
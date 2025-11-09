import { Router } from 'express';
import {
  createAssignment,
  getAllAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getAssignmentSubmissions,
  getStudentSubmissions,
  sendDeadlineReminders,
  emailAndPurgeAssignment,
  deleteManyAssignments,
  downloadAssignmentAttachment,
  downloadSubmission,
} from '../controllers/assignment.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { UserRole } from '../models/user.model';
import { upload, assignmentUpload } from '../middleware/upload.middleware';
import { validate } from '../middleware/validation.middleware';
import { createAssignmentSchema, updateAssignmentSchema, downloadSubmissionsSchema, bulkDeleteAssignmentSchema } from '../validators/assignment.validator';

const router = Router();

// All routes are protected
router.use(protect);

// Monitor routes for assignment management
router
  .route('/')
  .post(restrictTo(UserRole.Admin, UserRole.Monitor), assignmentUpload.single('attachment'), validate(createAssignmentSchema), createAssignment)
  .get(getAllAssignments);

router.post('/bulk-delete', restrictTo(UserRole.Admin, UserRole.Monitor), validate(bulkDeleteAssignmentSchema), deleteManyAssignments);

router
  .route('/:id')
  .get(getAssignmentById)
  .patch(restrictTo(UserRole.Admin, UserRole.Monitor), assignmentUpload.single('attachment'), validate(updateAssignmentSchema), updateAssignment)
  .delete(restrictTo(UserRole.Admin, UserRole.Monitor), deleteAssignment);

router.get('/:id/attachment', downloadAssignmentAttachment);
  
// Student submission route
router.post('/:id/submit', restrictTo(UserRole.Student), upload.single('submission'), submitAssignment);

// Monitor routes for viewing and downloading submissions
router.get('/:id/submissions', restrictTo(UserRole.Admin, UserRole.Monitor), getAssignmentSubmissions);
router.post('/:id/reminders', restrictTo(UserRole.Admin, UserRole.Monitor), sendDeadlineReminders);
router.post('/:id/email-and-purge', restrictTo(UserRole.Admin, UserRole.Monitor), validate(downloadSubmissionsSchema), emailAndPurgeAssignment);

// Student route to see their own submissions
router.get('/submissions/me', restrictTo(UserRole.Student), getStudentSubmissions);
router.get('/submissions/:submissionId/download', downloadSubmission);


export default router;
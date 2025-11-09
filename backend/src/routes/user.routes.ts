import { Router } from 'express';
import { getAllUsers, approveUser, updateUserRole, deleteUser, updatePassword, createUser, resetPortal } from '../controllers/user.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { UserRole } from '../models/user.model';
import { validate } from '../middleware/validation.middleware';
import { updateUserRoleSchema, updatePasswordSchema, createUserSchema } from '../validators/user.validator';

const router = Router();

// All routes in this file are protected and require a logged-in user
router.use(protect);

// This route is for the currently logged-in user to change their own password
router.patch('/update-password', validate(updatePasswordSchema), updatePassword);


// All routes below are restricted to Admins only
router.use(restrictTo(UserRole.Admin));

router
  .route('/')
  .get(getAllUsers)
  .post(validate(createUserSchema), createUser);
  
router.post('/reset-portal', resetPortal);

router.patch('/:id/approve', approveUser);
router.patch('/:id/role', validate(updateUserRoleSchema), updateUserRole);
router.delete('/:id', deleteUser);


export default router;


import { Request, Response, NextFunction } from 'express';
import User, { UserRole } from '../models/user.model';
import Submission from '../models/submission.model';
import Assignment from '../models/assignment.model';
import { AppError } from '../utils/AppError';

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find();
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userCount = await User.countDocuments();
    if (userCount >= 16) {
      return next(new AppError('User limit reached. Cannot create new users.', 403));
    }
    
    const { name, email, password, role } = req.body;
    
    const newUser = await User.create({
      name,
      email,
      password,
      role,
      approved: true, // Directly created by admin, so pre-approved
    });
    
    // Don't send password back in the response
    newUser.password = undefined;

    res.status(201).json({
      status: 'success',
      data: {
        user: newUser,
      },
    });
  } catch (error: any) {
     if (error.code === 11000) {
      return next(new AppError('An account with this email already exists.', 400));
    }
    next(error);
  }
};

export const approveUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true, runValidators: true }
    );

    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return next(new AppError('No user found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1) Get user from collection, ensuring password is included
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
        return next(new AppError('User not found.', 404));
    }
    
    // 2) Check if posted current password is correct
    if (!(await user.comparePassword(req.body.currentPassword))) {
      return next(new AppError('Your current password is wrong.', 401));
    }

    // 3) If so, update password
    user.password = req.body.newPassword;
    await user.save();
    
    // 4) Send success response. A new token could be sent here to invalidate old sessions,
    // but for now, a success message is sufficient.
    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);

        if (!user) {
            return next(new AppError('No user found with that ID', 404));
        }
        
        if (user.role === UserRole.Admin) {
            return next(new AppError('Admins cannot be deleted.', 403));
        }

        // If user is a student, delete their submissions from the database
        if (user.role === UserRole.Student) {
            await Submission.deleteMany({ studentId: userId });
        }

        // Finally, delete the user
        await User.findByIdAndDelete(userId);

        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (error) {
        next(error);
    }
};

export const resetPortal = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const assignmentDeletions = await Assignment.deleteMany({});
        const submissionDeletions = await Submission.deleteMany({});
        
        res.status(200).json({
            status: 'success',
            message: `Portal reset successfully. ${assignmentDeletions.deletedCount} assignments and ${submissionDeletions.deletedCount} submissions were deleted.`,
        });
    } catch (error) {
        next(error);
    }
};
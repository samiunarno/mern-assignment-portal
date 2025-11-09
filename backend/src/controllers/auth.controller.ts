

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/user.model';
import { AppError } from '../utils/AppError';

const signToken = (id: string) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES;
  if (!secret || !expiresIn) {
    throw new AppError('JWT secret or expiration not defined in environment variables.', 500);
  }
  
  return jwt.sign({ id }, secret, { expiresIn });
};

const createSendToken = (user: IUser, statusCode: number, res: Response) => {
  const token = signToken(user._id.toString());

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userCount = await User.countDocuments();
    if (userCount >= 16) {
      return next(new AppError('User limit reached. Cannot register new users.', 403));
    }
    
    const { name, email, password } = req.body;
    
    const newUser = await User.create({
      name,
      email,
      password,
    });
    
    // Do not send token, user must be approved first
    res.status(201).json({
      status: 'success',
      message: 'Registration successful! Please wait for an administrator to approve your account.',
      data: {
        user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            approved: newUser.approved
        }
      }
    });
  } catch (error: any) {
     if (error.code === 11000) {
      return next(new AppError('An account with this email already exists.', 400));
    }
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    if (!user.approved) {
        return next(new AppError('Your account has not been approved by an administrator yet.', 403));
    }
    
    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

export const getMe = (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        status: 'success',
        data: {
            user: req.user
        }
    });
};
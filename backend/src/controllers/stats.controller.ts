

import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';
import Assignment from '../models/assignment.model';
import Submission from '../models/submission.model';

export const getAdminStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const [totalUsers, pendingUsers, assignmentsCount, submissionsCount] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ approved: false }),
            Assignment.countDocuments(),
            Submission.countDocuments(),
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                totalUsers,
                pendingUsers,
                assignmentsCount,
                submissionsCount,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getMonitorStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const monitorId = req.user._id;

        const [assignmentsCreated, totalSubmissions, pendingAssignments] = await Promise.all([
            Assignment.countDocuments({ createdBy: monitorId }),
            Submission.countDocuments({ 
                assignmentId: { $in: await Assignment.find({ createdBy: monitorId }).distinct('_id') }
            }),
            Assignment.countDocuments({ createdBy: monitorId, deadline: { $gt: new Date() } }),
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                assignmentsCreated,
                totalSubmissions,
                pendingAssignments,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getStudentStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const studentId = req.user._id;

        const [assignmentsAvailable, assignmentsSubmitted, nextUpcomingAssignment] = await Promise.all([
            Assignment.countDocuments(),
            Submission.countDocuments({ studentId }),
            Assignment.findOne({ deadline: { $gt: new Date() } }).sort('deadline'),
        ]);
        
        const assignmentsPending = assignmentsAvailable - assignmentsSubmitted;

        res.status(200).json({
            status: 'success',
            data: {
                assignmentsAvailable,
                assignmentsSubmitted,
                assignmentsPending,
                nextDeadline: nextUpcomingAssignment ? nextUpcomingAssignment.deadline : null,
            },
        });
    } catch (error) {
        next(error);
    }
};
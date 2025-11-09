

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import archiver from 'archiver';
import Assignment, { IAssignment } from '../models/assignment.model';
import Submission from '../models/submission.model';
import User, { IUser, UserRole } from '../models/user.model';
import { AppError } from '../utils/AppError';
import { sendEmail } from '../utils/email';

// For Monitors/Admins to manage assignments
export const createAssignment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignmentData: Partial<IAssignment> = {
      ...req.body,
      createdBy: req.user._id,
    };
    
    if (req.file) {
      assignmentData.attachmentFilename = req.file.originalname;
      assignmentData.attachmentMimeType = req.file.mimetype;
      assignmentData.attachmentContent = req.file.buffer;
    }
    
    const newAssignment = await Assignment.create(assignmentData);
    
    // Send email notifications to all students (fire-and-forget)
    User.find({ role: UserRole.Student }).then(students => {
      students.forEach(student => {
        sendEmail({
            to: student.email,
            subject: `New Assignment Posted: ${newAssignment.title}`,
            text: `Hello ${student.name},\n\nA new assignment "${newAssignment.title}" has been posted.\n\nThe deadline is ${new Date(newAssignment.deadline).toLocaleString()}.\n\nPlease log in to the portal to view the details.\n\nBest regards,\nAssignment Portal`
        }).catch(err => console.error(`Failed to send email to ${student.email}`, err));
      });
    });

    res.status(201).json({
      status: 'success',
      data: {
        assignment: newAssignment,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAssignments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignments = await Assignment.find().sort('-deadline');
    res.status(200).json({
      status: 'success',
      results: assignments.length,
      data: {
        assignments,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAssignmentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) {
            return next(new AppError('No assignment found with that ID', 404));
        }
        res.status(200).json({
            status: 'success',
            data: {
                assignment,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const updateAssignment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const updateData: any = { ...req.body };
        if (req.file) {
          updateData.attachmentFilename = req.file.originalname;
          updateData.attachmentMimeType = req.file.mimetype;
          updateData.attachmentContent = req.file.buffer;
        }

        const assignment = await Assignment.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });
        if (!assignment) {
            return next(new AppError('No assignment found with that ID', 404));
        }
        res.status(200).json({
            status: 'success',
            data: {
                assignment,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const deleteAssignment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const assignmentId = req.params.id;
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return next(new AppError('No assignment found with that ID', 404));
        }

        // Delete submissions from DB
        await Submission.deleteMany({ assignmentId: assignmentId });

        // Delete the assignment itself
        await Assignment.findByIdAndDelete(assignmentId);

        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteManyAssignments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { ids } = req.body;

        // 1. Delete associated submissions
        await Submission.deleteMany({ assignmentId: { $in: ids } });

        // 2. Delete the assignments
        await Assignment.deleteMany({ _id: { $in: ids } });

        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (error) {
        next(error);
    }
};

// For Students to submit
export const submitAssignment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignmentId = req.params.id;
    const studentId = req.user.id;

    if (!req.file) {
      return next(new AppError('Please upload a file.', 400));
    }
    
    // 1. Check if assignment exists and deadline has not passed
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return next(new AppError('No assignment found with that ID', 404));
    }
    if (new Date() > new Date(assignment.deadline)) {
      return next(new AppError('The deadline for this assignment has passed.', 403));
    }
    
    // 2. Check if user has already submitted
    const existingSubmission = await Submission.findOne({ assignmentId, studentId });
    if (existingSubmission) {
      return next(new AppError('You have already submitted for this assignment.', 400));
    }

    // 3. Send email with submission as attachment
    const emailInfo = await sendEmail({
        to: process.env.EMAIL_TO!,
        subject: `New Submission for "${assignment.title}" by ${req.user.name}`,
        text: `Student: ${req.user.name} (${req.user.email})\nAssignment: ${assignment.title}\nSubmitted at: ${new Date().toLocaleString()}`,
        attachments: [{
            filename: req.file.originalname,
            content: req.file.buffer,
            contentType: 'application/pdf'
        }]
    });
    
    // 4. Create submission metadata in DB
    const newSubmission = await Submission.create({
      assignmentId,
      studentId,
      filename: req.file.originalname,
      emailMessageId: emailInfo.messageId,
      uploadedAt: new Date(),
      fileContent: req.file.buffer,
      contentType: req.file.mimetype,
    });

    res.status(201).json({
      status: 'success',
      data: {
        submission: newSubmission,
      },
    });
  } catch (error) {
    next(error);
  }
};

// For Monitors/Admins to view submissions
export const getAssignmentSubmissions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const submissions = await Submission.find({ assignmentId: req.params.id }).populate({
        path: 'studentId',
        select: 'name'
    });
    res.status(200).json({
      status: 'success',
      results: submissions.length,
      data: {
        submissions: submissions.map(sub => {
          const student = sub.studentId as (IUser | mongoose.Types.ObjectId | null);
          const isPopulated = student && 'name' in student;

          return {
              id: sub._id,
              assignmentId: sub.assignmentId,
              studentId: isPopulated ? (student as IUser)._id : student,
              studentName: isPopulated ? (student as IUser).name : 'Deleted Student',
              filename: sub.filename,
              uploadedAt: sub.uploadedAt,
          }
        })
      },
    });
  } catch (error) {
    next(error);
  }
};

// For Students to view their own submissions
export const getStudentSubmissions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const submissions = await Submission.find({ studentId: req.user.id });
        res.status(200).json({
            status: 'success',
            results: submissions.length,
            data: {
                submissions
            }
        });
    } catch (error) {
        next(error);
    }
};

// For Monitors/Admins to send deadline reminders
export const sendDeadlineReminders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const assignmentId = req.params.id;
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return next(new AppError('No assignment found with that ID', 404));
        }

        if (new Date() > new Date(assignment.deadline)) {
            return next(new AppError('The deadline for this assignment has already passed.', 400));
        }

        const submissions = await Submission.find({ assignmentId }).select('studentId');
        const submittedStudentIds = submissions.map(s => s.studentId.toString());

        const studentsToRemind = await User.find({
            role: UserRole.Student,
            _id: { $nin: submittedStudentIds }
        });

        if (studentsToRemind.length === 0) {
            return res.status(200).json({
                status: 'success',
                message: 'All students have submitted for this assignment. No reminders sent.'
            });
        }
        
        studentsToRemind.forEach(student => {
            sendEmail({
                to: student.email,
                subject: `Reminder: Assignment "${assignment.title}" is due soon`,
                text: `Hello ${student.name},\n\nThis is a reminder that the assignment "${assignment.title}" is due on ${new Date(assignment.deadline).toLocaleString()}.\n\nPlease log in to the portal to submit your work.\n\nBest regards,\nAssignment Portal`
            }).catch(err => console.error(`Failed to send reminder to ${student.email}`, err));
        });

        res.status(200).json({
            status: 'success',
            message: `Deadline reminders sent to ${studentsToRemind.length} student(s).`
        });

    } catch (error) {
        next(error);
    }
};

// For Monitors/Admins to download all submissions and delete the assignment
export const emailAndPurgeAssignment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const assignmentId = req.params.id;
        const { email } = req.body;

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return next(new AppError('No assignment found with that ID', 404));
        }

        const submissions = await Submission.find({ assignmentId }).select('+fileContent');

        if (submissions.length === 0) {
            await Assignment.findByIdAndDelete(assignmentId);
            return res.status(200).json({
                status: 'success',
                message: 'No submissions found. Assignment has been deleted.'
            });
        }

        // Fire-and-forget zipping/emailing/purging
        (async () => {
            try {
                const archive = archiver('zip', { zlib: { level: 9 } });
                const buffers: Buffer[] = [];
                archive.on('data', (buffer: Buffer) => buffers.push(buffer));
                
                const archivePromise = new Promise<void>((resolve, reject) => {
                    archive.on('end', () => resolve());
                    archive.on('error', (err: any) => reject(err));
                });
                
                for (const sub of submissions) {
                    archive.append(sub.fileContent, { name: sub.filename });
                }
                
                await archive.finalize();
                await archivePromise;

                const zipBuffer = Buffer.concat(buffers);
                
                await sendEmail({
                    to: email,
                    subject: `All Submissions for "${assignment.title}"`,
                    text: `Attached is a ZIP file containing all ${submissions.length} submissions for the assignment: "${assignment.title}".\n\nThis assignment and all its submission data have now been purged from the portal.`,
                    attachments: [{
                        filename: `${assignment.title.replace(/\s/g, '_')}_submissions.zip`,
                        content: zipBuffer,
                        contentType: 'application/zip'
                    }]
                });
                
                // Purge data from DB
                await Submission.deleteMany({ assignmentId: assignmentId });
                await Assignment.findByIdAndDelete(assignmentId);

                console.log(`Successfully purged and emailed submissions for assignment ${assignmentId}`);
            } catch (err) {
                 console.error(`Error during background email/purge for assignment ${assignmentId}:`, err);
            }
        })();

        res.status(200).json({
            status: 'success',
            message: `The process to email and purge ${submissions.length} submissions has started. You will receive an email at ${email} shortly.`
        });

    } catch (error) {
        next(error);
    }
};

export const downloadAssignmentAttachment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const assignment = await Assignment.findById(req.params.id).select('+attachmentContent');
        if (!assignment || !assignment.attachmentContent) {
            return next(new AppError('No attachment found for this assignment.', 404));
        }

        res.setHeader('Content-Type', assignment.attachmentMimeType || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${assignment.attachmentFilename}"`);
        res.send(assignment.attachmentContent);
    } catch (error) {
        next(error);
    }
};

export const downloadSubmission = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { submissionId } = req.params;
        const user = req.user;

        const submission = await Submission.findById(submissionId).select('+fileContent');
        if (!submission) {
            return next(new AppError('Submission not found.', 404));
        }

        // Security check: Only the student who submitted it or a monitor/admin can download
        const isOwner = submission.studentId.equals(user._id);
        const isPrivileged = user.role === UserRole.Admin || user.role === UserRole.Monitor;

        if (!isOwner && !isPrivileged) {
            return next(new AppError('You do not have permission to download this file.', 403));
        }
        
        if (!submission.fileContent) {
             return next(new AppError('File content is missing for this submission.', 404));
        }

        res.setHeader('Content-Type', submission.contentType || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${submission.filename}"`);
        res.send(submission.fileContent);

    } catch (error) {
        next(error);
    }
};
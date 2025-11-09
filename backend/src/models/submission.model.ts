// FIX: Add reference to Node.js types to resolve issues with global types like Buffer.
/// <reference types="node" />

import mongoose, { Schema, Document } from 'mongoose';

export interface ISubmission extends Document {
  _id: mongoose.Types.ObjectId;
  assignmentId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  filename: string;
  emailMessageId: string;
  uploadedAt: Date;
  fileContent: Buffer;
  contentType: string;
}

const submissionSchema: Schema = new Schema({
  assignmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true,
    index: true,
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  filename: {
    type: String,
    required: true,
    trim: true,
  },
  emailMessageId: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  fileContent: {
    type: Buffer,
    required: true,
    select: false, // Don't return this large field by default
  },
  contentType: {
    type: String,
    required: true,
  },
});

// Ensure a student can only submit once per assignment
submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

const Submission = mongoose.model<ISubmission>('Submission', submissionSchema);

export default Submission;
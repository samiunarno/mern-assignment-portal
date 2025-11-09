

import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignment extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  deadline: Date;
  createdBy: mongoose.Types.ObjectId;
  attachmentFilename?: string;
  attachmentMimeType?: string;
  attachmentContent?: Buffer;
}

const assignmentSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'An assignment must have a title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'An assignment must have a description'],
    trim: true,
  },
  deadline: {
    type: Date,
    required: [true, 'An assignment must have a deadline'],
    index: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'An assignment must have a creator'],
    index: true,
  },
  attachmentFilename: {
    type: String,
    trim: true,
  },
  attachmentMimeType: {
    type: String,
  },
  attachmentContent: {
    type: Buffer,
    select: false, // Don't return this large field by default
  },
}, {
  timestamps: true,
});

const Assignment = mongoose.model<IAssignment>('Assignment', assignmentSchema);

export default Assignment;
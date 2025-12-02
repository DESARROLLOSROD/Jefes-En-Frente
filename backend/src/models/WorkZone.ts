import { Schema, model, Document } from 'mongoose';
import { Section, WorkZone as IWorkZone } from '../types/workZone.types.js';

export interface IWorkZoneDocument extends Document {
  projectId: string;
  name: string;
  description?: string;
  sections: Section[];
  status: 'active' | 'inactive' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const sectionSchema = new Schema<Section>({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const workZoneSchema = new Schema<IWorkZoneDocument>({
  projectId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  sections: {
    type: [sectionSchema],
    default: []
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'completed'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para actualizar updatedAt
workZoneSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default model<IWorkZoneDocument>('WorkZone', workZoneSchema);

// src/schemas/student-test-override.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type StudentTestOverrideDocument = StudentTestOverride & Document;

@Schema({
  timestamps: true,
  collection: 'studenttestoverrides',
})
export class StudentTestOverride {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Test', required: true })
  testId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true })
  organizationId: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  extraAttempts: number;

  @Prop({ trim: true })
  reason?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  grantedBy: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  grantedAt: Date;

  @Prop({ type: Date, default: null })
  expiresAt?: Date | null;
}

export const StudentTestOverrideSchema = SchemaFactory.createForClass(StudentTestOverride);

// Compound unique index - one override per user per test
StudentTestOverrideSchema.index({ userId: 1, testId: 1 }, { unique: true });
StudentTestOverrideSchema.index({ organizationId: 1 });
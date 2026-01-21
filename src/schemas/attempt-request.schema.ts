// src/schemas/attempt-request.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type AttemptRequestDocument = AttemptRequest & Document;

@Schema({
  timestamps: true,
  collection: 'attemptrequests',
})
export class AttemptRequest {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Test', required: true })
  testId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true })
  organizationId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 10 })
  requestedAttempts: number;

  @Prop({ required: true, trim: true, maxlength: 500 })
  reason: string;

  @Prop({
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  reviewedBy?: Types.ObjectId;

  @Prop({ type: Date })
  reviewedAt?: Date;

  @Prop({ trim: true, maxlength: 500 })
  reviewNotes?: string;

  @Prop({ unique: true })
  requestHash: string;

  // Virtual fields from timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

export const AttemptRequestSchema = SchemaFactory.createForClass(AttemptRequest);

// Indexes
AttemptRequestSchema.index({ userId: 1, testId: 1 });
AttemptRequestSchema.index({ status: 1, organizationId: 1 });
AttemptRequestSchema.index({ reviewedBy: 1 });

// Generate unique hash to prevent duplicate requests
AttemptRequestSchema.pre('save', function () {
  if (this.isNew) {
    this.requestHash = `${this.userId}-${this.testId}-${Date.now()}`;
  }
});
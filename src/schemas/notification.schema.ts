// src/schemas/notification.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({
  timestamps: true,
  collection: 'notifications',
})
export class Notification {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  recipientId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  senderId?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true })
  organizationId: Types.ObjectId;

  @Prop({
    type: String,
    enum: [
      'attempt_request_submitted',
      'attempt_request_approved',
      'attempt_request_rejected',
      'attempt_request_pending_review',
      'attempts_granted_directly',
      'system_notification',
      'test_related',
    ],
    required: true,
  })
  type: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({
    type: String,
    enum: ['AttemptRequest', 'Test', 'TestSession', 'StudentTestOverride'],
  })
  relatedModel?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  relatedId?: Types.ObjectId;

  @Prop()
  actionUrl?: string;

  @Prop()
  actionText?: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: Date })
  readAt?: Date;

  // Virtual fields from timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Indexes
NotificationSchema.index({ recipientId: 1, isRead: 1 });
NotificationSchema.index({ organizationId: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ createdAt: -1 });
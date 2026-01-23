import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrganizationDocument = Organization & Document;

@Schema({
  timestamps: true,
  collection: 'organizations',
})
export class Organization {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: false })
  isSuperOrg: boolean;

  @Prop({ required: true, unique: true, trim: true })
  inviteCode: string;

  @Prop({
    type: {
      allowSelfRegistration: { type: Boolean, default: true },
      defaultStudentAttemptsPerTest: { type: Number, default: 1 },
      testGracePeriodMinutes: { type: Number, default: 5 },
      requireEmailVerification: { type: Boolean, default: false },
      allowInstructorTestCreation: { type: Boolean, default: true },
      maxQuestionsPerTest: { type: Number, default: 100 },
      defaultTestTimeLimit: { type: Number, default: 60 },
    },
    default: () => ({}),
  })
  settings?: {
    allowSelfRegistration?: boolean;
    defaultStudentAttemptsPerTest?: number;
    testGracePeriodMinutes?: number;
    requireEmailVerification?: boolean;
    allowInstructorTestCreation?: boolean;
    maxQuestionsPerTest?: number;
    defaultTestTimeLimit?: number;
  };

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);

// Index for isSuperOrg
OrganizationSchema.index({ isSuperOrg: 1 });

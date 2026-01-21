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

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);

// Index for isSuperOrg
OrganizationSchema.index({ isSuperOrg: 1 });

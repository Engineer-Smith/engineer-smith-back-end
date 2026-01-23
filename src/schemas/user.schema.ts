import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  collection: 'users',
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User {
  @Prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  })
  loginId: string;

  @Prop({
    sparse: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function (email: string) {
        if (!email) return true;
        return /\S+@\S+\.\S+/.test(email);
      },
      message: 'Please enter a valid email address',
    },
  })
  email?: string;

  @Prop({
    required: true,
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters'],
  })
  firstName: string;

  @Prop({
    required: true,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters'],
  })
  lastName: string;

  @Prop({
    required: function (this: User) {
      return !this.isSSO;
    },
  })
  hashedPassword?: string;

  @Prop({ sparse: true, unique: true })
  ssoId?: string;

  @Prop({ sparse: true })
  ssoToken?: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  })
  organizationId: MongooseSchema.Types.ObjectId;

  @Prop({
    required: true,
    enum: ['admin', 'instructor', 'student'],
  })
  role: 'admin' | 'instructor' | 'student';

  @Prop({ default: false })
  isSSO: boolean;

  @Prop({ default: false })
  unlimitedAttempts: boolean;

  @Prop({
    type: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      emailNotifications: { type: Boolean, default: true },
      testReminders: { type: Boolean, default: true },
      codeEditorFontSize: { type: Number, default: 14 },
      codeEditorTheme: { type: String, default: 'vs-dark' },
    },
    default: () => ({}),
  })
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    emailNotifications?: boolean;
    testReminders?: boolean;
    codeEditorFontSize?: number;
    codeEditorTheme?: string;
  };

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ organizationId: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ lastName: 1, firstName: 1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function (this: UserDocument) {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for display name (Last, First format)
UserSchema.virtual('displayName').get(function (this: UserDocument) {
  return `${this.lastName}, ${this.firstName}`;
});

// Static method to find user by username or email
UserSchema.statics.findByLoginCredential = function (loginCredential: string) {
  const isEmail = /\S+@\S+\.\S+/.test(loginCredential);

  if (isEmail) {
    return this.findOne({ email: loginCredential.toLowerCase() });
  } else {
    return this.findOne({ loginId: loginCredential.toLowerCase() });
  }
};

// Static method to search users by name
UserSchema.statics.searchByName = function (
  searchTerm: string,
  organizationId: string,
  role?: string,
) {
  const regex = new RegExp(searchTerm, 'i');

  const query: any = {
    organizationId,
    $or: [{ firstName: regex }, { lastName: regex }, { loginId: regex }],
  };

  if (role) {
    query.role = role;
  }

  return this.find(query).sort({ lastName: 1, firstName: 1 });
};

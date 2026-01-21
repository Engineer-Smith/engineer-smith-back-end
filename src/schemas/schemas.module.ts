import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { Organization, OrganizationSchema } from './organization.schema';

// Make schemas globally available so we don't need to import in every module
@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Organization.name, schema: OrganizationSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class SchemasModule {}

import { Field, ID, ObjectType } from '@nestjs/graphql';
import { CreatedUpdated } from '@src/graphql/created-updated.model';
import { Paginated } from '@src/graphql/paginated';
import { Identity } from '@src/users/identity.model';

@ObjectType()
export class User extends CreatedUpdated {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  given_name?: string;

  @Field({ nullable: true })
  family_name?: string;

  @Field(() => [Identity])
  identities: Identity[];
}

@ObjectType()
export class UserPage extends Paginated(User) {}

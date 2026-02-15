import { faker } from '@faker-js/faker'
import { Factory } from '@mikro-orm/seeder'
import _ from 'lodash'

import { Org } from '@src/users/org.entity'

export class OrgFactory extends Factory<Org> {
  model = Org

  definition(): Partial<Org> {
    const name = faker.company.name()
    return {
      name,
      slug: _.snakeCase(faker.company.name()),
      nameTr: {
        en: name,
      },
      desc: {
        en: faker.lorem.paragraph(),
      },
      avatarURL: faker.image.avatar(),
      websiteURL: faker.internet.url(),
      metadata: JSON.stringify({
        test: faker.string.alphanumeric(10),
      }),
    }
  }
}

import dotenv from 'dotenv-flow'
import { JestConfigWithTsJest } from 'ts-jest'

export default async (_: any, jestConfig: JestConfigWithTsJest) => {
  if (dotenv) {
    dotenv.config()
  }
}

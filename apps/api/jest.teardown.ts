export default async (_: any, jestConfig: any) => {
  // @ts-expect-error legacy noImplicitAny
  await global.orm.close()
}

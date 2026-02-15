import { CommitOrderCalculator, EntityMetadata, MikroORM } from '@mikro-orm/postgresql'

export function getOrderedMetadata(orm: MikroORM, schema?: string): EntityMetadata[] {
  const metadata = Object.values(orm.getMetadata().getAll()).filter((meta) => {
    const isRootEntity = meta.root.className === meta.className
    return isRootEntity && !meta.embeddable && !meta.virtual
  })
  const calc = new CommitOrderCalculator()
  metadata.forEach((meta) => calc.addNode(meta.root.className))
  let meta = metadata.pop()

  while (meta) {
    for (const prop of meta.props) {
      calc.discoverProperty(prop, meta.root.className)
    }

    meta = metadata.pop()
  }

  return calc
    .sort()
    .map((cls) => orm.getMetadata().find(cls)!)
    .filter((meta) => {
      const targetSchema = meta.schema ?? 'public'
      return schema ? [schema, '*'].includes(targetSchema) : meta.schema !== '*'
    })
}

export async function clearDatabase(
  orm: MikroORM,
  schema?: string,
  excludeTables: string[] = [],
): Promise<void> {
  for (const meta of getOrderedMetadata(orm, schema).reverse()) {
    if (excludeTables.includes(meta.tableName)) {
      continue
    }
    await orm.em
      .createQueryBuilder(meta.className, orm.em?.getTransactionContext(), 'write')
      .withSchema(schema)
      .delete({})
      .execute()
  }
}

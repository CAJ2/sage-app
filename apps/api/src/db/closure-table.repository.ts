import type { Constructor } from '@mikro-orm/core'
// Adapted from https://gist.github.com/alexy4744/50edc40d2ed6eb706f2fcf3027dbe806
import { EntityRepository, Knex, QueryBuilder } from '@mikro-orm/postgresql'

type Node = string

export interface ClosureTableRepository<Entity extends object> extends EntityRepository<Entity> {
  containsDescendant(parent: Node, descendant: Node): Promise<boolean>
  findDescendants(parent: Node): QueryBuilder<any>
  insertLeafNode(leaf: Node, parent: Node): Promise<void>
  insertRootNode(root: Node): Promise<void>
  moveSubtree(source: Node, destination: Node): Promise<void>
  removeDescendants(parent: Node): Promise<void>
  removeSubtree(node: Node): Promise<void>
}

export interface ClosureTableRepositoryOptions {
  ancestorColumn: string
  depthColumn: string
  descendantColumn: string
}

export const DefineClosureTableRepository = <Entity extends object>(
  options: ClosureTableRepositoryOptions,
): Constructor<ClosureTableRepository<Entity>> => {
  // Use em.execute() to allow the ORM to log the query
  class ClosureTableMixinRepository
    extends EntityRepository<Entity>
    implements ClosureTableRepository<Entity>
  {
    private readonly ancestorColumn = this.getColumnName(options.ancestorColumn)
    private readonly depthColumn = this.getColumnName(options.depthColumn)
    private readonly descendantColumn = this.getColumnName(options.descendantColumn)

    private readonly tableName = this.getTableName(this.entityName.toString())

    private get knex(): Knex {
      return this.em.getKnex()
    }

    async containsDescendant(parent: Node, descendant: Node): Promise<boolean> {
      const hasDescendant = await this.createQueryBuilder()
        .select('*')
        .where({
          [this.ancestorColumn]: parent,
          [this.descendantColumn]: descendant,
        })
        .limit(1)
        .getSingleResult()

      return !!hasDescendant
    }

    findDescendants(parent: Node): QueryBuilder {
      return this.em
        .createQueryBuilder(this.tableName)
        .select(this.descendantColumn)
        .where({
          [this.ancestorColumn]: parent,
          [this.descendantColumn]: { $ne: parent },
        })
    }

    async insertLeafNode(leaf: Node, parent: Node): Promise<void> {
      await this.em.execute(
        this.knex(this.tableName).insert(
          this.knex
            .select(
              this.ancestorColumn,
              this.knex.raw('?', leaf),
              this.knex.raw(`${this.depthColumn} + 1`),
            )
            .from(this.tableName)
            .where(this.descendantColumn, parent)
            .unionAll(
              this.knex.select(
                this.knex.raw('?', leaf),
                this.knex.raw('?', leaf),
                this.knex.raw('?', 0),
              ),
            ),
        ),
      )
    }

    async insertRootNode(root: Node): Promise<void> {
      await this.em.execute(
        this.knex(this.tableName).insert({
          [this.ancestorColumn]: root,
          [this.depthColumn]: 0,
          [this.descendantColumn]: root,
        }),
      )
    }

    async moveSubtree(source: Node, destination: Node): Promise<void> {
      await this.em.execute(
        this.knex(this.tableName)
          .delete()
          .whereIn(
            this.descendantColumn,
            this.knex
              .select(this.descendantColumn)
              .from(this.tableName)
              .where(this.ancestorColumn, source),
          )
          .whereIn(
            this.ancestorColumn,
            this.knex
              .select(this.ancestorColumn)
              .from(this.tableName)
              .where(this.descendantColumn, source)
              .andWhereNot(this.ancestorColumn, this.knex.ref(this.descendantColumn)),
          ),
      )

      await this.em.execute(
        this.knex(this.tableName).insert(
          this.knex
            .select(
              this.knex.ref(`supertree.${this.ancestorColumn}`),
              this.knex.ref(`subtree.${this.descendantColumn}`),
              // can't use .ref() here because knex gets confused with the + operator
              this.knex.raw(`supertree.${this.depthColumn} + subtree.${this.depthColumn} + 1`),
            )
            .from({ supertree: this.tableName })
            .crossJoin(this.knex.ref(`${this.tableName} as subtree`))
            .where(`supertree.${this.descendantColumn}`, destination)
            .andWhere(`subtree.${this.ancestorColumn}`, source),
        ),
      )
    }

    async removeDescendants(parent: Node): Promise<void> {
      await this.em.execute(
        this.knex(this.tableName)
          .delete()
          .whereIn(
            this.descendantColumn,
            this.knex
              .select(this.descendantColumn)
              .from(this.tableName)
              .where(this.ancestorColumn, parent)
              .andWhereNot(this.descendantColumn, parent),
          ),
      )
    }

    async removeSubtree(node: Node): Promise<void> {
      await this.em.execute(
        this.knex(this.tableName)
          .delete()
          .whereIn(
            this.descendantColumn,
            this.knex
              .select(this.descendantColumn)
              .from(this.tableName)
              .where(this.ancestorColumn, node),
          ),
      )
    }

    private getColumnName(columnName: string): string {
      return this.em.config.getNamingStrategy().propertyToColumnName(columnName)
    }

    private getTableName(entityName: string): string {
      return this.em.config.getNamingStrategy().classToTableName(entityName)
    }
  }

  return ClosureTableMixinRepository
}

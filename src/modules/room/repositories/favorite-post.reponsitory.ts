import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { FavoritePostEntity } from '../../post/entities/favorite-post.entity';

@Injectable()
export class FavoritePostRepository extends Repository<FavoritePostEntity> {
  constructor(private dataSource: DataSource) {
    super(FavoritePostEntity, dataSource.createEntityManager());
  }

  /**
   * Add a basic where clause to the query and return the first result.
   */
  async firstWhere(
    column: string,
    value: string | number,
    operator = '=',
  ): Promise<FavoritePostEntity | undefined> {
    return await this.createQueryBuilder()
      .where(`FavoritePostEntity.${column} ${operator} :value`, {
        value: value,
      })
      .getOne();
  }
}

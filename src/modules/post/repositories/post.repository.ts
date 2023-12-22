import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { PostEntity } from '../../post/entities/post.entity';

@Injectable()
export class PostRepository extends Repository<PostEntity> {
  constructor(private dataSource: DataSource) {
    super(PostEntity, dataSource.createEntityManager());
  }

  /**
   * Add a basic where clause to the query and return the first result.
   */
  async firstWhere(
    column: string,
    value: string | number,
    operator = '=',
  ): Promise<PostEntity | undefined> {
    return await this.createQueryBuilder()
      .where(`PostEntity.${column} ${operator} :value`, { value: value })
      .getOne();
  }
}

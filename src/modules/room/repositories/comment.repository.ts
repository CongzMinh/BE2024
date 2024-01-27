import { DataSource, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { CommentEntity } from '../../post/entities/comment.entity';

@Injectable()
export class CommentRepository extends Repository<CommentEntity> {
  constructor(private dataSource: DataSource) {
    super(CommentEntity, dataSource.createEntityManager());
  }

  /**
   * Add a basic where clause to the query and return the first result.
   */
  async firstWhere(
    column: string,
    value: string | number,
    operator = '=',
  ): Promise<CommentEntity | undefined> {
    return await this.createQueryBuilder()
      .where(`CommentEntity.${column} ${operator} :value`, {
        value: value,
      })
      .getOne();
  }
}

import { Expose, Transform } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from 'src/modules/user/entities/user.entity';

@Entity({
  name: 'posts',
})
export class PostEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  name: string;

  @Column()
  price: number;

  @CreateDateColumn({
    name: 'created_at',
  })
  @Expose()
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  @Expose()
  updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
  })
  @Expose()
  deletedAt?: Date;

  @ManyToOne(() => UserEntity, (user) => user.posts)
  @Transform(({ obj }) => obj.user.id)
  user: UserEntity;
}

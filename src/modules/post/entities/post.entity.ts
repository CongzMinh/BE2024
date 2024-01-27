import { Expose, Transform } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { CommentEntity } from './comment.entity';
import { FavoritePostEntity } from './favorite-post.entity';

@Entity({
  name: 'posts',
})
export class PostEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'boolean' })
  published: boolean;

  @Column()
  address: string;

  @Column({ type: 'jsonb' })
  image: string[];

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column()
  area: number;

  @Column()
  capacity: number;

  @Column()
  electricityPrice: number;

  @Column()
  waterPrice: number;

  @Column()
  wifiPrice: number;

  @Column({ nullable: true })
  serviceCharge: number;

  @Column({ nullable: true })
  laundryFee: number;

  @Column({ type: 'jsonb', nullable: true })
  utilities: string[];

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

  @OneToMany(() => FavoritePostEntity, (favoritePost) => favoritePost.post)
  likedBy: FavoritePostEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.post)
  comments: CommentEntity[];

}

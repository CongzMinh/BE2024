import { Expose } from 'class-transformer';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/shared/enums/user.enum';
import { PostEntity } from 'src/modules/post/entities/post.entity';
import { FavoritePostEntity } from 'src/modules/post/entities/favorite-post.entity';
import { CommentEntity } from 'src/modules/post/entities/comment.entity';

@Entity({
  name: 'users',
})
export class UserEntity {
  @PrimaryGeneratedColumn({
    unsigned: true,
  })
  id: number;

  @Column()
  @Expose()
  name?: string;

  @Column({ nullable: true, default: null })
  @Expose()
  email: string;

  @Column({
    length: 200,
    nullable: true,
    default: null,
  })
  @Expose()
  phoneNumber?: string;

  @Column({
    nullable: true,
  })
  @Expose()
  password: string;

  @Column({ nullable: true, default: null })
  avatar: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  @Expose()
  role: Role;

  @Column({
    name: 'is_locked',
    default: false,
  })
  @Expose()
  isLocked: boolean;

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

  @OneToMany(() => PostEntity, (post) => post.user)
  posts: PostEntity[];

  @ManyToMany(() => PostEntity, (post) => post.likedBy)
  @JoinTable()
  favoritePosts: PostEntity[];

  @OneToMany(() => FavoritePostEntity, (favoritePost) => favoritePost.user)
  favoritePostsConnection: FavoritePostEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.user)
  comments: CommentEntity[];

  @BeforeInsert()
  async setPassword(password: string) {
    const salt = await bcrypt.genSalt(+process.env.APP_BCRYPT_SALT);
    console.log('========= before insert');
    this.password = await bcrypt.hash(password || this.password, salt);
  }
}

import { UserEntity } from 'src/modules/user/entities/user.entity';
import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PostEntity } from './post.entity';

@Entity({
  name: 'favoritepost',
})
export class FavoritePostEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.favoritePostsConnection)
  user: UserEntity;

  @ManyToOne(() => PostEntity, (post) => post.likedBy)
  post: PostEntity;
}

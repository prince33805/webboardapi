import { Comment } from '../../comments/entities/comment.entity';
import { Post } from '../../posts/entities/post.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, DeleteDateColumn } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    // @Column()
    // password: string;

    // @Column({ default: 'user' })
    // role: string;

    @OneToMany(() => Post, post => post.author)
    posts: Post[];

    @OneToMany(() => Comment, comment => comment.author)
    comments: Comment[];

    // @OneToMany(() => Like, like => like.user)
    // likes: Like[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn({ nullable: true })
    deletedAt: Date | null;
}
import { Category } from '../../categories/entities/category.entity';
import { User } from '../../users/entities/user.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, JoinColumn } from 'typeorm';

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column('text')
    content: string;

    @ManyToOne(() => User, user => user.posts, { eager: true })
    @JoinColumn({ name: 'authorId' }) // Optionally, you can specify the column name
    author: User;

    @ManyToOne(() => Category, category => category.posts, { eager: true })
    category: Category;

    @OneToMany(() => Comment, comment => comment.post)
    comments: Comment[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date | null;
}
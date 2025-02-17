import { PartialType } from '@nestjs/mapped-types';
import { CreateCommentDto } from './create-comment.dto';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class UpdateCommentDto extends PartialType(CreateCommentDto) {
    @IsNotEmpty()
    @IsInt()
    postId: number;

    @IsNotEmpty()
    @IsInt()
    authorId: number;

    @IsNotEmpty()
    @IsString()
    content: string;
}

import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreatePostDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    content: string;

    @IsNotEmpty()
    @IsInt()
    authorId: number; // Reference to the User entity's ID

    @IsNotEmpty()
    @IsInt()
    categoryId: number;
}

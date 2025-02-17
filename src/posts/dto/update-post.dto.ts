import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdatePostDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsOptional()
    @IsInt()
    categoryId: number;
}

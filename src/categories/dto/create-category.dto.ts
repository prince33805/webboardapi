import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
    @IsNotEmpty()
    @IsString()
    name: string;
}

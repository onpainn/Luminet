import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsInt()
  @IsNumber()
  moodId: number;

  @IsInt()
  @IsNumber()
  topicId: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

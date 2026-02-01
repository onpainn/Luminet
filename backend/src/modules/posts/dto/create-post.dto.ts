import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  moodId: number;

  @IsNumber()
  topicId: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

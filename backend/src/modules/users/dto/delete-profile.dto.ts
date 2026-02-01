import { IsString } from 'class-validator';

export class DeleteProfileDto {
  @IsString()
  password: string;
}

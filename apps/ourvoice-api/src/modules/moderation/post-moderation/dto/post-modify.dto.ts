import {
  IsString,
  IsOptional,
  Length,
  IsNumber,
  MinLength,
  MaxLength,
  IsArray,
  ArrayMaxSize,
  ArrayMinSize,
} from 'class-validator';

export class PostModifyDto {
  @IsString()
  @Length(1, 100)
  title?: string;

  @IsString()
  @Length(1, 255)
  content?: string;

  @IsNumber({}, { each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(2)
  categoryIds?: number[];

  @IsString({ each: true })
  @IsOptional()
  files?: string[];
}
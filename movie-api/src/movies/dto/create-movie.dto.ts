import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsArray,
  IsNumber,
} from "class-validator";

export class CreateMovieDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  releaseDate?: string;

  @IsString()
  @IsOptional()
  genre?: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  actorIds?: number[];
}

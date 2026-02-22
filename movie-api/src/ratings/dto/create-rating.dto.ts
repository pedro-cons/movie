import { IsNumber, IsNotEmpty, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateRatingDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(10)
  value: number;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsNumber()
  @IsNotEmpty()
  movieId: number;
}

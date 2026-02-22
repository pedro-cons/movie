import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class UpdateRatingDto {
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(10)
  value?: number;

  @IsString()
  @IsOptional()
  comment?: string;
}

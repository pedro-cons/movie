import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { Rating } from "./entities/rating.entity";
import { CreateRatingDto } from "./dto/create-rating.dto";
import { UpdateRatingDto } from "./dto/update-rating.dto";
import { PaginationQueryDto } from "../common/dto/pagination-query.dto";
import { Movie } from "../movies/entities/movie.entity";

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private ratingsRepository: Repository<Rating>,
    @InjectRepository(Movie)
    private moviesRepository: Repository<Movie>,
  ) {}

  async findAll(query: PaginationQueryDto & { movieId?: number }) {
    const { page = 1, limit = 10, movieId } = query;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Rating> = {};
    if (movieId) {
      where.movieId = movieId;
    }

    const [data, total] = await this.ratingsRepository.findAndCount({
      where,
      relations: ["movie"],
      skip,
      take: limit,
      order: { createdAt: "DESC" },
    });

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const rating = await this.ratingsRepository.findOne({
      where: { id },
      relations: ["movie"],
    });
    if (!rating) {
      throw new NotFoundException(`Rating with ID ${id} not found`);
    }
    return rating;
  }

  async create(createRatingDto: CreateRatingDto) {
    const movie = await this.moviesRepository.findOne({
      where: { id: createRatingDto.movieId },
    });
    if (!movie) {
      throw new NotFoundException(
        `Movie with ID ${createRatingDto.movieId} not found`,
      );
    }

    const rating = this.ratingsRepository.create(createRatingDto);
    return this.ratingsRepository.save(rating);
  }

  async update(id: number, updateRatingDto: UpdateRatingDto) {
    const rating = await this.findOne(id);
    Object.assign(rating, updateRatingDto);
    return this.ratingsRepository.save(rating);
  }

  async remove(id: number) {
    const rating = await this.findOne(id);
    await this.ratingsRepository.remove(rating);
    return { deleted: true };
  }
}

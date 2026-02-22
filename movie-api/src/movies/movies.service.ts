import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In } from 'typeorm';
import { Movie } from './entities/movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Actor } from '../actors/entities/actor.entity';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private moviesRepository: Repository<Movie>,
    @InjectRepository(Actor)
    private actorsRepository: Repository<Actor>,
  ) {}

  async findAll(query: PaginationQueryDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where = search ? { title: ILike(`%${search}%`) } : {};

    const [data, total] = await this.moviesRepository.findAndCount({
      where,
      relations: ['actors', 'ratings'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const movie = await this.moviesRepository.findOne({
      where: { id },
      relations: ['actors', 'ratings'],
    });
    if (!movie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }
    return movie;
  }

  async getActors(id: number) {
    const movie = await this.moviesRepository.findOne({
      where: { id },
      relations: ['actors'],
    });
    if (!movie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }
    return movie.actors;
  }

  async create(createMovieDto: CreateMovieDto) {
    const { actorIds, ...movieData } = createMovieDto;
    const movie = this.moviesRepository.create(movieData);

    if (actorIds && actorIds.length > 0) {
      movie.actors = await this.actorsRepository.findBy({ id: In(actorIds) });
    }

    return this.moviesRepository.save(movie);
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const movie = await this.findOne(id);
    const { actorIds, ...movieData } = updateMovieDto;

    Object.assign(movie, movieData);

    if (actorIds !== undefined) {
      movie.actors = actorIds.length > 0
        ? await this.actorsRepository.findBy({ id: In(actorIds) })
        : [];
    }

    return this.moviesRepository.save(movie);
  }

  async remove(id: number) {
    const movie = await this.findOne(id);
    await this.moviesRepository.remove(movie);
    return { deleted: true };
  }
}

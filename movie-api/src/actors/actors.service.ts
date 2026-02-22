import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, ILike } from "typeorm";
import { Actor } from "./entities/actor.entity";
import { CreateActorDto } from "./dto/create-actor.dto";
import { UpdateActorDto } from "./dto/update-actor.dto";
import { PaginationQueryDto } from "../common/dto/pagination-query.dto";

@Injectable()
export class ActorsService {
  constructor(
    @InjectRepository(Actor)
    private actorsRepository: Repository<Actor>,
  ) {}

  async findAll(query: PaginationQueryDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.actorsRepository
      .createQueryBuilder("actor")
      .leftJoinAndSelect("actor.movies", "movie")
      .skip(skip)
      .take(limit)
      .orderBy("actor.createdAt", "DESC");

    if (search) {
      queryBuilder.where(
        "CONCAT(actor.firstName, ' ', actor.lastName) ILIKE :search",
        { search: `%${search}%` },
      );
    }

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const actor = await this.actorsRepository.findOne({
      where: { id },
      relations: ["movies"],
    });
    if (!actor) {
      throw new NotFoundException(`Actor with ID ${id} not found`);
    }
    return actor;
  }

  async getMovies(id: number) {
    const actor = await this.actorsRepository.findOne({
      where: { id },
      relations: ["movies"],
    });
    if (!actor) {
      throw new NotFoundException(`Actor with ID ${id} not found`);
    }
    return actor.movies;
  }

  async create(createActorDto: CreateActorDto) {
    const actor = this.actorsRepository.create(createActorDto);
    return this.actorsRepository.save(actor);
  }

  async update(id: number, updateActorDto: UpdateActorDto) {
    const actor = await this.findOne(id);
    Object.assign(actor, updateActorDto);
    return this.actorsRepository.save(actor);
  }

  async remove(id: number) {
    const actor = await this.findOne(id);
    // Clear many-to-many relations first to avoid FK constraint violation
    // (movie_actors has ON DELETE NO ACTION for actorsId)
    actor.movies = [];
    await this.actorsRepository.save(actor);
    await this.actorsRepository.remove(actor);
    return { deleted: true };
  }
}

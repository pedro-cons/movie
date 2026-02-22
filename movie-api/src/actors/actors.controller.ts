import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from "@nestjs/common";
import { ActorsService } from "./actors.service";
import { CreateActorDto } from "./dto/create-actor.dto";
import { UpdateActorDto } from "./dto/update-actor.dto";
import { PaginationQueryDto } from "../common/dto/pagination-query.dto";
import { Public } from "../common/decorators/public.decorator";

@Controller("actors")
export class ActorsController {
  constructor(private readonly actorsService: ActorsService) {}

  @Public()
  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.actorsService.findAll(query);
  }

  @Public()
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.actorsService.findOne(id);
  }

  @Public()
  @Get(":id/movies")
  getMovies(@Param("id", ParseIntPipe) id: number) {
    return this.actorsService.getMovies(id);
  }

  @Post()
  create(@Body() createActorDto: CreateActorDto) {
    return this.actorsService.create(createActorDto);
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateActorDto: UpdateActorDto,
  ) {
    return this.actorsService.update(id, updateActorDto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.actorsService.remove(id);
  }
}

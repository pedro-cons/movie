import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SeedService } from "./seed.service";
import { User } from "../../users/entities/user.entity";
import { Movie } from "../../movies/entities/movie.entity";
import { Actor } from "../../actors/entities/actor.entity";
import { Rating } from "../../ratings/entities/rating.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User, Movie, Actor, Rating])],
  providers: [SeedService],
})
export class SeedModule {}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToMany,
  JoinTable,
} from "typeorm";
import { Actor } from "../../actors/entities/actor.entity";
import { Rating } from "../../ratings/entities/rating.entity";

@Entity("movies")
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "date", nullable: true })
  releaseDate: string;

  @Column({ nullable: true })
  genre: string;

  @ManyToMany(() => Actor, (actor) => actor.movies, { cascade: true })
  @JoinTable({ name: "movie_actors" })
  actors: Actor[];

  @OneToMany(() => Rating, (rating) => rating.movie, { cascade: true })
  ratings: Rating[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';
import { Movie } from '../../movies/entities/movie.entity';
import { Actor } from '../../actors/entities/actor.entity';
import { Rating } from '../../ratings/entities/rating.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Movie) private movieRepo: Repository<Movie>,
    @InjectRepository(Actor) private actorRepo: Repository<Actor>,
    @InjectRepository(Rating) private ratingRepo: Repository<Rating>,
  ) {}

  async onModuleInit() {
    if (process.env.RUN_SEED !== 'true') return;

    const movieCount = await this.movieRepo.count();
    if (movieCount > 0) return;

    this.logger.log('Seeding database...');
    await this.seed();
    this.logger.log('Database seeded successfully!');
  }

  private async seed() {
    // Create default user
    const hashedPassword = await bcrypt.hash('password123', 10);
    await this.userRepo.save(
      this.userRepo.create({ username: 'admin', password: hashedPassword }),
    );

    // Create actors
    const actors = await this.actorRepo.save([
      this.actorRepo.create({ firstName: 'Leonardo', lastName: 'DiCaprio', birthDate: '1974-11-11' }),
      this.actorRepo.create({ firstName: 'Brad', lastName: 'Pitt', birthDate: '1963-12-18' }),
      this.actorRepo.create({ firstName: 'Margot', lastName: 'Robbie', birthDate: '1990-07-02' }),
      this.actorRepo.create({ firstName: 'Robert', lastName: 'Downey Jr.', birthDate: '1965-04-04' }),
      this.actorRepo.create({ firstName: 'Scarlett', lastName: 'Johansson', birthDate: '1984-11-22' }),
      this.actorRepo.create({ firstName: 'Tom', lastName: 'Hardy', birthDate: '1977-09-15' }),
    ]);

    const [dicaprio, pitt, robbie, downey, johansson, hardy] = actors;

    // Create movies with actor relationships
    const movies = await this.movieRepo.save([
      this.movieRepo.create({
        title: 'Inception',
        description: 'A thief who steals corporate secrets through dream-sharing technology is given the task of planting an idea into the mind of a C.E.O.',
        releaseDate: '2010-07-16',
        genre: 'Sci-Fi',
        actors: [dicaprio, hardy],
      }),
      this.movieRepo.create({
        title: 'Once Upon a Time in Hollywood',
        description: 'A faded television actor and his stunt double strive to achieve fame and success in the final years of Hollywood\'s Golden Age.',
        releaseDate: '2019-07-26',
        genre: 'Comedy/Drama',
        actors: [dicaprio, pitt, robbie],
      }),
      this.movieRepo.create({
        title: 'The Avengers',
        description: 'Earth\'s mightiest heroes must come together to stop Loki and his alien army from enslaving humanity.',
        releaseDate: '2012-05-04',
        genre: 'Action',
        actors: [downey, johansson],
      }),
      this.movieRepo.create({
        title: 'Iron Man',
        description: 'After being held captive, billionaire engineer Tony Stark creates a unique weaponized suit of armor to fight evil.',
        releaseDate: '2008-05-02',
        genre: 'Action',
        actors: [downey],
      }),
      this.movieRepo.create({
        title: 'The Wolf of Wall Street',
        description: 'Based on the true story of Jordan Belfort, from his rise to a wealthy stock-broker to his fall involving crime and corruption.',
        releaseDate: '2013-12-25',
        genre: 'Biography/Drama',
        actors: [dicaprio, robbie],
      }),
      this.movieRepo.create({
        title: 'The Dark Knight Rises',
        description: 'Eight years after the Joker\'s reign of anarchy, Batman must return to defend Gotham City against Bane.',
        releaseDate: '2012-07-20',
        genre: 'Action',
        actors: [hardy],
      }),
    ]);

    // Create ratings
    await this.ratingRepo.save([
      this.ratingRepo.create({ value: 9, comment: 'Mind-bending masterpiece!', movieId: movies[0].id }),
      this.ratingRepo.create({ value: 8, comment: 'Visually stunning', movieId: movies[0].id }),
      this.ratingRepo.create({ value: 8, comment: 'Tarantino at his best', movieId: movies[1].id }),
      this.ratingRepo.create({ value: 9, comment: 'Epic superhero ensemble', movieId: movies[2].id }),
      this.ratingRepo.create({ value: 7, comment: 'Started the MCU revolution', movieId: movies[3].id }),
      this.ratingRepo.create({ value: 10, comment: 'DiCaprio deserved the Oscar for this', movieId: movies[4].id }),
      this.ratingRepo.create({ value: 8, comment: 'Great conclusion to the trilogy', movieId: movies[5].id }),
    ]);
  }
}

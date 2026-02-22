export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const QUERY_KEYS = {
  movies: 'movies',
  movie: 'movie',
  movieActors: 'movieActors',
  actors: 'actors',
  actor: 'actor',
  actorMovies: 'actorMovies',
  ratings: 'ratings',
} as const;

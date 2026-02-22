import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1771722764638 implements MigrationInterface {
    name = 'InitialSchema1771722764638'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "password" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "actors" ("id" SERIAL NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "birthDate" date, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d8608598c2c4f907a78de2ae461" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ratings" ("id" SERIAL NOT NULL, "value" integer NOT NULL, "comment" text, "movieId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0f31425b073219379545ad68ed9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "movies" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" text, "releaseDate" date, "genre" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c5b2c134e871bfd1c2fe7cc3705" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "movie_actors" ("moviesId" integer NOT NULL, "actorsId" integer NOT NULL, CONSTRAINT "PK_24f319041f96f9a671c6f1bbdd2" PRIMARY KEY ("moviesId", "actorsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9cece9fdb698e5c4f98c613de3" ON "movie_actors" ("moviesId") `);
        await queryRunner.query(`CREATE INDEX "IDX_0e5267847734b6af68dbecf46f" ON "movie_actors" ("actorsId") `);
        await queryRunner.query(`ALTER TABLE "ratings" ADD CONSTRAINT "FK_c10d219b6360c74a9f2186b76df" FOREIGN KEY ("movieId") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "movie_actors" ADD CONSTRAINT "FK_9cece9fdb698e5c4f98c613de36" FOREIGN KEY ("moviesId") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "movie_actors" ADD CONSTRAINT "FK_0e5267847734b6af68dbecf46f0" FOREIGN KEY ("actorsId") REFERENCES "actors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "movie_actors" DROP CONSTRAINT "FK_0e5267847734b6af68dbecf46f0"`);
        await queryRunner.query(`ALTER TABLE "movie_actors" DROP CONSTRAINT "FK_9cece9fdb698e5c4f98c613de36"`);
        await queryRunner.query(`ALTER TABLE "ratings" DROP CONSTRAINT "FK_c10d219b6360c74a9f2186b76df"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0e5267847734b6af68dbecf46f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9cece9fdb698e5c4f98c613de3"`);
        await queryRunner.query(`DROP TABLE "movie_actors"`);
        await queryRunner.query(`DROP TABLE "movies"`);
        await queryRunner.query(`DROP TABLE "ratings"`);
        await queryRunner.query(`DROP TABLE "actors"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}

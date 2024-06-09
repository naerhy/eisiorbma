import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class MealEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  isRecipe: boolean;

  @Column()
  photoURL: string;

  @Column()
  thumbnailURL: string;
}

import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { RecipeEntity } from "./recipe";

@Entity()
export class MealEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 64 })
  name: string;

  @OneToOne(() => RecipeEntity, { nullable: true })
  @JoinColumn()
  recipe: RecipeEntity | null;

  @Column({ type: "varchar", length: 256 })
  filename: string;

  @Column({ type: "varchar", length: 256 })
  photoURL: string;

  @Column({ type: "varchar", length: 256 })
  thumbnailURL: string;
}

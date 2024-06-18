import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class RecipeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int", array: true })
  types: number[];

  @Column()
  difficulty: number;

  @Column()
  cookingTime: number;

  @Column()
  isVegetarian: boolean;

  @Column()
  servings: number;

  @Column("text")
  ingredients: string;

  @Column("text")
  directions: string;
}

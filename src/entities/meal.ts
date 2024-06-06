import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { PhotoEntity } from "./photo";

@Entity()
export class MealEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  isRecipe: boolean;

  @Column()
  thumbnailBase64: string;

  @OneToOne(() => PhotoEntity)
  @JoinColumn()
  photo: PhotoEntity;
}

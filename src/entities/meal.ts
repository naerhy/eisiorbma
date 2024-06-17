import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class MealEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 64 })
  name: string;

  @Column({ type: "text", nullable: true })
  recipe: string | null;

  @Column({ type: "varchar", length: 256 })
  filename: string;

  @Column({ type: "varchar", length: 256 })
  photoURL: string;

  @Column({ type: "varchar", length: 256 })
  thumbnailURL: string;
}

import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class PhotoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  photoBase64: string;
}

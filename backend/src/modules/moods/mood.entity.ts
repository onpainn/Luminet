import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('moods')
export class Mood {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  key: string;

  @Column()
  label: string;
}

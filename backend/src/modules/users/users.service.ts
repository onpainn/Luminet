import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  // =========================
  // HELPERS
  // =========================
  safeUser(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...rest } = user;
    return rest;
  }

  private ensureActive(user: User) {
    if (!user.isActive) {
      throw new UnauthorizedException('User is deactivated');
    }
  }

  // =========================
  // REGISTRATION
  // =========================
  async create(dto: CreateUserDto): Promise<User> {
    const exists = await this.usersRepository.findOne({
      where: [{ email: dto.email }, { username: dto.username }],
    });

    if (exists) {
      throw new ConflictException('Email or username already exists');
    }

    const password = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    const user = this.usersRepository.create({
      email: dto.email,
      username: dto.username,
      password,
      isActive: true,
    });

    return this.usersRepository.save(user);
  }

  // =========================
  // LOGIN
  // =========================
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  // =========================
  // JWT / GUARDS
  // =========================
  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    this.ensureActive(user);
    return user;
  }

  // =========================
  // UPDATE PROFILE
  // =========================
  async updateMe(userId: number, dto: UpdateUserDto) {
    await this.findById(userId);

    if (dto.email) {
      const emailExists = await this.usersRepository.findOne({
        where: { email: dto.email },
      });

      if (emailExists && emailExists.id !== userId) {
        throw new BadRequestException('Email already in use');
      }
    }

    if (dto.username) {
      const usernameExists = await this.usersRepository.findOne({
        where: { username: dto.username },
      });

      if (usernameExists && usernameExists.id !== userId) {
        throw new BadRequestException('Username already in use');
      }
    }

    await this.usersRepository.update(userId, dto);
    return this.safeUser(await this.findById(userId));
  }

  // =========================
  // CHANGE PASSWORD
  // =========================
  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id: userId })
      .getOne();

    if (!user) {
      throw new UnauthorizedException();
    }

    this.ensureActive(user);

    const isValid = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Old password is incorrect');
    }

    const newPasswordHash = await bcrypt.hash(
      dto.newPassword,
      this.SALT_ROUNDS,
    );

    await this.usersRepository.update(userId, {
      password: newPasswordHash,
    });

    return { success: true };
  }

  // =========================
  // DELETE / DEACTIVATE
  // =========================
  async deleteProfile(userId: number, password: string) {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id: userId })
      .getOne();

    if (!user) {
      throw new UnauthorizedException();
    }

    this.ensureActive(user);

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid password');
    }

    user.isActive = false;
    user.deletedAt = new Date();

    await this.usersRepository.save(user);

    return { success: true };
  }
}

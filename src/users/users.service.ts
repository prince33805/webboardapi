import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { username: createUserDto.username } });
      if (!user) {
        const newUser = this.userRepository.create({
          ...createUserDto,
          // Manually set default fields if needed
          posts: [],           // If it's an array and you want to initialize it as empty
          comments: [],        // Initialize comments as an empty array
          createdAt: new Date(), // Automatically set current timestamp for createdAt
          updatedAt: new Date(), // Same for updatedAt
        });
        return await this.userRepository.save(newUser);
      }
      return user
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Failed to find/create user');
    }
  }

  async findOneById(id: number): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user
    } catch (error) {
      throw new InternalServerErrorException(error.message || 'Failed to find user');
    }
  }

}

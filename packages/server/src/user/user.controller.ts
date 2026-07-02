import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  async login(@Body() dto: CreateUserDto) {
    let user = await this.userService.findByOpenId(dto.openId);
    if (!user) {
      user = await this.userService.create(dto);
    }
    return { code: 0, message: 'success', data: user };
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    return { code: 0, message: 'success', data: user };
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.userService.update(id, dto);
    return { code: 0, message: 'success', data: user };
  }

  @Get(':id/stats')
  async getStats(@Param('id') id: string) {
    const stats = await this.userService.getStats(id);
    return { code: 0, message: 'success', data: stats };
  }
}

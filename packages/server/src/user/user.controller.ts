import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common'
import { UserService } from './user.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import * as crypto from 'crypto'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  async login(@Body() dto: CreateUserDto) {
    let user = await this.userService.findByOpenId(dto.openId)
    if (!user) {
      user = await this.userService.create(dto)
    }
    return { code: 0, message: 'success', data: user }
  }

  // 匿名注册：不需要微信 openId，服务端生成 guest id
  @Post('guest')
  async guestLogin(@Body() dto?: { nickname?: string }) {
    const guestId = `guest_${crypto.randomUUID()}`
    const user = await this.userService.create({
      openId: guestId,
      nickname: dto?.nickname || '考公人',
    })
    return { code: 0, message: 'success', data: user }
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.userService.findById(id)
    return { code: 0, message: 'success', data: user }
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.userService.update(id, dto)
    return { code: 0, message: 'success', data: user }
  }

  @Get(':id/stats')
  async getStats(@Param('id') id: string) {
    const stats = await this.userService.getStats(id)
    return { code: 0, message: 'success', data: stats }
  }
}

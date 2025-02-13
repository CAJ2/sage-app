import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards
} from '@nestjs/common'
import { AuthGuard } from './auth.guard'
import { AuthService } from './auth.service'
import { JwtService } from '@nestjs/jwt'
import { Request as Req } from 'express'

@Controller('auth')
export class AuthController {
  constructor (private readonly authService: AuthService, private readonly jwtService: JwtService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn (@Body() signInDto: Record<string, any>) {
    const user = await this.authService.validateUser(signInDto.username, signInDto.password)
    if (user == null) {
      throw new Error('Invalid credentials')
    }
    const token = await this.jwtService.signAsync({
      sub: user.id,
      username: user.username
    })
    return {
      access_token: token,
      refresh_token: user.identities[0].refresh_token
    }
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile (@Request() req: Req) {
    return req.user
  }
}

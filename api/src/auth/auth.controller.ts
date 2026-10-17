import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(@Body() body: any) {
        return this.authService.register(body);
    }

    @Post('login')
    async login(@Body() body: Record<string, any>) {
        return this.authService.login(body.email, body.password);
    }

    @Get('me')
    @UseGuards(AuthGuard)
    async getProfile(@Request() req: any) {
        return this.authService.getProfile(req.user.sub);
    }
}
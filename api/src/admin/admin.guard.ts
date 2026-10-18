import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
    ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(private jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        let token: string | undefined;

        if (request.headers.authorization) {
            const [type, headerToken] = request.headers.authorization.split(' ');
            if (type === 'Bearer') {
                token = headerToken;
            }
        } else if (request.query && request.query.token) {
            token = String(request.query.token);
        }

        if (!token) {
            throw new UnauthorizedException('Token autentikasi tidak ditemukan');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET || 'rahasia-spmb-muska-2026',
            });
            request['user'] = payload;

            if (payload.role !== 'ADMIN') {
                throw new ForbiddenException('Akses ditolak: Anda tidak memiliki hak akses Administrator');
            }

            return true;
        } catch (err: any) {
            if (err instanceof ForbiddenException) {
                throw err;
            }
            throw new UnauthorizedException('Sesi tidak valid atau telah kedaluwarsa');
        }
    }
}

import { Controller, Get, Post, Body, UseGuards, Request, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';

@Controller('db')
@UseGuards(AdminGuard)
export class DbController {
    constructor(private readonly adminService: AdminService) { }

    @Get('backup')
    async backupDatabase(@Request() req: any, @Res() res: Response) {
        const backupData = await this.adminService.backupDatabase(req.user);
        const filename = `backup-spmb-muska-${new Date().toISOString().split('T')[0]}.json`;

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.send(JSON.stringify(backupData, null, 2));
    }

    @Post('restore')
    async restoreDatabase(@Body() body: any, @Request() req: any) {
        return this.adminService.restoreDatabase(body, req.user);
    }
}

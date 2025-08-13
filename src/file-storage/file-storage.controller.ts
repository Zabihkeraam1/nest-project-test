import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileStorageService } from './file-storage.service';
import { FileInfo } from './dto/file-info.dto';
import { HealthCheckResponse } from './dto/health-check.dto';
import { Response } from 'express';
import { createReadStream } from 'fs';

@Controller()
export class FileStorageController {
  constructor(private readonly fileStorageService: FileStorageService) {}

  @Get()
  root() {
    return { message: 'Welcome to NestJS with EFS File Storage!' };
  }

  @Get('health')
  healthCheck(): HealthCheckResponse {
    return this.fileStorageService.healthCheck();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.fileStorageService.saveFile(file);
  }

  @Get('files')
  listFiles(): Promise<FileInfo[]> {
    return this.fileStorageService.listFiles();
  }

  @Get('files/:filename')
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = await this.fileStorageService.getFilePath(filename);
    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
  }

  @Delete('files/:filename')
  deleteFile(@Param('filename') filename: string) {
    return this.fileStorageService.deleteFile(filename);
  }
}
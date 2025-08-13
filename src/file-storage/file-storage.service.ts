import { Injectable } from '@nestjs/common';
import { HealthCheckResponse } from './dto/health-check.dto';
import { FileInfo } from './dto/file-info.dto';
import { join } from 'path';
import { existsSync, unlinkSync, readdirSync, statSync } from 'fs';
import { promisify } from 'util';
import { writeFile } from 'fs/promises';

@Injectable()
export class FileStorageService {
  private readonly storagePath = join(process.cwd(), 'static');

  constructor() {
    this.ensureStorageExists();
  }

  private ensureStorageExists() {
    if (!existsSync(this.storagePath)) {
      const mkdir = promisify(require('fs').mkdir);
      return mkdir(this.storagePath, { recursive: true });
    }
  }

  healthCheck(): HealthCheckResponse {
    return {
      status: 'OK',
      message: 'Service is healthy',
    };
  }

  async saveFile(file: Express.Multer.File) {
    const filePath = join(this.storagePath, file.originalname);
    await writeFile(filePath, file.buffer);
    
    return {
      filename: file.originalname,
      savedPath: filePath,
      size: file.size,
      message: 'File uploaded successfully to EFS',
    };
  }

  async listFiles(): Promise<FileInfo[]> {
    await this.ensureStorageExists();
    const files = readdirSync(this.storagePath)
      .filter(filename => {
        const filePath = join(this.storagePath, filename);
        return statSync(filePath).isFile();
      })
      .map(filename => {
        const filePath = join(this.storagePath, filename);
        const stats = statSync(filePath);
        return {
          filename,
          size: stats.size,
          contentType: 'application/octet-stream',
        };
      });
    
    return files;
  }

  async getFilePath(filename: string): Promise<string> {
    const filePath = join(this.storagePath, filename);
    if (!existsSync(filePath)) {
      throw new Error('File not found');
    }
    return filePath;
  }

  async deleteFile(filename: string) {
    const filePath = join(this.storagePath, filename);
    if (!existsSync(filePath)) {
      throw new Error('File not found');
    }
    unlinkSync(filePath);
    return { message: `File ${filename} deleted successfully` };
  }
}
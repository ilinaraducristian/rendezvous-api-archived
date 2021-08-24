import { Injectable } from '@nestjs/common';
import { Client as Minio } from 'minio';
import md5 from '../../util/md5';

@Injectable()
export class ObjectStoreService {

  private readonly minioClient: Minio;

  constructor() {
    this.minioClient = new Minio({
      endPoint: process.env.MINIO_ENDPOINT,
      port: parseInt(process.env.MINIO_PORT),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
    });
  }

  async putImage(image: string) {
    await this.ensureBucketExists();
    const imageMd5 = md5(image);
    return this.minioClient.putObject('images', imageMd5, image).then(() => imageMd5);
  }

  async getImage(md5: string) {
    await this.ensureBucketExists();
    const dataStream = await this.minioClient.getObject('images', md5);
    return new Promise((resolve, reject) => {
      let data = '';
      dataStream.on('readable', () => {
        let chunk;
        while (null !== (chunk = dataStream.read())) {
          data += chunk;
        }
      });
      dataStream.on('end', () => {
        resolve(data);
      });
      dataStream.on('error', err => {
        reject(err);
      });

    });
  }

  private ensureBucketExists() {
    return this.minioClient.bucketExists('images').then((exists) =>
      exists || this.minioClient.makeBucket('images', 'us-east-1') as any,
    );
  }

}

import { Strapi } from '@strapi/strapi';
import mmm from 'mmmagic';
import fs from 'fs';
import mime from 'mime-types';
import { v4 as uuidv4 } from 'uuid';
import { Client } from 'minio';

type PreparedFile = {
  path: string,
  type: string,
  fileName: string,
  clearFileName: string,
  size: number,
  mime: string,
}

export type EditorJsService = {
  getMinioClient: () => Client,
  getMimeTypeFromFile: (path: string) => Promise<string>,
  prepareFileToUpload: (path: string, type: string, fileType?: string) => Promise<PreparedFile>,
  uploadFileToS3: (preparedFile: PreparedFile) => Promise<any>
}

export default ({ strapi }: { strapi: Strapi }): EditorJsService => ({
  getMinioClient: () => {
    return new Client({
      endPoint: strapi.config.get('fileUpload.s3minio.endPoint'),
      port: strapi.config.get('fileUpload.s3minio.port'),
      useSSL: strapi.config.get('fileUpload.s3minio.useSSL'),
      accessKey: strapi.config.get('fileUpload.s3minio.accessKey'),
      secretKey: strapi.config.get('fileUpload.s3minio.secretKey'),
    });
  },
  getMimeTypeFromFile: async function (path) {
    const magic = new mmm.Magic(mmm.MAGIC_MIME_TYPE);

    return await new Promise((resolve, reject) => {
      try {
        magic.detectFile(path, function (err, result) {
          if (err) {
            throw err;
          }

          //@ts-ignore
          resolve(result);
        });
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  },
  prepareFileToUpload: async function (path, type, fileType) {
    let detectedMimeType = await this.getMimeTypeFromFile(path);

    if (detectedMimeType === 'application/zip' && fileType) {
      detectedMimeType = fileType;
    }

    if (detectedMimeType === 'application/octet-stream' && fileType) {
      detectedMimeType = fileType;
    }

    let allowedTypes = [];
    switch (type) {
      case 'images':
        allowedTypes = strapi.config.get('fileUpload.allowedFileTypes.images');
        break;
      case 'videos':
        allowedTypes = strapi.config.get('fileUpload.allowedFileTypes.videos');
        break;
      case 'attachments':
        allowedTypes = strapi.config.get('fileUpload.allowedFileTypes.attachments');
        break;
      default:
        throw new Error('Invalid function call');
    }

    if (!allowedTypes.includes(detectedMimeType)) {
      throw new Error(`Invalid file type ${detectedMimeType} for ${type}`);
    }

    // TODO: проверять размер файла
    const fileStat = fs.statSync(path);

    const requiredExtension = mime.extension(detectedMimeType);

    const clearFileName = `${uuidv4()}.${requiredExtension}`;
    const generatedFileName = `${type}/${clearFileName}`;

    return {
      path: path,
      type: type,
      fileName: generatedFileName,
      clearFileName: clearFileName,
      size: fileStat.size,
      mime: detectedMimeType,
    };
  },
  uploadFileToS3: async function (preparedFile) {
    let metaData;
    if (preparedFile.mime === 'text/plain') {
      metaData = {
        'Content-Type': 'text/plain; charset=utf-8',
      };
    } else {
      metaData = {
        'Content-Type': preparedFile.mime,
      };
    }

    const bucket = strapi.config.get('fileUpload.s3minio.bucketName');

    const src = fs.createReadStream(preparedFile.path);

    return await new Promise((resolve, reject) => {
      const minioClient: any = this.getMinioClient();
      minioClient.putObject(bucket, preparedFile.fileName, src, preparedFile.size, metaData, function (err, objInfo) {
        if (err) {
          console.error(err);
          reject(err);
        }

        resolve(objInfo);
      });
    });
  },
});

export default ({env}) => ({
  s3: {
    baseUrl: env('S3_BASE_URL', 'https://s3.den-nsk.ru/lms-online/'),
  },
  s3minio: {
    bucketName: env('S3_MINIO_BUCKET', 'lms-online'),
    endPoint: env('S3_MINIO_ENDPOINT', 's3.den-nsk.ru'),
    port: env.int('S3_MINIO_PORT', 9000),
    useSSL: env.bool('S3_MINIO_USE_SSL', false),
    accessKey: env('S3_MINIO_ACCESS_KEY', ''),
    secretKey: env('S3_MINIO_SECRET_KEY', ''),
  },
  allowedFileTypes: {
    images: env.array('ALLOWED_IMAGES_MIME_TYPES', []),
    videos: env.array('ALLOWED_VIDEO_MIME_TYPES', []),
    attachments: env.array('ALLOWED_ATTACHMENTS_MIME_TYPES', []),
  }
});

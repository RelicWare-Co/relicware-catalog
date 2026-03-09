declare module "bun" {
  type S3ClientOptions = {
    accessKeyId?: string;
    secretAccessKey?: string;
    bucket?: string;
    endpoint?: string;
    region?: string;
    sessionToken?: string;
    virtualHostedStyle?: boolean;
    acl?: string;
  };

  type S3WriteOptions = {
    type?: string;
    contentEncoding?: string;
    contentDisposition?: string;
    acl?: string;
  };

  export class S3Client {
    constructor(options?: S3ClientOptions);

    write(
      path: string,
      data:
        | string
        | Uint8Array
        | ArrayBuffer
        | Blob
        | ReadableStream
        | Response
        | Request,
      options?: S3WriteOptions,
    ): Promise<number>;

    delete(path: string): Promise<void>;
  }
}
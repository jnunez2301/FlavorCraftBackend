import { S3Client, PutObjectCommand, DeleteObjectCommand } from "npm:@aws-sdk/client-s3@3.631.0";
import { CloudFrontClient, CreateInvalidationCommand } from "npm:@aws-sdk/client-cloudfront"
import { AWS_CLOUDFRONT_DISTRIBUTION_ID, AWS_CLOUDFRONT_URL, AWS_REGION } from "./Environment.ts";
import { AWS_SECRET_KEY } from "./Environment.ts";
import { AWS_ACCESS_KEY } from "./Environment.ts";
import { AWS_BUCKET } from "./Environment.ts";

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
  },
});

const cloudFrontClient = new CloudFrontClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
  },
});

export async function s3StoreImg(base64String: string, fileName: string): Promise<string | undefined> {
  try {
    // Extract the base64 data and decode it
    const base64Data = base64String.split(",")[1]; // Remove the data URL part
    const binaryData = atob(base64Data); // Decode base64 to binary string
    const byteArray = new Uint8Array(binaryData.length); // Create a Uint8Array to hold binary data

    for (let i = 0; i < binaryData.length; i++) {
      byteArray[i] = binaryData.charCodeAt(i);
    }
    fileName = fileName.split(" ").join("").toLocaleLowerCase();
    const params = {
      Bucket: AWS_BUCKET,
      Key: fileName,
      Body: byteArray,
    };
    s3DeleteImg(fileName);
    const command = new PutObjectCommand(params);
    const fileUrl = `${AWS_CLOUDFRONT_URL}/${fileName}`;
    await s3Client.send(command);
    return fileUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    return undefined;
  }
}
export async function s3DeleteImg(fileName: string): Promise<boolean> {
  try {
    const params = {
      Bucket: AWS_BUCKET,
      Key: fileName,
    };
    const uniqueCallerReference = `${fileName}-${Date.now()}`;

    const invalidationParams = {
      DistributionId: AWS_CLOUDFRONT_DISTRIBUTION_ID,
      InvalidationBatch: {
        CallerReference: uniqueCallerReference,
        Paths: {
          Quantity: 1,
          Items: [
            "/" + fileName,
          ],
        },
      },
    };
    const invalidationCommand = new CreateInvalidationCommand(invalidationParams);
    await cloudFrontClient.send(invalidationCommand);
    await s3Client.send(new DeleteObjectCommand(params));
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}
export default s3Client;
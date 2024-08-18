import { S3Client, PutObjectCommand } from "npm:@aws-sdk/client-s3@3.631.0";
import { AWS_REGION } from "./Environment.ts";
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

export async function s3StoreImg(base64String: string, fileName: string): Promise<string | undefined> {
  try {
    // Extract the base64 data and decode it
    const base64Data = base64String.split(",")[1]; // Remove the data URL part
    const binaryData = atob(base64Data); // Decode base64 to binary string
    const byteArray = new Uint8Array(binaryData.length); // Create a Uint8Array to hold binary data

    for (let i = 0; i < binaryData.length; i++) {
      byteArray[i] = binaryData.charCodeAt(i);
    }

    const params = {
      Bucket: AWS_BUCKET,
      Key: fileName,
      Body: byteArray,
    };

    const command = new PutObjectCommand(params);
    const fileUrl = `https://${AWS_BUCKET}.s3.amazonaws.com/${fileName}`;
    await s3Client.send(command);
    return fileUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    return undefined;
  }
}
export default s3Client;
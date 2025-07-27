import { useState, useCallback } from "react";
import { S3UploadService, type CustomFile } from "../infra/S3UploadService";
import { generateMD5Base64 } from "../infra/crypto";

export const useBatchUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadService] = useState(() => new S3UploadService());

  const [runTime, setRunTime] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function uploadFilesBatch(files: File[]): Promise<Response[]> {
    const results: Response[] = [];
    const customFiles: CustomFile[] = [];

    const md5Promises = files.map(async (file) => {
      const md5Hash = await generateMD5Base64(file);
      return { file, md5: md5Hash, preSignedUrl: "" };
    });
    
    const resolvedCustomFiles = await Promise.all(md5Promises);
    customFiles.push(...resolvedCustomFiles);

    const urlPromises = customFiles.map(async (customFile) => {
      const signedUrl = await uploadService.generateSignedUploadUrl(
        customFile.file.name
      );
      customFile.preSignedUrl = signedUrl;
    });
    
    await Promise.all(urlPromises);

    const uploadPromises = customFiles.map(async (customFile) => {
      return await uploadService.uploadSingleFile(
        customFile,
        customFile.preSignedUrl
      );
    });
    
    const uploadResults = await Promise.all(uploadPromises);
    results.push(...uploadResults);

    return results;
  }

  const handleAsyncBatchUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setRunTime(null);
    const startTime = performance.now();

    try {
      const results = await uploadFilesBatch(files);

      results.forEach((response) => {
        if (response.ok) {
          console.log("File uploaded successfully:", response);
        } else {
          console.error("File upload failed:", response.statusText);
        }
      });
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      const endTime = performance.now();
      console.log(
        `Batch upload completed in ${(endTime - startTime).toFixed(2)} ms`
      );
      setRunTime(`${(endTime - startTime).toFixed(2)} ms`);
      setIsUploading(false);
    }
  };

  const resetUploads = useCallback(() => {
    setFiles([]);
  }, []);

  return {
    files,
    setFiles,
    runTime,
    isUploading,

    handleAsyncBatchUpload,
    resetUploads,
  };
};

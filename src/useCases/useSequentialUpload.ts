import { useState, useCallback } from "react";
import { S3UploadService, type CustomFile } from "../infra/S3UploadService";
import { generateMD5Base64 } from "../infra/crypto";

export const useSequentialUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadService] = useState(() => new S3UploadService());

  const [runTime, setRunTime] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function uploadFilesSequentially(files: File[]): Promise<Response[]> {
    const results: Response[] = [];
    const customFiles: CustomFile[] = [];

    for (const file of files) {
      const md5Hash = await generateMD5Base64(file);
      customFiles.push({ file, md5: md5Hash, preSignedUrl: "" });
    }

    for (const customFile of customFiles) {
      const signedUrl = await uploadService.generateSignedUploadUrl(
        customFile.file.name
      );
      customFile.preSignedUrl = signedUrl;
    }

    for (const customFile of customFiles) {
      const result = await uploadService.uploadSingleFile(
        customFile,
        customFile.preSignedUrl
      );
      results.push(result);
    }

    return results;
  }

  const handleSequentialUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setRunTime(null);
    const startTime = performance.now();

    try {
      const results = await uploadFilesSequentially(files);

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
        `Sequential upload completed in ${(endTime - startTime).toFixed(2)} ms`
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

    handleSequentialUpload,
    resetUploads,
  };
};

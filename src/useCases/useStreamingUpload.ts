import { useState, useCallback, useRef } from "react";
import { Mutex } from "async-mutex";
import { S3UploadService, type CustomFile } from "../infra/S3UploadService";
import { generateMD5Base64 } from "../infra/crypto";
import type { FileProgress } from "../types/uploadProgress";

export const useStreamingUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadService] = useState(() => new S3UploadService());

  const [runTime, setRunTime] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const completedCountRef = useRef(0);
  const failedCountRef = useRef(0);
  const counterMutex = useRef(new Mutex()).current;

  const resultsRef = useRef<Response[]>([]);
  const [fileProgress, setFileProgress] = useState<FileProgress[]>([]);
  const stateMutex = useRef(new Mutex()).current;

  async function uploadFilesStreaming(files: File[]): Promise<Response[]> {
    completedCountRef.current = 0;
    failedCountRef.current = 0;
    resultsRef.current = new Array(files.length);

    const initialProgress: FileProgress[] = files.map((file, index) => ({
      id: index,
      fileName: file.name,
      phase: "waiting",
      progress: 0,
      startTime: performance.now(),
    }));

    setFileProgress(initialProgress);

    const updateFileProgress = async (
      index: number,
      phase: FileProgress["phase"],
      progress?: number
    ) => {
      await stateMutex.runExclusive(async () => {
        setFileProgress((prev) =>
          prev.map((file, i) =>
            i === index
              ? { ...file, phase, progress: progress ?? file.progress }
              : file
          )
        );
      });
    };

    const setResult = async (index: number, result: Response) => {
      resultsRef.current[index] = result;

      await counterMutex.runExclusive(async () => {
        if (result.ok) {
          completedCountRef.current += 1;
          console.log(
            `MUTEX ACCESS: Incremented completed count to ${completedCountRef.current}`
          );
        } else {
          failedCountRef.current += 1;
          console.log(
            `MUTEX ACCESS: Incremented failed count to ${failedCountRef.current}`
          );
        }
      });

      await updateFileProgress(
        index,
        result.ok ? "completed" : "failed",
        result.ok ? 100 : 0
      );
    };

    const processFile = async (file: File, index: number) => {
      try {
        console.log(
          `Starting streaming process for file ${index + 1}: ${file.name}`
        );

        await updateFileProgress(index, "md5", 25);
        console.log(
          `Phase 1 - MD5 generation for file ${index + 1}: ${file.name}`
        );
        const md5Hash = await generateMD5Base64(file);

        await updateFileProgress(index, "url", 50);
        console.log(
          `Phase 2 - URL generation for file ${index + 1}: ${file.name}`
        );

        const signedUrl = await uploadService.generateSignedUploadUrl(
          file.name
        );

        await updateFileProgress(index, "upload", 75);
        console.log(
          `Phase 3 - Upload starting for file ${index + 1}: ${file.name}`
        );
        const customFile: CustomFile = {
          file,
          md5: md5Hash,
          preSignedUrl: signedUrl,
        };

        const result = await uploadService.uploadSingleFile(
          customFile,
          signedUrl
        );

        await setResult(index, result);

        console.log(
          `Streaming upload completed for file ${index + 1}: ${file.name}`
        );
        return result;
      } catch (error) {
        console.error(
          `Streaming upload failed for file ${index + 1}: ${file.name}`,
          error
        );

        const failedResponse = new Response(null, {
          status: 500,
          statusText: error instanceof Error ? error.message : "Unknown error",
        });

        await setResult(index, failedResponse);
        return failedResponse;
      }
    };

    const streamPromises = files.map((file, index) => processFile(file, index));
    await Promise.all(streamPromises);

    console.log(
      `All streaming uploads completed - Processed: ${completedCountRef.current} success, ${failedCountRef.current} failed`
    );

    return resultsRef.current;
  }

  const handleStreamingUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setRunTime(null);
    const startTime = performance.now();

    try {
      const results = await uploadFilesStreaming(files);

      results.forEach((response, index) => {
        if (response && response.ok) {
          console.log(`File ${index + 1} uploaded successfully:`, response);
        } else {
          console.error(
            `File ${index + 1} upload failed:`,
            response?.statusText || "Unknown error"
          );
        }
      });
    } catch (error) {
      console.error("Streaming upload error:", error);
    } finally {
      const endTime = performance.now();
      console.log(
        `Streaming upload completed in ${(endTime - startTime).toFixed(2)} ms`
      );
      setRunTime(`${(endTime - startTime).toFixed(2)} ms`);
      setIsUploading(false);
    }
  };

  const resetUploads = useCallback(() => {
    setFiles([]);
    setFileProgress([]);
    completedCountRef.current = 0;
    failedCountRef.current = 0;
    resultsRef.current = [];
  }, []);

  return {
    files,
    setFiles,
    runTime,
    isUploading,
    fileProgress,

    handleStreamingUpload,
    resetUploads,
  };
};

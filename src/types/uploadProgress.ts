export interface FileProgress {
  id: number;
  fileName: string;
  phase: 'waiting' | 'md5' | 'url' | 'upload' | 'completed' | 'failed';
  progress: number;
  startTime?: number;
  endTime?: number;
}

export interface BaseUploadHookReturn {
  files: File[];
  setFiles: (files: File[]) => void;
  runTime: string | null;
  isUploading: boolean;
  resetUploads: () => void;
}

export interface StreamingUploadHookReturn extends BaseUploadHookReturn {
  fileProgress: FileProgress[];
}

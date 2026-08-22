"use client";

import { useUploadThing } from "@/utils/uploadthing";
import { useDropzone } from "@uploadthing/react";
import { AlertCircle, FileImage, RefreshCw, Upload } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import {
  generateClientDropzoneAccept,
  generatePermittedFileTypes,
} from "uploadthing/client";
import { toast } from "./use-toast";

type InputUploadProps = {
  onUpload: (url: string) => void;
  multiple?: boolean;
  value?: string;
};

export const InputUpload = ({
  onUpload,
  multiple = false,
  value,
}: InputUploadProps) => {
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(value ?? null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { startUpload, isUploading, routeConfig } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      if (res?.[0]) {
        const fileUrl = res[0].ufsUrl;
        setUploadedUrl(fileUrl);
        onUpload(fileUrl);
        setUploadProgress(0);
        setUploadError(null);
        toast({
          title: "Upload concluído!",
          variant: "success",
        });
      }
    },
    onUploadError: (error: Error) => {
      setUploadProgress(0);
      setUploadError(error.message);
      toast({
        title: `Erro no upload: ${error.message}`,
        variant: "destructive",
      });
    },
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadError(null);
      void startUpload(acceptedFiles);
    }
  }, [startUpload]);

  const { getRootProps, getInputProps, isDragActive: dropzoneDragActive } = useDropzone({
    onDrop,
    accept: generateClientDropzoneAccept(
      generatePermittedFileTypes(routeConfig).fileTypes,
    ),
    maxSize: 4 * 1024 * 1024,
    multiple: false,
  });

  return (
    <div className="space-y-2">
      <div className="relative flex w-full items-center justify-center overflow-hidden rounded-md border border-input max-w-[600px] min-h-[300px] mx-auto">
        {uploadedUrl && (
          <Image
            width={600}
            height={600}
            src={uploadedUrl}
            alt="Uploaded image"
            className="max-w-[600px] max-h-[600px] w-full h-auto object-contain"
          />
        )}
        
        <div 
          {...getRootProps()}
          className={`${
            uploadedUrl 
              ? 'absolute inset-0 flex items-center justify-center' 
              : 'w-full h-full min-h-[14rem]'
          } cursor-pointer transition-all duration-200`}
        >
          <input {...getInputProps()} />
          
          <div className={`${
            uploadedUrl 
              ? `w-80 h-40 ${
                  dropzoneDragActive || isUploading 
                    ? 'bg-black/60' 
                    : 'bg-black/40'
                } backdrop-blur-sm hover:bg-black/60 rounded-lg` 
              : `w-full h-full border-input hover:border-orange-400 rounded-md ${
                  dropzoneDragActive ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' : ''
                } ${isUploading ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' : ''}`
          } flex flex-col items-center justify-center p-6 transition-all duration-200`}>
          
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-3"></div>
                <p className={`text-sm ${uploadedUrl ? 'text-white' : 'text-muted-foreground'} font-medium mb-2`}>
                  Enviando imagem...
                </p>
                <div className={`w-48 h-2 ${uploadedUrl ? 'bg-white/20' : 'bg-gray-200'} rounded-full overflow-hidden mb-1`}>
                  <div 
                    className="h-full bg-orange-500 transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className={`text-xs ${uploadedUrl ? 'text-white/80' : 'text-muted-foreground'}`}>
                  {uploadProgress}% concluído
                </p>
              </>
            ) : uploadError ? (
              <>
                <div className={`mb-3 ${uploadedUrl ? 'text-red-400' : 'text-red-500'}`}>
                  <AlertCircle className="h-8 w-8" />
                </div>
                <p className={`text-sm ${uploadedUrl ? 'text-red-400' : 'text-red-500'} font-medium mb-2 text-center`}>
                  Erro no upload
                </p>
                <p className={`text-xs ${uploadedUrl ? 'text-white/80' : 'text-muted-foreground'} text-center mb-3 max-w-64`}>
                  {uploadError}
                </p>
                <div className={`flex items-center gap-1 ${uploadedUrl ? 'text-white/90' : 'text-muted-foreground'}`}>
                  <RefreshCw className="h-3 w-3" />
                  <p className="text-xs">
                    Clique para tentar novamente
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className={`mb-3 text-white`}>
                  {dropzoneDragActive ? (
                    <FileImage className="h-8 w-8" />
                  ) : (
                    <Upload className="h-8 w-8" />
                  )}
                </div>
                <p className={`text-sm text-orange-500 font-medium mb-2 text-center`}>
                  {dropzoneDragActive 
                    ? "Solte a imagem aqui" 
                    : uploadedUrl 
                      ? "Selecione ou arraste uma imagem" 
                      : "Selecione ou arraste uma imagem"
                  }
                </p>
                <p className={`text-xs ${uploadedUrl ? 'text-white/90' : 'text-muted-foreground'} text-center mb-1`}>
                  Aceita PNG, JPEG, WEBP (máx. 4MB)     
                </p>
                <p className={`text-xs ${uploadedUrl ? 'text-white/80' : 'text-muted-foreground'} text-center`}>
                  Dimensão ideal: 600 x 600px
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

"use client";

import { Camera, ImageIcon, Upload } from "lucide-react";
import React, { useCallback, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "./ui/button";

export default function ImageUploader({ onImageSelect, loading }) {
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      const reader = new FileReader();

      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      onImageSelect(file);
    },
    [onImageSelect],
  );
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    noClick: true,
    noKeyboard: true,
  });

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onDrop([file]);
    }
  };

  if (preview) {
    return <div className=""></div>;
  }

  return (
    <>
      <div
        {...getRootProps()}
        className={`relative w-full aspect-square border-2 border-dashed rounded-2xl transtion-all cursor-pointer ${
          isDragActive
            ? "border-orange-600 bg-orange-50 scale-[1.02]"
            : "border-stone-300 bg-stone-50 hover:border-orange-400 hover:bg-orange-50/50"
        }`}
      >
        <input {...getInputProps()} />

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
          <div
            className={`p-4 rounded-full transition-all ${
              isDragActive ? "bg-orange-600 scale-110" : "bg-orange-100"
            }`}
          >
            {isDragActive ? (
              <ImageIcon className="w-8 h-8 text-white" />
            ) : (
              <Camera className="w-8 h-8 text-orange-600" />
            )}
          </div>

          <div>
            <h3 className="text-xl font-bold text-stone-900 mb-2">
              {isDragActive ? "Drop the image here" : "Scan your pantry items"}
            </h3>
            <p className="text-stone-600 text-sm max-w-sm">
              {isDragActive
                ? "Release to upload"
                : "Take a photo or drag & drop an image of your pantry"}
            </p>
          </div>

          {!isDragActive && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current.click();
                }}
                className="gap-2"
                variant="primary"
              >
                <Camera className="w-4 h-4" /> Take Photo
              </Button>

              <Button
                type="button"
                variant='outline'
                onClick={(e) => {
                    e.stopPropagation();
                    open();
                }}
                className="border-orange-200 text-orange-700 hover:bg-orange-50 gap-2"
              >
                <Upload className="w-4 h-4" /> Browse Files
              </Button>
            </div>
          )}

          <p className="text-xs text-stone-400">
            Supports JPEG, PNG, WebP | Max : 10MB.
          </p>
        </div>
      </div>

      {/* Hidden file input for taking photos in mobile */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </>
  );
}

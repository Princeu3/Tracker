"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Paperclip, Upload, Download, Trash2, Image, FileText, File, Eye } from "lucide-react";
import { toast } from "sonner";
import { deleteFile } from "@/actions/file";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/lib/constants";
import type { Attachment } from "@/types";

type Props = {
  value: string[];
  attachments: Attachment[];
  trackerId: string;
  rowId: string;
  columnId: string;
  onChange: (value: string[]) => void;
};

function getFileIcon(fileType: string) {
  if (fileType.startsWith("image/")) return Image;
  if (fileType === "application/pdf") return FileText;
  return File;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileCell({ value, attachments, trackerId, rowId, columnId, onChange }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<Attachment | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ALLOWED_FILE_TYPES.reduce(
      (acc, type) => ({ ...acc, [type]: [] }),
      {}
    ),
    maxSize: MAX_FILE_SIZE,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      setUploading(true);
      try {
        const newIds: string[] = [];
        for (const file of acceptedFiles) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("trackerId", trackerId);
          formData.append("rowId", rowId);
          formData.append("columnId", columnId);

          const res = await fetch("/api/files/upload", {
            method: "POST",
            body: formData,
          });
          if (!res.ok) throw new Error("Upload failed");
          const attachment = await res.json();
          newIds.push(attachment.id);
        }
        onChange([...value, ...newIds]);
        router.refresh();
        toast.success("File uploaded");
      } catch {
        toast.error("Failed to upload file");
      } finally {
        setUploading(false);
      }
    },
  });

  function handleDelete(fileId: string) {
    startTransition(async () => {
      await deleteFile(fileId);
      onChange(value.filter((id) => id !== fileId));
      router.refresh();
      toast.success("File deleted");
    });
  }

  const count = attachments.length;

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button className="flex h-8 w-full items-center gap-1.5 px-2 text-sm hover:bg-accent/50 transition-colors">
            {count > 0 ? (
              <>
                <Paperclip className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {count} file{count !== 1 ? "s" : ""}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground/50">+ Add</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-2" align="start">
          <div className="space-y-2">
            {attachments.length > 0 && (
              <div className="max-h-48 space-y-1 overflow-y-auto">
                {attachments.map((file) => {
                  const Icon = getFileIcon(file.fileType);
                  return (
                    <div
                      key={file.id}
                      className="flex items-center gap-2 rounded-md p-1.5 hover:bg-accent/50"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">{file.fileName}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatFileSize(file.fileSize)}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-0.5">
                        {file.fileType.startsWith("image/") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setPreviewFile(file)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                          <a href={`/api/files/${file.id}`} download>
                            <Download className="h-3 w-3" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleDelete(file.id)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div
              {...getRootProps()}
              className={`rounded-md border border-dashed p-3 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground">
                {uploading ? "Uploading..." : "Drop files or click to browse"}
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewFile?.fileName}</DialogTitle>
          </DialogHeader>
          {previewFile && (
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/files/${previewFile.id}`}
                alt={previewFile.fileName}
                className="max-h-[70vh] object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Check } from "lucide-react";
import { ImageData, SectionConfig } from "@/types/presentation";

interface ImageUploadZoneProps {
  config: SectionConfig;
  images: ImageData[];
  onImagesChange: (images: ImageData[]) => void;
}

export const ImageUploadZone = ({ config, images, onImagesChange }: ImageUploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      
      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );
      
      addFiles(files);
    },
    [images, config.maxFiles]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
    e.target.value = "";
  };

  const addFiles = async (files: File[]) => {
    const remainingSlots = config.maxFiles - images.length;
    const filesToAdd = files.slice(0, remainingSlots);
    
    // Convert files to base64 for persistence
    const newImages: ImageData[] = await Promise.all(
      filesToAdd.map(async (file) => {
        const base64 = await fileToBase64(file);
        return {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          preview: base64, // Use base64 instead of object URL for persistence
        };
      })
    );
    
    onImagesChange([...images, ...newImages]);
  };

  // Helper function to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const removeImage = (id: string) => {
    // No need to revoke URL since we're using base64 now
    onImagesChange(images.filter((img) => img.id !== id));
  };

  const isFull = images.length >= config.maxFiles;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border p-6"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold text-foreground uppercase tracking-wide">
            {config.title}
          </h3>
          {config.required && (
            <span className="text-xs border border-foreground px-2 py-0.5 font-medium">
              Obrigatório
            </span>
          )}
        </div>
        <div className="text-sm font-mono text-muted-foreground">
          {images.length}/{config.maxFiles}
        </div>
      </div>
      
      <p className="text-muted-foreground text-sm mb-4">{config.subtitle}</p>

      {!isFull && (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`
            flex flex-col items-center justify-center gap-3 p-8 
            border border-dashed cursor-pointer
            transition-all duration-200
            ${isDragging 
              ? "border-foreground bg-muted" 
              : "border-border hover:border-foreground hover:bg-muted/50"
            }
          `}
        >
          <input
            type="file"
            accept="image/*"
            multiple={config.maxFiles > 1}
            onChange={handleFileSelect}
            className="hidden"
          />
          <motion.div
            animate={{ scale: isDragging ? 1.1 : 1 }}
            className="w-10 h-10 border border-foreground flex items-center justify-center"
          >
            <Upload className="w-5 h-5 text-foreground" />
          </motion.div>
          <div className="text-center">
            <p className="font-medium text-foreground text-sm">
              Clique ou arraste imagens aqui
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG até 10MB
            </p>
          </div>
        </label>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4">
          <AnimatePresence mode="popLayout">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="relative aspect-[4/3] border border-border overflow-hidden group bg-muted"
              >
                <img
                  src={image.preview}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-contain bg-muted"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute top-1 right-1 w-5 h-5 bg-foreground text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-1 left-1 bg-foreground text-background text-xs px-1.5 py-0.5 font-mono">
                  {index + 1}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {isFull && (
        <div className="flex items-center gap-2 mt-4 p-3 border border-foreground text-foreground">
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">Máximo de imagens atingido</span>
        </div>
      )}
    </motion.div>
  );
};

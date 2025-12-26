import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2, Plus, Link, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  folder?: string;
  maxImages?: number;
}

const MultiImageUpload = ({
  value = [],
  onChange,
  label = "ইমেজ সমূহ",
  folder = "products",
  maxImages = 10,
}: MultiImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - value.length;
    if (remainingSlots <= 0) {
      toast.error(`সর্বোচ্চ ${maxImages}টি ইমেজ যোগ করা যাবে`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    // Validate files
    for (const file of filesToUpload) {
      if (!file.type.startsWith("image/")) {
        toast.error("শুধুমাত্র ইমেজ ফাইল আপলোড করা যাবে");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("প্রতিটি ফাইল সাইজ ৫MB এর বেশি হতে পারবে না");
        return;
      }
    }

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of filesToUpload) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("admin-uploads")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("admin-uploads")
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      onChange([...value, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length}টি ইমেজ আপলোড হয়েছে`);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("আপলোড ব্যর্থ হয়েছে");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      if (value.length >= maxImages) {
        toast.error(`সর্বোচ্চ ${maxImages}টি ইমেজ যোগ করা যাবে`);
        return;
      }
      onChange([...value, urlInput.trim()]);
      setUrlInput("");
      setShowUrlInput(false);
    }
  };

  const handleRemove = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const newUrls = [...value];
    const [removed] = newUrls.splice(from, 1);
    newUrls.splice(to, 0, removed);
    onChange(newUrls);
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>

      {/* Image Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {value.map((url, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted"
            >
              <img
                src={url}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={() => moveImage(index, index - 1)}
                  disabled={index === 0}
                >
                  ←
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={() => moveImage(index, index + 1)}
                  disabled={index === value.length - 1}
                >
                  →
                </Button>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(index)}
              >
                <X className="w-3 h-3" />
              </Button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                  প্রধান
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add More Images */}
      {value.length < maxImages && (
        <div className="space-y-2">
          <div
            className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer bg-muted/30 flex items-center justify-center gap-3"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">আপলোড হচ্ছে...</span>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">ইমেজ যোগ করুন</p>
                  <p className="text-sm text-muted-foreground">
                    {value.length}/{maxImages} ইমেজ
                  </p>
                </div>
              </>
            )}
          </div>

          {/* URL Input */}
          {showUrlInput ? (
            <div className="flex gap-2">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleUrlSubmit())}
              />
              <Button type="button" onClick={handleUrlSubmit} size="sm">
                যোগ করুন
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowUrlInput(false)}>
                বাতিল
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowUrlInput(true)}
            >
              <Link className="w-4 h-4 mr-2" />
              URL দিয়ে যোগ করুন
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiImageUpload;

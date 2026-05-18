import { useState } from "react";
import { Camera, Loader2, Save, X, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { apiUrl } from "@/lib/api";

interface ThumbnailCaptureProps {
  episodeId: string;
  animeId: string;
  videoUrl: string;
  currentThumbnail?: string | null;
  onClose: () => void;
  onSaved: (thumbnailUrl: string) => void;
}

const ThumbnailCapture = ({
  episodeId,
  animeId,
  videoUrl,
  currentThumbnail,
  onClose,
  onSaved,
}: ThumbnailCaptureProps) => {
  const [timestamp, setTimestamp] = useState(90);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleCapture = async () => {
    setIsCapturing(true);
    setCapturedImage(null);
    try {
      const res = await fetch(apiUrl("/api/extract-frame"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl, timestamp }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Ismeretlen hiba");
      setCapturedImage(data.image);
    } catch (err: any) {
      toast.error("Generálás sikertelen: " + (err.message || "Ismeretlen hiba"));
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSave = async () => {
    if (!capturedImage) return;
    setIsSaving(true);
    try {
      const byteString = atob(capturedImage.split(",")[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
      const blob = new Blob([ab], { type: "image/jpeg" });

      const fileName = `thumbnails/${animeId}/${episodeId}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("animek")
        .upload(fileName, blob, { upsert: true, contentType: "image/jpeg" });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("animek").getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from("episodes")
        .update({ thumbnail_url: publicUrl } as any)
        .eq("id", episodeId);

      if (dbError) throw dbError;

      toast.success("Thumbnail elmentve!");
      onSaved(publicUrl);
      onClose();
    } catch (err: any) {
      toast.error("Mentés sikertelen: " + (err.message || "Ismeretlen hiba"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-xl w-full max-w-md p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Thumbnail generálás
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Current thumbnail */}
        {currentThumbnail && !capturedImage && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Jelenlegi thumbnail</Label>
            <img
              src={currentThumbnail}
              alt="jelenlegi thumbnail"
              className="w-full rounded-lg object-cover aspect-video bg-black/30"
            />
          </div>
        )}

        {/* Newly captured image */}
        {capturedImage && (
          <div className="space-y-1">
            <Label className="text-xs text-green-400">Generált képkocka</Label>
            <img
              src={capturedImage}
              alt="generált thumbnail"
              className="w-full rounded-lg object-cover aspect-video bg-black/30"
            />
          </div>
        )}

        {/* Placeholder if nothing yet */}
        {!currentThumbnail && !capturedImage && (
          <div className="w-full aspect-video rounded-lg bg-accent/40 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageOff className="h-8 w-8" />
            <span className="text-sm">Még nincs thumbnail</span>
          </div>
        )}

        {/* Timestamp input + capture button */}
        <div className="flex items-end gap-3">
          <div className="flex-1 space-y-1">
            <Label className="text-sm">Időbélyeg (másodperc)</Label>
            <Input
              type="number"
              min={1}
              max={9999}
              value={timestamp}
              onChange={(e) => setTimestamp(Number(e.target.value) || 30)}
              className="bg-background"
            />
          </div>
          <Button onClick={handleCapture} disabled={isCapturing} className="gap-2 shrink-0">
            {isCapturing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
            {isCapturing ? "Generálás..." : capturedImage ? "Újra" : "Generálás"}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Az epizód adott másodpercénél lévő képkocka lesz a thumbnail. Ajánlott: 90 mp (OP után).
        </p>

        {capturedImage && (
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? "Mentés..." : "Thumbnail mentése"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ThumbnailCapture;

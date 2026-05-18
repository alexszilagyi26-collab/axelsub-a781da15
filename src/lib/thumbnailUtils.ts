import { supabase } from "@/integrations/supabase/client";
import { apiUrl } from "@/lib/api";

export async function saveThumbnailBlob(
  blob: Blob,
  animeId: string,
  episodeId: string
): Promise<string | null> {
  try {
    const fileName = `thumbnails/${animeId}/${episodeId}.jpg`;
    const { error } = await supabase.storage
      .from("animek")
      .upload(fileName, blob, { upsert: true, contentType: "image/jpeg" });
    if (error) return null;

    const { data: { publicUrl } } = supabase.storage.from("animek").getPublicUrl(fileName);

    await supabase
      .from("episodes")
      .update({ thumbnail_url: publicUrl } as any)
      .eq("id", episodeId);

    return publicUrl;
  } catch {
    return null;
  }
}

export async function autoGenerateThumbnailFromUrl(
  animeId: string,
  episodeId: string,
  videoUrl: string,
  timestamp = 90
): Promise<void> {
  try {
    const res = await fetch(apiUrl("/api/extract-frame"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoUrl, timestamp }),
    });
    if (!res.ok) return;
    const data = await res.json();
    if (!data.ok || !data.image) return;

    const byteString = atob(data.image.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    const blob = new Blob([ab], { type: "image/jpeg" });

    await saveThumbnailBlob(blob, animeId, episodeId);
  } catch {
  }
}

export function captureVideoFrameToBlob(
  videoElement: HTMLVideoElement
): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(null);
      ctx.drawImage(videoElement, 0, 0, 640, 360);
      canvas.toBlob(
        (blob) => resolve(blob),
        "image/jpeg",
        0.85
      );
    } catch {
      resolve(null);
    }
  });
}

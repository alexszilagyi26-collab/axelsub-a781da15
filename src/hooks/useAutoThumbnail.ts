import { isEmbedUrl } from "@/components/EmbedPlayer";

const DIRECT_VIDEO_EXTS = [".mp4", ".mkv", ".webm", ".m3u8", ".ts"];

export function isDirectVideoUrl(url: string | null): boolean {
  if (!url) return false;
  if (isEmbedUrl(url)) return false;
  const lower = url.toLowerCase();
  return DIRECT_VIDEO_EXTS.some((ext) => lower.includes(ext));
}

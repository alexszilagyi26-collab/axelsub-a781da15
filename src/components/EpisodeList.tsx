import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Play, Loader2, FastForward, Server, Subtitles, CheckCircle2, CheckCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { isDirectVideoUrl } from "@/hooks/useAutoThumbnail";

export interface Episode {
  id: string;
  anime_id: string;
  episode_number: number;
  title: string | null;
  video_url: string;
  created_at: string;
  op_start: string | null;
  op_end: string | null;
  ed_start: string | null;
  ed_end: string | null;
  backup_video_url: string | null;
  quality_360p: string | null;
  quality_480p: string | null;
  quality_720p: string | null;
  quality_1080p: string | null;
  subtitle_url: string | null;
  subtitle_type: string | null;
  thumbnail_url: string | null;
}

interface EpisodeCardProps {
  episode: Episode;
  index: number;
  isSelected: boolean;
  isCompleted: boolean;
  isInProgress: boolean;
  progressPct: number;
  onSelectEpisode: (episode: Episode) => void;
}

const EpisodeCard = ({
  episode,
  index,
  isSelected,
  isCompleted,
  isInProgress,
  progressPct,
  onSelectEpisode,
}: EpisodeCardProps) => {
  const hasThumbnail = !!episode.thumbnail_url;
  const hasDirectVideo = isDirectVideoUrl(episode.video_url);
  const showVideoThumb = !hasThumbnail && hasDirectVideo;

  const hasSkipButtons = (episode.op_start && episode.op_end) || (episode.ed_start && episode.ed_end);
  const hasBackup = !!episode.backup_video_url;
  const hasSubtitle = !!episode.subtitle_url;
  const hasMultiQuality = episode.quality_360p || episode.quality_480p || episode.quality_720p || episode.quality_1080p;

  return (
    <motion.button
      key={episode.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onSelectEpisode(episode)}
      className={`relative flex items-center gap-3 p-3 rounded-lg transition-all text-left w-full overflow-hidden ${
        isSelected
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
          : isCompleted
          ? "bg-green-950/60 hover:bg-green-900/60 border border-green-700/50 text-foreground"
          : isInProgress
          ? "bg-card hover:bg-accent border border-primary/40 text-foreground"
          : "bg-card hover:bg-accent border border-border text-foreground"
      }`}
    >
      {isInProgress && !isSelected && (
        <div
          className="absolute bottom-0 left-0 h-0.5 bg-primary/60 rounded-b-lg transition-all"
          style={{ width: `${progressPct}%` }}
        />
      )}

      {/* Thumbnail or episode number badge */}
      {hasThumbnail || showVideoThumb ? (
        <div className="relative w-16 h-10 rounded-md overflow-hidden flex-shrink-0 bg-black">
          {hasThumbnail ? (
            <img
              src={episode.thumbnail_url!}
              alt={`${episode.episode_number}. epizód`}
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              src={episode.video_url}
              muted
              playsInline
              preload="metadata"
              className="w-full h-full object-cover"
              onLoadedMetadata={(e) => {
                const vid = e.currentTarget;
                vid.currentTime = Math.min(30, vid.duration * 0.1);
              }}
            />
          )}
          {isSelected && (
            <div className="absolute inset-0 bg-primary/40 flex items-center justify-center">
              <Play className="h-4 w-4 fill-current text-white" />
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] font-bold text-center leading-4">
            {episode.episode_number}
          </div>
          {isCompleted && !isSelected && (
            <div className="absolute top-0.5 right-0.5">
              <CheckCircle2 className="h-4 w-4 text-green-400 drop-shadow" />
            </div>
          )}
        </div>
      ) : (
        <div className="relative flex-shrink-0">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
              isSelected
                ? "bg-primary-foreground/20 text-primary-foreground"
                : isCompleted
                ? "bg-green-500/20 text-green-400"
                : isInProgress
                ? "bg-primary/20 text-primary"
                : "bg-primary/10 text-primary"
            }`}
          >
            {episode.episode_number}
          </div>
          {isCompleted && !isSelected && (
            <div className="absolute -bottom-1 -right-1 bg-background rounded-full">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
            </div>
          )}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">
          {episode.title || `${episode.episode_number}. epizód`}
        </p>
        <div className="flex gap-1 mt-1 items-center">
          {isCompleted && !isSelected && (
            <span className="text-[10px] font-semibold text-green-400 mr-0.5">Megnézve</span>
          )}
          {isInProgress && !isSelected && (
            <span className="text-[10px] font-semibold text-primary mr-0.5">{progressPct}%</span>
          )}
          {hasSkipButtons && (
            <FastForward className={`h-3 w-3 ${isSelected ? "text-primary-foreground/70" : "text-cyan-400"}`} />
          )}
          {hasBackup && (
            <Server className={`h-3 w-3 ${isSelected ? "text-primary-foreground/70" : "text-green-400"}`} />
          )}
          {hasSubtitle && (
            <Subtitles className={`h-3 w-3 ${isSelected ? "text-primary-foreground/70" : "text-yellow-400"}`} />
          )}
          {hasMultiQuality && (
            <span className={`text-[10px] font-medium ${isSelected ? "text-primary-foreground/70" : "text-purple-400"}`}>
              HD
            </span>
          )}
        </div>
      </div>

      {!hasThumbnail && !showVideoThumb && (
        <Play
          className={`h-4 w-4 flex-shrink-0 ${
            isSelected ? "fill-current" : isCompleted ? "text-green-400/60" : ""
          }`}
        />
      )}
    </motion.button>
  );
};

interface EpisodeListProps {
  animeId: string;
  onSelectEpisode: (episode: Episode) => void;
  selectedEpisodeId?: string;
  onEpisodesLoaded?: (episodes: Episode[]) => void;
}

const EpisodeList = ({ animeId, onSelectEpisode, selectedEpisodeId, onEpisodesLoaded }: EpisodeListProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [markingAll, setMarkingAll] = useState(false);

  const { data: episodes, isLoading } = useQuery({
    queryKey: ["episodes", animeId],
    queryFn: async (): Promise<Episode[]> => {
      const { data, error } = await supabase
        .from("episodes")
        .select("*")
        .eq("anime_id", animeId)
        .order("episode_number", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: watchedMap } = useQuery({
    queryKey: ["watch-history-map", user?.id, animeId],
    queryFn: async (): Promise<Map<string, { completed: boolean; progress_seconds: number; duration_seconds: number | null }>> => {
      if (!user) return new Map();
      const { data, error } = await supabase
        .from("watch_history")
        .select("episode_id, completed, progress_seconds, duration_seconds")
        .eq("user_id", user.id)
        .eq("anime_id", animeId);

      if (error) return new Map();
      const map = new Map<string, { completed: boolean; progress_seconds: number; duration_seconds: number | null }>();
      for (const row of data || []) {
        map.set(row.episode_id, {
          completed: row.completed ?? false,
          progress_seconds: row.progress_seconds ?? 0,
          duration_seconds: row.duration_seconds ?? null,
        });
      }
      return map;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (episodes && onEpisodesLoaded) {
      onEpisodesLoaded(episodes);
    }
  }, [episodes, onEpisodesLoaded]);

  const allWatched = episodes && episodes.length > 0 && episodes.every(ep => watchedMap?.get(ep.id)?.completed === true);

  const handleMarkAllWatched = async () => {
    if (!user || !episodes || episodes.length === 0) return;
    setMarkingAll(true);
    try {
      const unwatched = episodes.filter(ep => watchedMap?.get(ep.id)?.completed !== true);
      if (unwatched.length === 0) {
        toast.info("Minden epizód már megnézettnek van jelölve.");
        return;
      }

      const rows = unwatched.map(ep => ({
        user_id: user.id,
        anime_id: animeId,
        episode_id: ep.id,
        completed: true,
        progress_seconds: 0,
        last_watched_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from("watch_history")
        .upsert(rows, { onConflict: "user_id,episode_id" });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["watch-history-map"] });
      queryClient.invalidateQueries({ queryKey: ["watch-history"] });
      queryClient.invalidateQueries({ queryKey: ["continue-watching"] });

      toast.success(`${unwatched.length} epizód megnézettnek jelölve!`);
    } catch (e: any) {
      toast.error("Hiba történt: " + (e.message || "Ismeretlen hiba"));
    } finally {
      setMarkingAll(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!episodes || episodes.length === 0) {
    return null;
  }

  const watchedCount = episodes.filter(ep => watchedMap?.get(ep.id)?.completed === true).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-foreground">Epizódok</h2>
          {user && watchedCount > 0 && (
            <span className="text-sm text-muted-foreground">
              <span className="text-green-400 font-semibold">{watchedCount}</span>/{episodes.length} megnézve
            </span>
          )}
        </div>
        {user && !allWatched && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-green-700/50 text-green-400 hover:bg-green-950/60 hover:text-green-300"
            onClick={handleMarkAllWatched}
            disabled={markingAll}
          >
            {markingAll ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="h-4 w-4" />
            )}
            Mind megnézve
          </Button>
        )}
        {user && allWatched && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-green-400">
            <CheckCheck className="h-4 w-4" />
            Mind megnézve
          </span>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {episodes.map((episode, index) => {
          const isSelected = selectedEpisodeId === episode.id;
          const watchData = watchedMap?.get(episode.id);
          const isCompleted = watchData?.completed === true;
          const isInProgress =
            !isCompleted &&
            watchData &&
            watchData.progress_seconds > 0 &&
            watchData.duration_seconds != null &&
            watchData.duration_seconds > 0;

          const progressPct =
            isInProgress && watchData.duration_seconds
              ? Math.min(100, Math.round((watchData.progress_seconds / watchData.duration_seconds) * 100))
              : 0;

          return (
            <EpisodeCard
              key={episode.id}
              episode={episode}
              index={index}
              isSelected={isSelected}
              isCompleted={isCompleted}
              isInProgress={!!isInProgress}
              progressPct={progressPct}
              onSelectEpisode={onSelectEpisode}
            />
          );
        })}
      </div>
    </div>
  );
};

export default EpisodeList;

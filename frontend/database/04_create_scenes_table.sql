-- Scenes table
-- Stores individual scenes for each video with voiceover text

CREATE TABLE IF NOT EXISTS public.scenes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    sequence_order INTEGER NOT NULL,
    voiceover_text TEXT NOT NULL,
    screenshot_url TEXT,
    duration INTEGER, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(video_id, sequence_order)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scenes_video_id ON public.scenes(video_id);
CREATE INDEX IF NOT EXISTS idx_scenes_sequence ON public.scenes(video_id, sequence_order);

-- Updated timestamp trigger
CREATE TRIGGER update_scenes_updated_at
    BEFORE UPDATE ON public.scenes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

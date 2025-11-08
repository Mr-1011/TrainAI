-- Equipment Files table
-- Stores uploaded files (manuals, images, 3D models) for equipment

CREATE TABLE IF NOT EXISTS public.equipment_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
    file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('manual', 'image', '3d_model')),
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT, -- in bytes
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_equipment_files_equipment_id ON public.equipment_files(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_files_type ON public.equipment_files(file_type);

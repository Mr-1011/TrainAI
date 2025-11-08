# Database Migration Files

SQL migration files for TrainAI database schema.

## Running Migrations

Execute these files in order on your database:

1. `01_create_equipment_table.sql` - Equipment/machinery table
2. `02_create_equipment_files_table.sql` - Equipment files (manuals, images, 3D models)
3. `03_create_videos_table.sql` - Generated videos table
4. `04_create_scenes_table.sql` - Video scenes with voiceover text

## Using Supabase Dashboard

1. Go to your Supabase project
2. Navigate to **SQL Editor**
3. Copy and paste each file's content in order
4. Run each migration

## Features Included

- ✅ Foreign key constraints with CASCADE deletes
- ✅ Indexes for performance optimization
- ✅ Automatic `updated_at` timestamp triggers
- ✅ Check constraints for data validation
- ✅ Unique constraints where appropriate

## Notes

- All tables use UUID primary keys
- Foreign key cascades handle cleanup automatically
- This is a single-user application (no user authentication/RLS)

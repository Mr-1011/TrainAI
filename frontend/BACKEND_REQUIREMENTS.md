# Backend Requirements - TrainAI

## Overview
Training video generation platform for machinery maintenance. Users upload equipment knowledge, create videos via prompts, edit scenes, and manage video library.

## User Flow
1. User uploads equipment manuals/images
2. User enters prompt describing maintenance task
3. System generates video scenes with voiceover
4. User edits voiceover text per scene
5. User generates final video
6. Video saved to library

---

## Database Tables

### Equipment
- **id** - unique identifier
- **name** - equipment name
- **created_at** - timestamp
- **updated_at** - timestamp

### Equipment Files
- **id** - unique identifier
- **equipment_id** - parent equipment
- **file_type** - "manual", "image", or "3d_model"
- **file_url** - storage URL
- **file_name** - original filename
- **uploaded_at** - timestamp

### Videos
- **id** - unique identifier
- **equipment_id** - related equipment (optional)
- **title** - video title (auto-generated from prompt)
- **prompt** - original user prompt
- **equipment_model** - selected model (e.g., "Rational SCC 101")
- **task_type** - maintenance task (e.g., "Door Replacement")
- **status** - "processing", "completed", "failed"
- **video_url** - final video URL (when completed)
- **created_at** - timestamp
- **updated_at** - timestamp

### Scenes
- **id** - unique identifier
- **video_id** - parent video
- **sequence_order** - scene number (1, 2, 3...)
- **voiceover_text** - editable script text
- **screenshot_url** - optional image URL
- **duration** - scene length in seconds (optional)
- **created_at** - timestamp
- **updated_at** - timestamp

---

## API Endpoints Needed

### Equipment
- `GET /equipment` - list all equipment
- `POST /equipment` - create new equipment
- `GET /equipment/:id` - get equipment details
- `DELETE /equipment/:id` - delete equipment
- `POST /equipment/:id/files` - upload files (manual/image/3d)
- `DELETE /equipment/files/:fileId` - delete file

### Videos
- `GET /videos` - list all videos (with filter: status)
- `POST /videos` - create video from prompt (generates scenes)
- `GET /videos/:id` - get video with scenes
- `DELETE /videos/:id` - delete video
- `POST /videos/:id/generate` - generate final video file

### Scenes
- `GET /videos/:videoId/scenes` - get all scenes for video
- `PATCH /scenes/:id` - update scene voiceover text
- `DELETE /scenes/:id` - delete scene

---

## Video Generation Flow

1. **User submits prompt** → `POST /videos`
   - Store prompt, equipment model
   - Set status = "processing"
   - Create 3-5 scene records with generated voiceover text
   - Return video ID

2. **User edits scenes** → `PATCH /scenes/:id`
   - Update voiceover_text
   - Auto-save on blur

3. **User clicks "Generate Video"** → `POST /videos/:id/generate`
   - Process scenes into final video
   - Update status to "completed"
   - Set video_url when ready

---

## Notes

- Demo account: `demo@trainai.com` / `demo` (no backend calls needed, frontend handles)
- File uploads: use multipart/form-data
- For MVP: screenshot_url and 3D models are optional (coming soon)
- **Studio page**: Frontend-only with mock data, no backend needed (for local 4D video demos)

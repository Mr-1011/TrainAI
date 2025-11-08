# Training Video Generation Platform

## Project Overview

An AI-powered platform for generating maintenance and training videos for industrial equipment, starting with Rational ovens. Users upload knowledge bases (manuals, 3D models, images), select equipment models, and prompt the system to generate instructional videos for specific maintenance tasks.

## Core Workflow

1. **Knowledge Management**: Upload and organize equipment documentation
   - PDF manuals and technical documentation
   - 3D object files (e.g., .obj, .fbx, .gltf)
   - Reference images (diagrams, parts, procedures)
   - Organize by equipment model (e.g., "Rational SelfCookingCenter 101")

2. **Video Request**: User interaction for generating videos
   - Select equipment model from knowledge base
   - Natural language prompt (e.g., "change the door because it is broken")
   - System understands context and requirements

3. **Video Generation Pipeline** (Backend):
   - Parse prompt to understand maintenance task
   - Retrieve relevant manual sections and reference materials
   - Generate initial images/frames from manual instructions
   - **Image-to-Video**: Convert static images to video sequences
   - **SV4D**: Generate multi-angle scene views for 3D visualization
   - **4K4D**: Create final 4D video output with temporal consistency
   - Assemble final training video with annotations

4. **Library**: Access and manage generated videos
   - Browse all generated training videos
   - Filter by equipment model, task type, date
   - Download, share, or regenerate videos
   - View generation history and parameters

## Application Structure

### Pages

```
src/pages/
├── Home.tsx              # Dashboard with overview stats
├── Knowledge.tsx         # Upload and manage knowledge base
├── Prompt.tsx            # ChatGPT-like interface for video requests
├── Library.tsx           # Browse and manage generated videos
├── Login.tsx             # Authentication
└── Register.tsx          # User registration
```

### Navigation Structure

**Sidebar Menu**:
- 🏠 Home - Dashboard overview
- 📚 Knowledge - Upload manuals, 3D models, images
- ✨ Create Video - Prompt interface for video generation
- 🎬 Library - Browse generated videos
- 👤 Profile/Settings

### Data Models

#### Equipment Model
```typescript
interface EquipmentModel {
  id: string;
  name: string;                    // e.g., "Rational SelfCookingCenter 101"
  manufacturer: string;            // e.g., "Rational"
  category: string;                // e.g., "Oven", "Dishwasher"
  description?: string;
  thumbnail?: string;
  created_at: string;
  updated_at: string;
}
```

#### Knowledge Base Item
```typescript
interface KnowledgeItem {
  id: string;
  equipment_model_id: string;
  type: 'manual' | '3d_model' | 'image' | 'document';
  title: string;
  file_url: string;
  file_size: number;
  file_format: string;             // e.g., "pdf", "obj", "png"
  description?: string;
  tags?: string[];
  uploaded_by: string;
  created_at: string;
}
```

#### Video Request
```typescript
interface VideoRequest {
  id: string;
  user_id: string;
  equipment_model_id: string;
  prompt: string;                  // e.g., "change the door because it is broken"
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;               // 0-100
  video_url?: string;
  thumbnail_url?: string;
  duration?: number;               // in seconds
  generation_params?: {
    sv4d_angles?: number;
    resolution?: string;
    style?: string;
  };
  error_message?: string;
  created_at: string;
  completed_at?: string;
}
```

#### Generated Video
```typescript
interface GeneratedVideo {
  id: string;
  request_id: string;
  equipment_model_id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration: number;
  resolution: string;              // e.g., "1920x1080"
  file_size: number;
  task_type: string;               // e.g., "door_replacement", "cleaning"
  views: number;
  downloads: number;
  created_at: string;
}
```

## API Endpoints

### Authentication
- `POST /auth/signup` - Create user account
- `POST /auth/signin` - Sign in
- `POST /auth/signout` - Sign out
- `GET /auth/me` - Get current user

### Equipment Models
- `GET /equipment-models` - List all equipment models
- `POST /equipment-models` - Create new equipment model
- `GET /equipment-models/{id}` - Get specific model
- `PATCH /equipment-models/{id}` - Update model
- `DELETE /equipment-models/{id}` - Delete model

### Knowledge Base
- `GET /knowledge` - List all knowledge items (with filters)
- `GET /knowledge/model/{equipment_model_id}` - Get items for specific model
- `POST /knowledge` - Upload new knowledge item (multipart/form-data)
- `GET /knowledge/{id}` - Get specific item
- `DELETE /knowledge/{id}` - Delete item
- `PATCH /knowledge/{id}` - Update metadata

### Video Generation
- `POST /video-requests` - Create new video generation request
  ```json
  {
    "equipment_model_id": "uuid",
    "prompt": "change the door because it is broken",
    "generation_params": {
      "sv4d_angles": 8,
      "resolution": "1080p",
      "style": "professional"
    }
  }
  ```
- `GET /video-requests` - List user's video requests
- `GET /video-requests/{id}` - Get request status and details
- `DELETE /video-requests/{id}` - Cancel/delete request

### Video Library
- `GET /videos` - List all generated videos (with pagination, filters)
- `GET /videos/{id}` - Get specific video details
- `DELETE /videos/{id}` - Delete video
- `POST /videos/{id}/download` - Track download
- `POST /videos/{id}/view` - Track view

## Technical Implementation Steps

### Phase 1: Frontend Foundation (Week 1)
1. ✅ Clean up old passport/stamp/trip code
2. ✅ Update sidebar navigation with new menu items
3. ✅ Create new page components (Knowledge, Prompt, Library)
4. ✅ Update routing in App.tsx
5. ✅ Create TypeScript interfaces for new data models
6. ✅ Update CLAUDE.md with new project information

### Phase 2: Knowledge Management Page (Week 1-2)
1. Create Equipment Model selector/manager
2. Build file upload component with drag-and-drop
   - Support for PDF, images, 3D models
   - File type validation and size limits
   - Upload progress indicators
3. Create knowledge base browser/grid
   - Filter by equipment model, file type
   - Search functionality
   - Preview capabilities (PDF viewer, image viewer, 3D model viewer)
4. Implement CRUD operations for knowledge items
5. Add tagging and categorization system

### Phase 3: Video Prompt Interface (Week 2)
1. Create ChatGPT-like interface
   - Text input with auto-resize
   - Equipment model selector dropdown
   - Conversation history display
2. Add advanced options panel
   - SV4D angle count
   - Resolution selection
   - Style preferences
3. Real-time status updates
   - WebSocket connection for progress updates
   - Progress bar with stage indicators
   - Estimated time remaining
4. Preview/review before submission

### Phase 4: Video Library (Week 3)
1. Create video grid/list view
   - Thumbnail previews
   - Metadata display (model, task, date, duration)
   - Filter and search functionality
2. Video player with controls
   - Playback speed adjustment
   - Frame-by-frame navigation
   - Download button
3. Video management features
   - Delete with confirmation
   - Regenerate with modified parameters
   - Share functionality
4. Analytics dashboard
   - Most viewed videos
   - Most common tasks
   - Generation success rate

### Phase 5: Backend Integration (Week 3-4)
1. Create service layer for all API calls
   - `equipment.service.ts`
   - `knowledge.service.ts`
   - `video-request.service.ts`
   - `video.service.ts`
2. Implement WebSocket connection for real-time updates
3. Add error handling and retry logic
4. Implement caching with TanStack Query

### Phase 6: Video Generation Pipeline (Backend - Week 4-6)
1. **Prompt Processing**
   - NLP to extract task type, components, actions
   - Match prompt to relevant manual sections
   - Identify required reference materials

2. **Manual Parsing & Image Generation**
   - Extract relevant pages from PDF manuals
   - Generate initial instruction frames
   - Add annotations and highlights

3. **Image-to-Video Conversion**
   - Convert static instruction images to video
   - Add transitions and animations
   - Integrate text overlays and callouts

4. **SV4D Multi-Angle Generation**
   - Generate 3D scene from reference images
   - Create multiple camera angles (8-16 angles)
   - Ensure consistent lighting and perspective

5. **4K4D Final Video Assembly**
   - Combine all generated scenes
   - Apply temporal consistency
   - Upscale to 4K resolution
   - Add audio narration (optional)

6. **Post-Processing**
   - Quality checks and validation
   - Generate thumbnail and preview
   - Store in video library
   - Notify user of completion

### Phase 7: Advanced Features (Week 7+)
1. **3D Model Viewer Integration**
   - Interactive 3D viewer for uploaded models
   - Highlight specific parts during video generation
   - Allow users to specify camera angles

2. **Video Editing Tools**
   - Trim generated videos
   - Add custom annotations
   - Combine multiple videos into playlists

3. **Collaboration Features**
   - Share knowledge bases between teams
   - Comment on videos
   - Request specific videos from colleagues

4. **Analytics & Insights**
   - Track which maintenance tasks are most common
   - Identify gaps in knowledge base
   - Video effectiveness metrics

5. **Multi-Language Support**
   - Translate UI and video narration
   - Support for international equipment models

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5 with SWC
- **Routing**: React Router DOM v6
- **UI Components**: shadcn/ui (Radix UI)
- **Styling**: Tailwind CSS
- **State Management**:
  - TanStack Query for server state
  - Context API for auth and global state
- **Forms**: React Hook Form with Zod validation
- **File Upload**: react-dropzone
- **Video Player**: video.js or react-player
- **3D Viewer**: react-three-fiber (@react-three/fiber)
- **WebSocket**: socket.io-client for real-time updates

### Backend (To Be Implemented)
- **Framework**: FastAPI (Python) or Node.js with Express
- **Database**: PostgreSQL for metadata, S3/MinIO for file storage
- **Video Processing**:
  - FFmpeg for video manipulation
  - Image-to-Video: Stable Video Diffusion or similar
  - SV4D: Custom implementation or API
  - 4K4D: Custom implementation or API
- **Queue System**: Celery or Bull for async video generation
- **WebSocket**: Socket.io for real-time updates
- **AI/ML**:
  - OpenAI GPT for prompt understanding
  - Computer vision models for manual parsing
  - Custom video generation pipeline

### Infrastructure
- **File Storage**: AWS S3 or MinIO
- **CDN**: CloudFlare or AWS CloudFront for video delivery
- **Compute**: GPU-enabled instances for video generation
- **Monitoring**: Sentry for error tracking, Grafana for metrics

## File Upload Specifications

### Supported Formats
- **Manuals**: PDF, DOCX
- **Images**: PNG, JPEG, WebP, SVG
- **3D Models**: OBJ, FBX, GLTF, GLB, STL
- **Videos** (reference): MP4, WebM

### File Size Limits
- Manuals: 50 MB
- Images: 10 MB
- 3D Models: 100 MB
- Videos: 500 MB

## Video Generation Parameters

### Default Settings
- **Resolution**: 1080p (1920x1080)
- **Frame Rate**: 30fps
- **SV4D Angles**: 8 views
- **Duration**: Auto (based on task complexity)
- **Style**: Professional/Technical

### Customizable Options
- Resolution: 720p, 1080p, 4K
- Frame rate: 24fps, 30fps, 60fps
- SV4D angles: 4, 8, 16, 32
- Style: Professional, Casual, Detailed, Quick
- Narration: On/Off
- Language: English, German, French, Spanish, etc.

## Security Considerations

1. **Authentication**: JWT-based with refresh tokens
2. **File Upload Security**:
   - Virus scanning for all uploads
   - File type validation (magic number checking)
   - Size limits enforced
3. **Access Control**:
   - Users can only access their own knowledge bases and videos
   - Role-based access for teams (future)
4. **Rate Limiting**:
   - Video generation requests limited per user
   - API rate limiting to prevent abuse
5. **Data Privacy**:
   - Uploaded manuals may contain proprietary information
   - Secure storage with encryption at rest
   - Option to delete all data

## Performance Considerations

1. **Video Generation Queue**: Async processing to prevent blocking
2. **Caching**: Cache frequently requested videos
3. **Progressive Loading**: Lazy load video thumbnails and metadata
4. **CDN**: Serve videos from CDN for faster delivery
5. **Pagination**: Limit results in library to 50-100 per page
6. **WebSocket Optimization**: Only send updates when status changes

## User Experience Goals

1. **Simplicity**: Clear, intuitive interface - like ChatGPT
2. **Transparency**: Show generation progress and stages
3. **Speed**: Aim for <5 minutes for typical training video
4. **Quality**: High-resolution, professional-looking output
5. **Flexibility**: Allow customization without overwhelming users
6. **Reliability**: Clear error messages, retry options

## Future Enhancements

1. **AR Integration**: Overlay instructions on real equipment using mobile device
2. **Voice Commands**: "Show me how to replace the door on SCC 101"
3. **AI Assistant**: Chat with knowledge base to answer questions
4. **Automated Updates**: Re-generate videos when manuals are updated
5. **Training Courses**: Combine videos into structured learning paths
6. **Certification**: Track completion and issue certificates
7. **Integration**: Connect with equipment IoT systems for predictive maintenance
8. **Marketplace**: Share/sell training content to other companies

## Success Metrics

1. **Adoption**: Number of active users, videos generated per month
2. **Quality**: User satisfaction ratings, video completion rates
3. **Efficiency**: Time saved vs. manual video creation, training effectiveness
4. **Cost**: Cost per video generation, ROI for customers
5. **Engagement**: Video views, downloads, shares

## Next Steps

1. ✅ Update project documentation (this file)
2. ⏳ Clean up old codebase (remove passport/stamp/trip code)
3. ⏳ Update sidebar navigation
4. ⏳ Create new page components
5. ⏳ Define API contracts with backend team
6. ⏳ Begin Phase 1 implementation

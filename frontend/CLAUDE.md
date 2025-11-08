# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TrainAI is an AI-powered training video generation platform for industrial equipment maintenance. Users upload knowledge bases (manuals, 3D models, images), select equipment models, and use natural language prompts to generate instructional videos for specific maintenance tasks. The application targets commercial equipment manufacturers, starting with Rational ovens for restaurants.

## Development Commands

```bash
# Start development server (runs on http://[::]:8080)
npm run dev

# Build for production
npm run build

# Build for development mode
npm run build:dev

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Technology Stack

- **Build Tool**: Vite 5 with SWC for fast React compilation
- **Framework**: React 18 with TypeScript
- **Routing**: React Router DOM v6
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS with custom theme
- **State Management**: TanStack Query (React Query) for server state
- **Forms**: React Hook Form with Zod validation
- **File Upload**: react-dropzone (planned)
- **Video Player**: video.js or react-player (planned)
- **3D Viewer**: react-three-fiber (planned)

## Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components (48+ reusable components)
│   ├── AppLayout.tsx          # Main layout wrapper with sidebar
│   └── AppSidebar.tsx         # Application sidebar navigation
├── pages/
│   ├── Home.tsx               # Dashboard with overview stats
│   ├── Knowledge.tsx          # Upload and manage knowledge base
│   ├── Prompt.tsx             # ChatGPT-like video creation interface
│   ├── Library.tsx            # Browse and manage generated videos
│   ├── Login.tsx              # Authentication - login
│   ├── Register.tsx           # Authentication - registration
│   └── NotFound.tsx           # 404 error page
├── contexts/
│   ├── AuthContext.tsx        # Authentication state management
│   └── PassportContext.tsx    # Legacy context (to be replaced)
├── services/
│   ├── auth.service.ts        # Authentication API calls
│   └── (future services for equipment, knowledge, videos)
├── types/
│   └── (to be created for new data models)
├── hooks/
│   ├── use-mobile.tsx         # Mobile detection hook
│   └── use-toast.ts           # Toast notification hook
├── lib/
│   ├── api-client.ts          # Axios instance with auth interceptors
│   └── utils.ts               # Utility functions (cn for className merging)
├── App.tsx                    # Root component with routing configuration
└── main.tsx                   # Application entry point
```

## Architecture Notes

### Core Workflow

1. **Knowledge Management** (`/knowledge`):
   - Upload equipment manuals (PDF)
   - Upload 3D models (OBJ, FBX, GLTF, GLB)
   - Upload reference images (PNG, JPEG, WebP)
   - Organize by equipment model
   - Search and filter knowledge items

2. **Video Creation** (`/prompt`):
   - Select equipment model from knowledge base
   - Natural language prompt (e.g., "change the door because it's broken")
   - Advanced settings: resolution, SV4D angles, style
   - Real-time progress updates via WebSocket (planned)
   - ChatGPT-like conversational interface

3. **Video Library** (`/library`):
   - Grid view of generated videos with thumbnails
   - Filter by model, status, date
   - Video player with controls
   - Download and delete operations
   - View analytics (views, downloads)

### API Architecture (Planned)

Services will be organized by domain:
- **auth.service.ts**: Sign up, sign in, token refresh, logout
- **equipment.service.ts**: CRUD for equipment models
- **knowledge.service.ts**: Upload, retrieve, delete knowledge items
- **video-request.service.ts**: Create video generation requests, check status
- **video.service.ts**: Retrieve, download, delete generated videos

All services use `apiClient` from `lib/api-client.ts` which is an Axios instance with:
- Automatic JWT token injection from localStorage
- Token refresh on 401 errors
- Base URL configuration for backend API

### Authentication

- Uses JWT-based authentication with access and refresh tokens
- AuthContext provides authentication state globally
- Access tokens stored in localStorage and auto-injected via axios interceptors
- Token refresh automatically handled on expiration

### Routing Architecture

All routes are defined in `src/App.tsx`. Protected routes are wrapped in the `AppLayout` component which provides sidebar navigation.

Main routes:
- `/` - Home dashboard
- `/knowledge` - Knowledge base management
- `/prompt` - Video creation interface
- `/library` - Video library browser
- `/login` and `/register` - Authentication

### Layout System

- `AppLayout` component provides the main application shell with:
  - Collapsible sidebar via `SidebarProvider` from shadcn/ui
  - Header with sidebar trigger
  - Main content area with padding
- All authenticated pages should be wrapped in `AppLayout`

### Video Generation Pipeline (Backend - To Be Implemented)

1. **Prompt Processing**: NLP to extract task type, components, actions
2. **Manual Parsing**: Extract relevant pages from knowledge base
3. **Image Generation**: Create initial instruction frames
4. **Image-to-Video**: Convert static images to video sequences
5. **SV4D**: Generate multi-angle scenes (4-32 camera angles)
6. **4K4D**: Create final 4D video with temporal consistency
7. **Post-Processing**: Quality checks, thumbnail generation, storage

## Path Aliases

The project uses `@/` as an alias for the `src/` directory:
```typescript
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
```

## TypeScript Configuration

TypeScript is configured with relaxed settings for rapid development:
- `noImplicitAny: false`
- `noUnusedParameters: false`
- `noUnusedLocals: false`
- `strictNullChecks: false`
- `allowJs: true`

When making changes, prefer maintaining type safety where possible.

## Styling Patterns

- Uses HSL-based CSS variables for theming (see `src/index.css`)
- Supports dark mode via `class` strategy in Tailwind
- Custom color system with semantic tokens: `primary`, `secondary`, `destructive`, `muted`, `accent`, `sidebar`
- Use the `cn()` utility from `@/lib/utils` to merge Tailwind classes with conditional logic

## Key Features (Current Implementation)

### 1. Knowledge Management Page
- Three upload card types: Manuals, 3D Models, Images
- Search and filter by equipment model
- Grid display of knowledge items with metadata
- Type badges and file information

### 2. Video Creation Interface
- ChatGPT-like conversational interface
- Equipment model selector dropdown
- Advanced settings (collapsible):
  - Resolution: 720p, 1080p, 4K
  - SV4D camera angles: 4, 8, 16, 32
  - Style: Professional, Detailed, Quick, Casual
- Message history with user/assistant separation
- Real-time typing and submission

### 3. Video Library
- Statistics cards: Total videos, views, monthly count, processing count
- Search and filter functionality
- Video grid with thumbnails and metadata
- Play, download, delete operations
- Status badges: Completed, Processing, Failed

## Data Models (To Be Implemented)

### Equipment Model
```typescript
interface EquipmentModel {
  id: string;
  name: string;                    // e.g., "Rational SelfCookingCenter 101"
  manufacturer: string;
  category: string;
  description?: string;
  thumbnail?: string;
}
```

### Knowledge Item
```typescript
interface KnowledgeItem {
  id: string;
  equipment_model_id: string;
  type: 'manual' | '3d_model' | 'image' | 'document';
  title: string;
  file_url: string;
  file_size: number;
  file_format: string;
  description?: string;
  tags?: string[];
}
```

### Video Request
```typescript
interface VideoRequest {
  id: string;
  equipment_model_id: string;
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  video_url?: string;
  generation_params?: {
    resolution: string;
    sv4d_angles: number;
    style: string;
  };
}
```

### Generated Video
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
  resolution: string;
  file_size: number;
  task_type: string;
  views: number;
  downloads: number;
  created_at: string;
}
```

## API Endpoints (To Be Implemented)

### Equipment Models
- `GET /equipment-models` - List all equipment models
- `POST /equipment-models` - Create new model
- `GET /equipment-models/{id}` - Get specific model
- `PATCH /equipment-models/{id}` - Update model
- `DELETE /equipment-models/{id}` - Delete model

### Knowledge Base
- `GET /knowledge` - List all knowledge items
- `GET /knowledge/model/{equipment_model_id}` - Get items for model
- `POST /knowledge` - Upload new item (multipart/form-data)
- `DELETE /knowledge/{id}` - Delete item

### Video Generation
- `POST /video-requests` - Create video generation request
- `GET /video-requests` - List user's requests
- `GET /video-requests/{id}` - Get request status

### Video Library
- `GET /videos` - List generated videos
- `GET /videos/{id}` - Get specific video
- `DELETE /videos/{id}` - Delete video
- `POST /videos/{id}/download` - Track download
- `POST /videos/{id}/view` - Track view

## Development Patterns

### Form Validation
- Use Zod schemas for validation
- Error messages shown via toast notifications
- Loading states prevent double-submissions

### Error Handling
- All API calls wrapped in try/catch blocks
- Extract error details from API responses
- Show descriptive error toasts

### File Uploads (To Be Implemented)
- Support for drag-and-drop with react-dropzone
- File type and size validation
- Progress indicators for large uploads
- Preview capabilities for images and PDFs

## Next Steps

1. ✅ Update sidebar navigation
2. ✅ Create Knowledge, Prompt, Library pages
3. ✅ Update routing in App.tsx
4. ⏳ Create TypeScript interfaces for new data models
5. ⏳ Implement service layer for API calls
6. ⏳ Add file upload functionality to Knowledge page
7. ⏳ Implement video player in Library page
8. ⏳ Add WebSocket for real-time status updates
9. ⏳ Backend: Video generation pipeline
10. ⏳ Backend: AI models integration (SV4D, 4K4D)

## Use Case Example

**User**: Technical documentation manager at Rational
**Goal**: Create training video for door replacement

1. Upload Rational SCC 101 manual PDF to Knowledge Base
2. Upload 3D model of the oven
3. Upload reference images of door assembly
4. Go to Create Video page
5. Select "Rational SelfCookingCenter 101"
6. Type: "change the door because it's broken"
7. Adjust settings: 1080p, 8 angles, professional style
8. Submit and receive video in 3-5 minutes
9. View, download, and share from Library

## Technical Considerations

- **Video Storage**: Large files require CDN or object storage
- **Processing Queue**: Async video generation with progress tracking
- **GPU Requirements**: SV4D and 4K4D need GPU acceleration
- **Cost**: Monitor API costs for AI models
- **Scalability**: Queue system for multiple concurrent generations
- **Security**: Uploaded manuals may be proprietary

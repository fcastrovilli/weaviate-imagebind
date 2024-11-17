# Weaviate Multi-Modal Vector Search UI

A sophisticated vector search application built with SvelteKit and Weaviate, designed for managing and searching multi-modal content including text, images, audio, and video. The application provides an intuitive interface for vector-based similarity search across different media types.

## Core Features

### Multi-Modal Vector Search
- 🔍 Semantic search across different media types (text, images, audio, video)
- 🖼️ Multi-modal embeddings using ImageBind technology
- 🎯 Similarity-based content discovery
- 📊 Vector-based content organization

### Collection Management
- 📁 Dynamic collection creation with media type specification
- 🏷️ Automatic metadata extraction and indexing
- 🔄 Flexible schema management for different content types
- 📊 Collection statistics and insights

### Media Processing
- 🖼️ Image processing and vector embedding
- 🎵 Audio content analysis and vectorization
- 📝 Text-to-vector conversion
- 🎥 Video content processing

### Search Capabilities
- 💡 Cross-modal similarity search
- 🎯 Semantic search across collections
- 🔍 Hybrid search combining vector and keyword search
- 🎨 Visual similarity search for images

## Technical Architecture

### Vector Database Layer
- **Weaviate Backend**: Handles vector storage and similarity search
- **Multi2Vec-Bind Integration**: Provides multi-modal embedding capabilities
- **Collection Schema**: 
  - Dynamic property configuration
  - Support for blob data types (images, audio, video)
  - Metadata management
  - Automatic vectorization

### Data Models
Each collection supports various media types with the following structure:
- Base Properties:
  - Title (searchable text)
  - Creation timestamp
  - Media-specific metadata
- Media-Specific Properties:
  - Images: format, size, dimensions
  - Audio: duration, format, size
  - Video: duration, format, resolution
  - Text: content, language

### Vector Processing Pipeline
1. Content Ingestion
2. Media Type Detection
3. Feature Extraction
4. Vector Embedding Generation
5. Metadata Extraction
6. Index Storage

## Getting Started

### Prerequisites
- Docker and Docker Compose for Weaviate services
- Node.js for the SvelteKit application
- pnpm (recommended) or npm

### Installation

1. Clone the repository
2. Install dependencies:
```bash
pnpm install
```

3. Start Weaviate and vector services:
```bash
docker-compose up -d
```

4. Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:5173`

## Configuration

### Weaviate Configuration
The `docker-compose.yml` file configures:
- Weaviate vector database (port 8080)
- Multi2vec-bind service for multi-modal embeddings
- Vector dimension settings
- Authentication settings
- Persistence configuration

### Application Configuration
- `src/lib/server/db/`: Database integration and collection management
- `src/routes/`: API endpoints and UI routes
- `src/lib/components/`: UI components for search and visualization

## Usage Examples

### Creating a Collection
```typescript
await createCollection({
  name: "MediaLibrary",
  description: "Multi-modal content collection",
  mediaTypes: ["image", "audio", "text"]
});
```

### Performing Vector Search
```typescript
const results = await collection.search({
  vector: contentVector,
  limit: 10,
  mediaTypes: ["image", "text"]
});
```

## Development

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm check` - Type-check the codebase

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is open source and available under the MIT license.

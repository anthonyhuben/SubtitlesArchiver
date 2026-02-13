# Architecture & Technical Design

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Firefox Browser                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      Web Page (Content)                  │   │
│  │  • HTML5 <video> elements                               │   │
│  │  • <iframe> with video platforms                        │   │
│  │  • <track> elements with subtitles                      │   │
│  │  • Script tags with subtitle URLs                       │   │
│  └────────────────────────┬─────────────────────────────────┘   │
│                           │                                      │
│                    content.js (injected)                         │
│                           │                                      │
│                           ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Popup.html (Extension UI)                  │   │
│  │                                                          │   │
│  │  ┌───────────────────────────────────────────────────┐ │   │
│  │  │  popup.js - Event handling & UI logic             │ │   │
│  │  │  • Scans for videos (via content.js)              │ │   │
│  │  │  • Displays detected items                        │ │   │
│  │  │  • Handles user interactions                      │ │   │
│  │  │  • Shows modals for format selection              │ │   │
│  │  └────────────┬──────────────────────────────────────┘ │   │
│  │              │                                         │   │
│  │              │ chrome.runtime.sendMessage              │   │
│  │              ↓                                         │   │
│  │  ┌───────────────────────────────────────────────────┐ │   │
│  │  │  background.js (Service Worker)                  │ │   │
│  │  │  • Listens for messages from popup                │ │   │
│  │  │  • Fetches subtitle files (cross-origin)          │ │   │
│  │  │  • Calls subtitle parser for conversion           │ │   │
│  │  │  • Downloads files to disk                        │ │   │
│  │  └────────────┬──────────────────────────────────────┘ │   │
│  │              │                                         │   │
│  │              │ Uses SubtitleParser module              │   │
│  │              ↓                                         │   │
│  │  ┌───────────────────────────────────────────────────┐ │   │
│  │  │  subtitle-parser.js (Shared Module)              │ │   │
│  │  │  • Auto-detect subtitle format                    │ │   │
│  │  │  • Parse multiple subtitle formats                │ │   │
│  │  │  • Convert between formats                        │ │   │
│  │  │  • Time code conversions                          │ │   │
│  │  └───────────────────────────────────────────────────┘ │   │
│  │                                                         │   │
│  │  popup.css - Styling (gradients, animations, etc)     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           ↓                                      │
│                  ┌──────────────────┐                           │
│                  │  Your Downloads  │                           │
│                  │   (SRT, VTT...)  │                           │
│                  └──────────────────┘                           │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. manifest.json
**Purpose**: Extension metadata and permission declaration

**Key Sections**:
```json
{
  "manifest_version": 3,                    // Firefox MV3 format
  "permissions": ["downloads", "scripting"],  // Required capabilities
  "content_scripts": [{                     // Injected into web pages
    "matches": ["<all_urls>"],
    "js": ["content.js"],
    "run_at": "document_start",
    "all_frames": true                      // Run in iframes too
  }],
  "background": {
    "service_worker": "background.js"       // Background service worker
  }
}
```

### 2. content.js
**Purpose**: Run in web page context to detect videos

**Key Functions**:

```javascript
VideoDetector.collectVideos()
├── collectVideos()               // Main detection method
│   ├── Find native <video> elements
│   ├── Scan for <iframe> video players
│   └── Look for [data-video-*] containers
├── extractVideoData()            // Extract from <video> tags
├── detectIframeVideo()           // Identify video platform
├── extractSubtitleTracks()       // Find <track> elements
└── searchSubtitleResources()     // Find subtitle URLs on page
```

**Platform Detection**:
- YouTube: `/(youtube|youtu\.be)/`
- Vimeo: `/vimeo/`
- Dailymotion: `/dailymotion/`
- Bilibili: `/bilibili/`
- Twitch: `/twitch\.tv/`
- Netflix, Hulu, Prime Video, etc.

**Return Format**:
```javascript
{
  id: 'native-0',
  type: 'native|iframe|container',
  title: 'Video Title',
  sources: [...],          // For native videos
  subtitles: [{            // For <track> elements
    src: 'url',
    srclang: 'en',
    label: 'English'
  }],
  url: 'page-url',
  platform: 'youtube',     // For iframes
  platformName: 'YouTube'
}
```

### 3. popup.html & popup.js
**Purpose**: UI for user interaction

**UI Components**:
1. **Header**: Title and extension branding
2. **Status Messages**: Info/success/error notifications
3. **Loading Spinner**: While scanning
4. **Videos Section**: List of detected videos
5. **Subtitles Section**: List of found subtitle URLs
6. **Modal Dialog**: Format selection and filename input
7. **Footer**: Refresh and Settings buttons

**Event Flow**:
```
User clicks extension icon
        ↓
DOMContentLoaded event
        ↓
chrome.tabs.query() - Get current tab
        ↓
scanForVideos()
        ↓
content.js receives "detectVideos" message
        ↓
VideoDetector.detectVideos() in content script
        ↓
Response returned to popup
        ↓
displayVideos() and displaySubtitles()
        ↓
UI updated with results
```

**Download/Convert Flow**:
```
User clicks Download/Convert button
        ↓
showDownloadModal() or showConvertModal()
        ↓
User selects format and filename
        ↓
chrome.runtime.sendMessage() to background
        ↓
background.js receives message
        ↓
Fetch subtitle file
        ↓
Parse subtitle content
        ↓
Convert to selected format
        ↓
Download to disk
        ↓
Status message shown in popup
```

### 4. background.js
**Purpose**: Service worker for background tasks

**Key Responsibilities**:

```javascript
Message handlers:
├── 'fetchAndDownload'      // Fetch and re-format subtitles
├── 'convertAndDownload'    // Convert format and download
└── 'downloadUrl'           // Direct URL download

Functions:
├── fetchAndDownloadSubtitle(url, filename, format)
│   ├── fetch(url, {mode: 'cors'})
│   ├── SubtitleParser.parse(content, 'auto')
│   ├── Convert to target format
│   └── downloadFile()
├── convertAndDownloadSubtitle(url, filename, targetFormat)
│   └── Similar to above
├── downloadUrl(url, filename)
│   └── Direct download without conversion
└── downloadFile(content, filename)
    └── Create Blob and trigger download
```

**CORS Handling**:
- Fetches with `mode: 'cors'` to handle cross-origin
- Firefox service worker can access any URL
- Error handling for blocked requests

### 5. subtitle-parser.js
**Purpose**: Parse and convert subtitle formats

**Format Detection**:
```javascript
detectFormat(content) {
  if (content.includes('WEBVTT')) return 'vtt'
  if (content.includes('[Script Info]')) return 'ass'
  if (/^\d+\n\d{2}:\d{2}:\d{2}/.test(content)) return 'srt'
  // ... more format detection
}
```

**Parsing Pipeline**:
```
Raw subtitle file
        ↓
detectFormat() - Auto-detect format
        ↓
parse() - Call appropriate parser
        ↓
Parser (parseSRT, parseVTT, etc.)
        ↓
Normalized internal format:
[
  {
    index: 1,
    startMs: 1000,
    endMs: 5000,
    text: "Subtitle text",
    startTime: {...},
    endTime: {...}
  },
  ...
]
        ↓
Converter (toSRT, toVTT, etc.)
        ↓
Output string in target format
```

**Supported Formats**:

| Format | Parser | Converter | Time Format |
|--------|--------|-----------|-------------|
| SRT | parseSRT | toSRT | HH:MM:SS,mmm |
| VTT | parseVTT | toVTT | HH:MM:SS.mmm |
| ASS | parseASS | toASS | H:MM:SS.cc |
| SUB | parseSUB | toSUB | Frames |
| JSON | parseJSON | toJSON | Milliseconds |
| XML | parseXML | (NA) | Varies |

## Data Flow Examples

### Example 1: Download SRT from YouTube

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User opens YouTube page with embedded video             │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. content.js runs automatically (all_frames: true)         │
│    - Detects iframe with YouTube URL                       │
│    - Returns video info (no subtitle access due to CORS)   │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. User clicks extension icon                               │
│    - popup.js calls chrome.tabs.sendMessage()              │
│    - content.js returns detected videos                    │
│    - Popup displays "Found 1 video (YouTube)"              │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. User clicks "📥 Download" button                         │
│    - No subtitles to download (iframe security)            │
│    - Status: "No subtitles found for this video"           │
└─────────────────────────────────────────────────────────────┘

Note: YouTube embeds have security restrictions. Native HTML5
videos work better for subtitle extraction.
```

### Example 2: Convert VTT to SRT

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Page contains: <video> with <track kind="subtitles"     │
│    src="subtitles.vtt">                                     │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. content.js detects:                                      │
│    - Native <video> element                                │
│    - <track> pointing to subtitles.vtt                     │
│    - Returns video with subtitle source URL                │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. User clicks "🔄 Convert" button                          │
│    - showConvertModal() displays                           │
│    - User selects "SRT" format                             │
│    - User names file "episode1"                            │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. popup.js sends: {                                        │
│      action: 'convertAndDownload',                          │
│      url: 'subtitles.vtt',                                 │
│      filename: 'episode1',                                 │
│      targetFormat: 'srt'                                   │
│    }                                                        │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. background.js receives message:                          │
│    - fetch('subtitles.vtt')                                │
│    - SubtitleParser.parse(content, 'auto')                │
│    - Detects: VTT format                                   │
│    - parseVTT() → internal format                          │
│    - toSRT() → SRT string                                  │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. downloadFile() called:                                   │
│    - Blob created with SRT content                         │
│    - Object URL generated                                  │
│    - chrome.downloads.download() called                    │
│    - File: episode1.srt downloaded                         │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. popup.js shows success message:                          │
│    "✓ Converted to SRT and downloaded"                     │
└─────────────────────────────────────────────────────────────┘
```

## Module Organization

### Shared SubtitleParser
The `subtitle-parser.js` module is used in TWO contexts:

1. **In popup.js**: For quick format detection (UI feedback)
2. **In background.js**: For actual conversion and download

This is necessary because:
- popup.js needs immediate feedback for UI
- background.js needs full processing power for conversion
- Code is duplicated to avoid complexity of module imports

### Error Handling Strategy

```
CORS Error
  ↓
Fetch fails in background.js
  ↓
catch(error) handler
  ↓
sendResponse({success: false, error: "..."})
  ↓
popup.js receives failure
  ↓
showStatus(message, 'error')
  ↓
Status displayed to user
```

## Performance Considerations

### Video Detection (~100ms)
- DOM querying is fast
- Iterating iframes is necessary
- MutationObserver lightweight but always active

### Subtitle Parsing (~50-500ms depending on size)
- Regex-based parsing is quick
- Large files may take longer
- Async operations prevent UI blocking

### File Download (~instant to several seconds)
- Download speed limited by network
- Conversion happens in background
- User sees immediate feedback

## Security Considerations

1. **Content Security Policy**: Extension respects CSP headers
2. **CORS**: Handled properly by fetch API
3. **No sensitive data**: Only processes publicly accessible subtitles
4. **No external servers**: All processing local to user
5. **Iframe sandboxing**: Can't access cross-origin iframe content (by design)

## Limitations by Design

1. **DRM Content**: Can't access protected subtitles (security feature)
2. **Cross-origin Iframes**: Can't read content (CORS + security)
3. **JavaScript-loaded Content**: Needs refresh to detect new videos
4. **Platform-specific Blocking**: Some sites explicitly block subtitle access

---

For more details, see individual source files with inline comments.

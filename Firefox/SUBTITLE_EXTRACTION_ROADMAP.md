# 🎬 Comprehensive Subtitle Extraction Support - Full Roadmap

## Executive Summary
This document outlines **critical enhancements** to maximize subtitle extraction support across virtually all video platforms on the web. The current implementation is excellent (7 detection methods, 20+ platforms), but there are additional techniques that can capture subtitles from even the most restricted sources.

---

## 🎯 Phase 1: Advanced Video Platform Detection

### 1.1 Real-time XHR/Fetch Interception
**Problem:** Many modern video players load subtitles via AJAX/Fetch, which may not be visible in the DOM or Performance API.

**Solution:**
```javascript
// Intercept all network requests
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const response = originalFetch.apply(this, args);
  return response.then(r => {
    const url = args[0].url || args[0];
    if (url.includes('caption') || url.includes('subtitle') ||
        url.includes('.vtt') || url.includes('.srt')) {
      // Track subtitle URLs
      window.__detectedSubtitleURLs = window.__detectedSubtitleURLs || [];
      window.__detectedSubtitleURLs.push(url);
    }
    return r;
  });
};
```

**Impact:** Captures dynamically loaded subtitles from:
- Netflix, Hulu, Disney+, Prime Video
- YouTube in-browser requests
- Any player using AJAX for captions

### 1.2 Lazy-Loading IFrame Detection
**Problem:** Some platforms (YouTube, embedded players) may dynamically create iframes after user interaction.

**Solution:**
```javascript
// Detect dynamically added iframes
const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.tagName === 'IFRAME') {
        // Re-run video detection
        chrome.runtime.sendMessage({action: 'redetectVideos'});
      }
    });
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['src', 'data-src']
});
```

**Impact:** Detects iframes added after page load (infinite scroll, lazy loading)

---

## 🎥 Phase 2: Extended Video Player Library Support

### 2.1 Add Support for Streaming Libraries
Current: Video.js, Plyr, JW Player
Missing: HLS.js, Dash.js, Shaka Player, Media Source Extensions

```javascript
// HLS.js Detection
if (window.HLS) {
  try {
    const hls = window.HLS;
    if (hls.media && hls.media.textTracks) {
      for (let i = 0; i < hls.media.textTracks.length; i++) {
        // Extract tracks from HLS
      }
    }
  } catch (e) {}
}

// Dash.js Detection
if (window.dashjs) {
  try {
    const dashInstance = window.dashjs.MediaPlayer().create();
    if (dashInstance.getBitrateList) {
      // Extract from dash instance
    }
  } catch (e) {}
}

// Shaka Player Detection
if (window.shaka && window.shaka.Player) {
  try {
    // Access text tracks from Shaka instances
  } catch (e) {}
}
```

### 2.2 MediaSource Extension Parsing
Many streaming videos use MediaSource API with embedded caption tracks:

```javascript
// Intercept MediaSource
const originalAddSourceBuffer = MediaSource.prototype.addSourceBuffer;
MediaSource.prototype.addSourceBuffer = function(mimeType) {
  const buffer = originalAddSourceBuffer.apply(this, arguments);
  if (mimeType.includes('text') || mimeType.includes('vtt') || mimeType.includes('caption')) {
    // Track caption buffers
    window.__captionBuffers = window.__captionBuffers || [];
    window.__captionBuffers.push({mimeType, timestamp: Date.now()});
  }
  return buffer;
};
```

---

## 🔐 Phase 3: DRM & Restricted Platform Support

### 3.1 Service-Specific Extractors
**For platforms like Netflix, Disney+, Prime Video:**

```javascript
// Netflix-specific extraction
const NetflixExtractor = {
  extract() {
    // Check for netflix player state
    const playerState = window.__NETFLIX__ || window.nflxPlayer;
    if (playerState && playerState.textTracks) {
      return this.parseNetflixTracks(playerState.textTracks);
    }
  },

  parseNetflixTracks(tracks) {
    // Netflix uses proprietary track format
  }
};

// YouTube-specific extraction
const YouTubeExtractor = {
  extract() {
    const captions = document.querySelector('yt-formatted-string[role="button"]');
    if (captions) {
      // Trigger captions menu and parse available languages
    }
  }
};
```

### 3.2 Browser Console API Access
**For streaming platforms that expose APIs in console:**

```javascript
// Try to find subtitle data in window object
function searchWindowForSubtitles() {
  const keys = Object.keys(window);
  const subtitleKeys = keys.filter(k =>
    k.toLowerCase().includes('caption') ||
    k.toLowerCase().includes('subtitle') ||
    k.toLowerCase().includes('track')
  );

  const results = {};
  subtitleKeys.forEach(key => {
    try {
      const value = window[key];
      if (typeof value === 'object') {
        results[key] = value;
      }
    } catch (e) {}
  });

  return results;
}
```

---

## 🎯 Phase 4: Blob & Canvas Extraction (Advanced)

### 4.1 Blob URL Tracking
**Problem:** Some platforms serve subtitle files as blob URLs (`blob:https://...`).

**Solution:**
```javascript
const originalCreateObjectURL = URL.createObjectURL;
URL.createObjectURL = function(blob) {
  const url = originalCreateObjectURL.apply(this, arguments);

  // Check if it's a text blob (potential subtitles)
  if (blob.type.includes('text') || blob.type.includes('vtt') || blob.type.includes('srt')) {
    blob.text().then(content => {
      window.__blobSubtitles = window.__blobSubtitles || [];
      window.__blobSubtitles.push({
        url: url,
        content: content.substring(0, 500),
        type: blob.type
      });
    });
  }

  return url;
};
```

### 4.2 IndexedDB & LocalStorage Scanning
Some applications store subtitles in client-side storage:

```javascript
async function scanClientStorage() {
  const subtitles = [];

  // Scan IndexedDB
  try {
    const dbs = await indexedDB.databases();
    for (const db of dbs) {
      // Scan each database for subtitle data
    }
  } catch (e) {}

  // Scan LocalStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.includes('subtitle') || key.includes('caption')) {
      const value = localStorage.getItem(key);
      subtitles.push({key, value});
    }
  }

  return subtitles;
}
```

---

## 🔌 Phase 5: Plugin-Based Subtitle Servers

### 5.1 Integration with Subtitle APIs
For videos without built-in subtitles, query public APIs:

```javascript
// OpenSubtitles API integration
async function fetchFromOpenSubtitles(videoHash, videoTitle) {
  try {
    const response = await fetch('https://api.opensubtitles.com/api/v1/subtitles', {
      method: 'POST',
      body: JSON.stringify({
        file_name: videoTitle,
        file_hash: videoHash
      })
    });
    return await response.json();
  } catch (e) {}
}

// SubDB API
async function fetchFromSubDB(videoHash) {
  const url = `http://api.thesubdb.com/?action=search&hash=${videoHash}`;
  try {
    const response = await fetch(url);
    return await response.text();
  } catch (e) {}
}
```

---

## 📊 Phase 6: Enhanced Metadata & Format Support

### 6.1 Additional Subtitle Formats
Currently supports: VTT, SRT, ASS/SSA, SUB, JSON, XML

**Add Support For:**
- **SBML** - Synchronized Broadcast Markup Language
- **SMIL** - Synchronized Multimedia Integration Language
- **EBU-TT** - EBU Timed Text (broadcast standard)
- **DFXP/TTML** - Distribution Format Exchange Profile (Netflix standard)
- **WebVTT with cue settings** - Complex VTT parsing
- **SAMI** - Synchronized Accessible Media Interchange

```javascript
// TTML/DFXP Parsing
parseTTML(content) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(content, 'application/xml');
  const subtitles = [];

  xml.querySelectorAll('div p').forEach((p, index) => {
    const begin = p.getAttribute('begin');
    const end = p.getAttribute('end');
    const text = p.textContent;

    subtitles.push({
      index: index + 1,
      startMs: this.ttmlTimeToMs(begin),
      endMs: this.ttmlTimeToMs(end),
      text: text
    });
  });

  return subtitles;
}
```

### 6.2 Multi-language Detection
Automatically detect and label multiple language subtitle tracks:

```javascript
const languageCodes = {
  'en': 'English', 'es': 'Spanish', 'fr': 'French',
  'de': 'German', 'it': 'Italian', 'pt': 'Portuguese',
  'zh': 'Chinese', 'ja': 'Japanese', 'ko': 'Korean',
  // ... 100+ language codes
};

function detectLanguage(lang) {
  const code = lang ? lang.split('-')[0].toLowerCase() : 'unknown';
  return languageCodes[code] || lang || 'Unknown';
}
```

---

## 🎬 Phase 7: OCR-Based Extraction (Experimental)

### 7.1 Frame-Based Caption Detection
For videos with hard-coded subtitles (burned-in):

```javascript
// Tesseract.js integration
async function extractBurninSubtitles(video) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // Capture frames periodically
  let frames = [];
  let lastOCRResult = '';

  const captureFrame = async () => {
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL();

    // Use Tesseract for OCR (requires external library)
    const { data: { text } } = await Tesseract.recognize(imageData);

    // Only record changes in subtitle text
    if (text !== lastOCRResult && text.length > 3) {
      frames.push({
        time: video.currentTime,
        text: text
      });
      lastOCRResult = text;
    }
  };

  return frames;
}
```

**Note:** This is computationally expensive but useful for archived content.

---

## 🔧 Phase 8: Batch Processing & Management

### 8.1 Batch Download Feature
```javascript
// Download multiple subtitles at once
async function batchDownloadSubtitles(videos, format) {
  const results = [];

  for (const video of videos) {
    for (const subtitle of video.subtitles) {
      const filename = `${video.title}_${subtitle.srclang}.${getExtension(format)}`;
      try {
        await downloadSubtitle(subtitle.src, filename, format);
        results.push({video: video.title, status: 'success'});
      } catch (e) {
        results.push({video: video.title, status: 'failed', error: e.message});
      }
    }
  }

  return results;
}
```

### 8.2 Subtitle Library Management
Store downloaded subtitles with metadata:

```javascript
// Store in Chrome Storage with metadata
async function storeSubtitleLibrary(subtitle, metadata) {
  const library = await chrome.storage.local.get('subtitleLibrary');
  const items = library.subtitleLibrary || [];

  items.push({
    id: generateId(),
    url: subtitle.url,
    title: metadata.videoTitle,
    language: subtitle.srclang,
    format: subtitle.format,
    downloadDate: new Date().toISOString(),
    videoUrl: metadata.videoUrl,
    content: subtitle.content // First 1000 chars for preview
  });

  await chrome.storage.local.set({subtitleLibrary: items});
}
```

---

## 🔍 Phase 9: Search & Discovery

### 9.1 Local Subtitle Search
```javascript
// Full-text search across library
function searchSubtitles(query, library) {
  return library.filter(item =>
    item.title.toLowerCase().includes(query) ||
    item.content.toLowerCase().includes(query) ||
    item.language.toLowerCase().includes(query)
  );
}
```

### 9.2 Online Subtitle Database Integration
Link to subtitle databases for manual lookup:

```javascript
const subtitleDatabases = {
  opensubtitles: 'https://www.opensubtitles.com',
  subscene: 'https://subscene.com',
  subdb: 'http://thesubdb.com',
  yifysubtitles: 'https://www.yifysubtitles.com',
  subtitles24: 'https://www.subtitles24.com'
};

function generateSearchLinks(videoTitle) {
  return Object.entries(subtitleDatabases).map(([name, url]) => ({
    name,
    searchUrl: `${url}/search?q=${encodeURIComponent(videoTitle)}`
  }));
}
```

---

## 📱 Phase 10: UI/UX Enhancements

### 10.1 Advanced Filter UI
- Filter by language
- Filter by format
- Sort by date/platform
- Search across library

### 10.2 Preview Features
- Show first few lines of subtitle
- Display language, format, character count
- Show video source and date detected

### 10.3 Keyboard Shortcuts
- Alt+S: Quick open Subtitles Archiver
- Alt+D: Download selected subtitles
- Alt+C: Convert format

---

## 🚀 Implementation Priority

**Quick Wins (Easy, High Impact):**
1. XHR/Fetch interception (Phase 1.1)
2. Extended player library support (Phase 2.1)
3. Additional subtitle formats (Phase 6.1)
4. Subtitle databases integration (Phase 9.2)

**Medium Complexity (Good ROI):**
1. Lazy-loading iframe detection (Phase 1.2)
2. Service-specific extractors (Phase 3.1)
3. Batch processing (Phase 8.1)
4. Subtitle library management (Phase 8.2)

**Advanced (Specialized Use Cases):**
1. Blob URL tracking (Phase 4.1)
2. Client storage scanning (Phase 4.2)
3. OCR-based extraction (Phase 7.1)

---

## 📋 Technical Architecture

### Content Script Enhancement:
```
VideoDetector
├── Basic Detection (current)
├── XHR Interception (new)
├── Lazy-load Monitoring (new)
├── Storage Scanning (new)
└── Player API Access (expanded)
```

### Background Service Worker Enhancement:
```
SubtitleHandler
├── Format Conversion (current)
├── API Queries (new)
├── Database Caching (new)
└── Batch Processing (new)
```

### Storage Strategy:
```
Chrome Storage
├── User Preferences
├── Subtitle Library (new)
└── Cache (API results, etc)
```

---

## ✅ Success Metrics

- **Breadth:** Support extraction from 50+ known platforms
- **Depth:** 10+ detection methods across all platforms
- **Formats:** Support 12+ subtitle formats
- **Reliability:** 95%+ extraction success rate
- **Speed:** Complete detection in <2 seconds
- **UX:** Intuitive interface with batch operations

---

## 🎯 Conclusion

The current implementation is **excellent**, but these enhancements will transform it into a **universal subtitle archiver** that works everywhere. The phased approach allows for incremental improvements without destabilizing the core functionality.

Each phase builds on previous work, with Phase 1 and 2 providing the highest immediate impact.

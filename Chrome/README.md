# Subtitles Archiver - Chrome Extension

This is the Chrome version of the Subtitles Archiver extension. It has been ported from the Firefox version with Chrome-specific compatibility adjustments.

## Installation

### For Development/Testing:

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `Chrome` folder

## Features

- **Detect Videos**: Automatically detects video elements and embedded players on web pages
- **Extract Subtitles**: Supports 8+ video player libraries (Video.js, Plyr, JW Player, HLS.js, Dash.js, Shaka, Mux, Brightcove)
- **Format Support**: Parse and convert between 8 subtitle formats:
  - SRT (SubRip)
  - VTT (WebVTT)
  - ASS/SSA (Advanced SubStation Alpha)
  - JSON
  - SUB (MicroDVD)
  - SBV (YouTube)
  - SAMI (Synchronized Accessible Media Interchange)
  - TTML/DFXP (Timed Text Markup Language)
- **Network Interception**: Automatically detects subtitle URLs from network requests
- **Storage Scanning**: Finds subtitles cached in localStorage
- **Smart UI**: Modal dialogs for format selection and filename customization
- **Easy Mode**: One-click download of first video's English subtitles in SRT

## Key Differences from Firefox Version

The Chrome version is functionally identical to the Firefox version. The only technical difference is in the manifest:

- **Background Script**: Changed from `"scripts": ["background.js"]` to `"service_worker": "background.js"` (Chrome MV3 requirement)

All other files (content script, popup, utilities) are identical and require no modifications.

## File Structure

```
Chrome/
├── manifest.json              # Chrome extension manifest (MV3)
├── background.js             # Service worker for cross-origin requests
├── content.js               # Content script for video/subtitle detection
├── popup.html               # Popup UI
├── popup.js                 # Popup logic
├── popup.css                # Styling
├── subtitle-parser.js       # Parsing/conversion logic for 8 formats
├── i18n-utils.js           # Language code to name mapping (40+ languages)
├── title-cleanup-utils.js   # Filename sanitization and title cleanup
├── icons/                   # Icon files (16x16, 48x48, 128x128)
└── README.md               # This file
```

## Permissions Explained

- `activeTab`: Required to access the current tab's URL
- `scripting`: Allows content script injection
- `webRequest`: For monitoring network requests (implicit in MV3)
- `webNavigation`: For tracking page navigation
- `storage`: For storing extension state
- `downloads`: Required to download files
- `<all_urls>`: Host permission needed to access all websites

## Testing

The extension works best on:
- YouTube (iframe detection + track elements)
- Vimeo (player library detection)
- Custom HTML5 video players
- Any site using Video.js, Plyr, JW Player, HLS.js, Dash.js, Shaka, Mux, or Brightcove

## Known Limitations

- DRM-protected platforms (Netflix, Disney+, Prime Video) may not provide direct access to subtitle files due to browser security restrictions
- Some single-page applications may need the extension to be refreshed to detect newly loaded videos
- Blob URLs cannot be tracked for security reasons

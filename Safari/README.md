# Subtitles Archiver - Safari Extension

This is the Safari version of the Subtitles Archiver extension, adapted from the Firefox version with necessary compatibility changes for Safari.

## Key Differences from Firefox Version

### API Compatibility Layer

The Safari version uses a compatibility layer to handle differences between the `browser` (Firefox/WebExtensions) and `chrome` (Chrome/Chromium/Safari) APIs:

```javascript
const API = typeof browser !== 'undefined' ? browser : chrome;
```

This allows the same codebase to work across multiple browsers.

### Files Modified for Safari Compatibility

1. **popup.js** - Added API compatibility layer at the beginning
2. **content.js** - Added API compatibility layer for message passing
3. **background.js** - Updated to use the compatibility API for downloads and messaging

### Safari-Specific Considerations

- Safari uses the same Manifest V3 format as Chrome, so the `manifest.json` is compatible
- The `downloads` API works similarly in Safari (requires appropriate permissions)
- Message passing between content and background scripts uses the same API
- Storage and runtime APIs are fully compatible

## Installation for Safari

### Development Installation

1. Navigate to the Safari extension development location
2. Copy this folder to Safari's extensions directory
3. In Safari, go to **Develop** → **Allow Unsigned Extensions** (macOS)
4. Load the extension through **Safari Settings** → **Extensions**

### Important Notes

- Safari has stricter security policies for content scripts compared to Firefox
- Some websites with strong Content Security Policies may prevent full subtitle detection
- The extension requires "All Websites" permission to function properly
- Users may need to authorize the extension for each website in Safari's settings

## File Structure

```
Safari/
├── manifest.json              # Extension configuration
├── popup.html                 # Popup UI
├── popup.js                   # Popup logic (Safari-compatible)
├── popup.css                  # Popup styling
├── background.js              # Background service worker (Safari-compatible)
├── content.js                 # Content script for video/subtitle detection (Safari-compatible)
├── subtitle-parser.js         # Shared subtitle format parsing
├── i18n-utils.js             # Language name utilities
├── title-cleanup-utils.js    # Filename generation utilities
├── icons/                     # Extension icons
└── README.md                  # This file
```

## Features

All features from the Firefox version are fully supported:

- ✅ Detects videos in `<video>` elements
- ✅ Detects subtitle tracks in iframes (YouTube, Vimeo, etc.)
- ✅ Intercepts subtitle URLs via network requests
- ✅ Scans popular video player libraries (Video.js, Plyr, JW Player, HLS.js, Dash.js, Shaka Player, etc.)
- ✅ Supports 8+ subtitle formats (SRT, VTT, ASS, JSON, SUB, SBV, SAMI, TTML)
- ✅ Format conversion during download
- ✅ Smart filename generation
- ✅ Language name display
- ✅ localStorage scanning for cached subtitles
- ✅ Shadow DOM detection for hidden subtitle tracks

## Format Support

| Format | Parse | Export | Notes |
|--------|-------|--------|-------|
| SRT    | ✅    | ✅     | Common |
| VTT    | ✅    | ✅     | Web standard |
| ASS    | ✅    | ✅     | Advanced |
| JSON   | ✅    | ✅     | Custom |
| SUB    | ✅    | ✅     | MicroDVD |
| SBV    | ✅    | ✅     | YouTube format |
| SAMI   | ✅    | ✅     | Legacy format |
| TTML   | ✅    | ✅     | Netflix/Apple |

## Development Notes

### To Update Safari from Firefox Version

If making changes to the Firefox version, apply the same changes to Safari and ensure:

1. Add the API compatibility layer at the top of popup.js, content.js, and background.js
2. Replace all `chrome.` calls with `API.`
3. Verify that new features don't rely on Firefox-specific APIs
4. Test across both Safari and Chrome

### Safari Security Model

- Content scripts run in a more restricted context than Firefox
- Some websites may block extensions entirely
- The extension needs explicit permission for each site/domain
- Blob URLs and data URIs work similarly to Firefox

## Permissions

The extension requires these permissions:

- `activeTab` - To detect content in the active tab
- `scripting` - To inject content scripts
- `webRequest` - For network request monitoring
- `webNavigation` - For page navigation tracking
- `storage` - For storing preferences
- `downloads` - For downloading subtitle files
- `<all_urls>` - To work on any website

## Troubleshooting

### Extension not working on a specific site

Safari may have blocked the extension on that site. Check Safari Settings → Extensions and ensure the extension is enabled for that domain.

### Subtitles not detected

- Try clicking the "Refresh" button in the popup
- Check browser console for errors (right-click → Inspect Element)
- Some sites may use DRM or other techniques to prevent access

### Download fails

- Check Safari's download settings
- Ensure the extension has permission to download files
- Verify the subtitle URL is accessible

## Future Improvements

Potential enhancements for Safari-specific features:

- Service Worker support for background operations
- Native Safari notification APIs
- Integration with macOS Finder for file management
- Safari App Extension features

## Credits

This Safari version maintains full compatibility with the original Firefox extension while adapting to Safari's security model and API requirements.

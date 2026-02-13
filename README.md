# Subtitles Archiver - Firefox Extension

A powerful extension to download and convert subtitles from internet videos.

## Features

### 🎥 Video Detection
- Detects native HTML5 `<video>` elements
- Finds video content in iframes (YouTube, Vimeo, Dailymotion, etc.)
- Discovers video containers with data attributes
- Works with dynamically loaded content
- Scans all frames including nested iframes

### 📥 Subtitle Download
- Downloads embedded subtitles directly from video elements
- Extracts subtitle URLs from page resources
- Supports multiple subtitle tracks
- Handles cross-origin requests with proper error handling

### 🔄 Format Conversion
Convert subtitles between multiple formats:
- **SRT** (SubRip) - Most common, compatible with nearly all players
- **VTT** (WebVTT) - Web standard with styling support
- **ASS/SSA** - Advanced SubStation format with full styling capabilities
- **JSON** - Machine-readable structured format
- **SUB** (MicroDVD) - Legacy format for compatibility

### 🌐 Wide Platform Support
Automatically detects videos from:
- YouTube & YouTube Embed
- Vimeo
- Dailymotion
- Bilibili
- Twitch
- Netflix
- Hulu
- Prime Video
- Generic HTML5 video players
- Any custom video players with standard video elements

## Installation

### For Development/Testing

1. **Clone or download the extension**
   ```bash
   cd SubtitlesArchiver
   ```

2. **Create extension icons** (optional but recommended)
   - Create 16x16, 48x48, and 128x128 PNG images
   - Place them in the `icons/` directory
   - Names: `icon-16.png`, `icon-48.png`, `icon-128.png`
   - Extension works without icons but will show placeholders

3. **Load in Firefox**
   - Open Firefox
   - Navigate to `about:debugging`
   - Click "This Firefox" in the sidebar
   - Click "Load Temporary Add-on"
   - Select the `manifest.json` file from this directory
   - Extension is now active (will be removed when Firefox restarts)

4. **Make it permanent** (optional)
   - Package as `.xpi` file
   - Sign with Mozilla (for distribution) or use unsigned for personal use
   - Load via `about:addons` for persistent use

5. **Pin the extension** (optional)
   - Click the extension icon in the toolbar
   - Pin it for quick access in your toolbar

### For Production (Packaging)

Create a signed XPI package:
```bash
# Create a ZIP file (rename to XPI)
zip -r subtitles-archiver.zip . \
  -x "*.git*" "node_modules/*" ".DS_Store" "*.md" "icons/README.md"

# Rename to .xpi
mv subtitles-archiver.zip subtitles-archiver.xpi
```

Then submit to [Mozilla Add-ons](https://addons.mozilla.org/)

## Usage Guide

### Basic Workflow

1. **Navigate to a webpage with videos**
   - Open any page with video content (native HTML5, YouTube embeds, etc.)
   - Ensure videos and subtitles have fully loaded

2. **Click the extension icon**
   - The popup will automatically scan the page
   - Shows detected videos and available subtitles

3. **Download or Convert Subtitles**

   **Option A: Download embedded subtitles**
   - Click the "📥 Download" button next to a detected video
   - Select desired output format (SRT, VTT, ASS, JSON, SUB)
   - Customize filename if desired
   - Click "✓ Download"

   **Option B: Convert format**
   - Click the "🔄 Convert" button next to a video
   - Select target format
   - The extension will convert and download

   **Option C: Download subtitle URLs**
   - Found subtitles appear in the "Found Subtitles" section
   - Click "📥 Download" to download the original file
   - Click "📋 Copy URL" to copy the link

4. **Refresh if needed**
   - Click the "🔄 Refresh" button to re-scan the page
   - Useful if new videos are loaded dynamically

### Format Selection Guide

| Format | Best For | Compatibility |
|--------|----------|---|
| **SRT** | General use, compatibility | Universal, all players |
| **VTT** | Web, styling support | Modern browsers, most players |
| **ASS** | Professional, advanced formatting | Video editors, some players |
| **JSON** | Data processing, APIs | Programming, automation |
| **SUB** | Legacy systems | Older players, compatibility |

## File Structure

```
SubtitlesArchiver/
├── manifest.json          # Extension metadata and permissions
├── popup.html            # Popup UI template
├── popup.css             # Popup styling
├── popup.js              # Popup UI logic and event handling
├── content.js            # Content script for video detection
├── background.js         # Service worker for background tasks
├── subtitle-parser.js    # Subtitle format parsing and conversion
├── icons/                # Extension icons
│   ├── icon-16.png      # 16x16 icon
│   ├── icon-48.png      # 48x48 icon
│   └── icon-128.png     # 128x128 icon
└── README.md            # This file
```

## How It Works

### Architecture Overview

```
User clicks extension
        ↓
popup.js loads current tab
        ↓
content.js scans for videos/subtitles
        ↓
popup.js displays results
        ↓
User selects download/convert
        ↓
background.js fetches and processes
        ↓
subtitle-parser.js converts format
        ↓
File downloads to user's computer
```

### Key Components

1. **content.js** - Runs in page context
   - Detects video elements (`<video>` tags)
   - Finds iframes with known video platforms
   - Scans for subtitle tracks and URLs
   - Handles dynamically loaded content

2. **popup.js** - Manages UI
   - Displays detected videos and subtitles
   - Handles user interactions
   - Shows download/convert modals
   - Displays status messages

3. **background.js** - Service worker
   - Fetches subtitle files (cross-origin)
   - Handles downloads to disk
   - Processes format conversions
   - Manages API requests

4. **subtitle-parser.js** - Format handling
   - Parses 6 subtitle formats
   - Auto-detects format
   - Converts between formats
   - Handles time synchronization

## Supported Subtitle Formats

### Input Formats (Can Parse)
- **SRT** - SubRip (most common)
- **VTT** - WebVTT (web standard)
- **ASS/SSA** - SubStation Alpha
- **SUB** - MicroDVD
- **JSON** - Generic JSON structures
- **XML** - Various XML subtitle formats

### Output Formats (Can Export)
- **SRT** - Standard format
- **VTT** - Web format
- **ASS** - Professional format
- **JSON** - Data format
- **SUB** - Legacy format

## Browser Permissions

The extension requires these permissions for functionality:

| Permission | Purpose |
|-----------|---------|
| `activeTab` | Get current tab info |
| `scripting` | Run content scripts |
| `downloads` | Download files to disk |
| `storage` | Store user preferences |
| `webNavigation` | Track page navigation |
| `<all_urls>` | Access any webpage |

## Limitations & Workarounds

### CORS Restrictions
**Issue**: Some subtitles on different domains blocked by browser CORS policies
**Workaround**:
- The extension automatically handles CORS preflight
- If still blocked, download subtitle URL directly in a new tab

### DRM Protected Content
**Issue**: Subtitles from streaming services (Netflix, Disney+) may not be accessible
**Workaround**:
- Use platform-specific download tools
- Check if subtitles are available through official exports

### Dynamically Loaded Content
**Issue**: Videos loaded after page load may not be detected
**Workaround**:
- Click "Refresh" button in extension popup
- Wait for videos to fully load before opening popup

### Cross-Origin Iframes
**Issue**: Content from different domains can't be accessed
**Workaround**:
- This is a browser security feature
- Still works for detecting iframe platform type
- Download subtitles through direct URLs

## Troubleshooting

### Extension not detecting videos
- ✓ Ensure page has fully loaded
- ✓ Try clicking the "Refresh" button
- ✓ Check browser console for errors (F12 → Console)
- ✓ Some pages may block extension access

### Can't download subtitles
- ✓ Check if subtitles actually exist on the page
- ✓ Try downloading subtitle URL directly
- ✓ Check for CORS errors in console
- ✓ Some platforms may require authentication

### Format conversion not working
- ✓ Verify source file is valid
- ✓ Try converting to SRT (most universal)
- ✓ Check file is actually readable
- ✓ See console for specific errors

### Downloaded file is empty
- ✓ Subtitle may not have loaded yet
- ✓ Try refreshing page and trying again
- ✓ File may not contain readable subtitles
- ✓ Check downloads folder permissions

## Development

### Adding Support for New Platforms

Edit `content.js` in the `detectIframeVideo()` function:

```javascript
const platforms = {
  'newplatform': {
    regex: /newplatform\.com/,
    name: 'New Platform Name'
  },
  // ... other platforms
};
```

### Adding New Subtitle Formats

1. Add parser in `subtitle-parser.js`:
```javascript
parseNEWFORMAT(content) {
  const subtitles = [];
  // Parse logic
  return subtitles;
}
```

2. Add converter:
```javascript
toNEWFORMAT(subtitles) {
  // Conversion logic
  return formatted;
}
```

3. Update `detectFormat()` to recognize new format

4. Update `parse()` and `parse()` switch statements

### Running Tests Locally

The extension doesn't require build tools. Just:
1. Load it in Firefox as described above
2. Test on various websites
3. Check browser console for errors (F12)
4. Report issues with specific sites

## Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| **Firefox** | 109+ | ✅ Full support |
| **Firefox Mobile** | 109+ | ✅ Full support |
| **Chrome/Chromium** | N/A | ❌ Uses Firefox-specific APIs |
| **Safari** | N/A | ❌ Different extension format |

*Note: Could be adapted for Chromium browsers with MV3 API changes*

## Performance Tips

- **Faster scanning**: Extension uses efficient DOM queries
- **Memory usage**: Only loads and processes subtitles when requested
- **Download speed**: Limited by video platform and internet speed
- **Conversion speed**: Typically < 1 second for normal-length videos

## Security & Privacy

- **No data collection**: Extension operates locally only
- **No external services**: All processing happens in your browser
- **No account required**: Works without login or registration
- **No tracking**: No telemetry or analytics
- **Open source**: Code is visible and auditable

## Common Issues & Solutions

### Issue: "Error: Could not access page"
**Solution**:
- Refresh the webpage
- Some sites block extension content access
- Try on a different site to confirm extension works

### Issue: No subtitles found on YouTube
**Solution**:
- YouTube embeds (iframes) can't be accessed directly
- YouTube videos have subtitles through their native player
- Some videos don't have subtitles enabled

### Issue: Very large subtitle files
**Solution**:
- Large subtitle files are normal
- Check if file actually downloaded
- Some formats may have larger file sizes

## License

This extension is provided as-is for personal, educational, and non-commercial use.

## Credits

Built with:
- Browser extension APIs
- Vanilla JavaScript (no dependencies)
- Open source subtitle format specifications

## Support & Feedback

- **Found a bug?** Check this README first
- **Have a suggestion?** Open an issue
- **Want to contribute?** Submit pull requests
- **Need help?** Check the troubleshooting section

## Future Enhancements

Potential future features:
- Batch download multiple subtitle files
- Advanced subtitle editing before download
- Automatic synchronization timing adjustment
- Subtitle OCR from video stream
- Integration with subtitle databases
- Dark mode support
- Subtitle preview before download
- Custom format templates

---

**Made with ❤️ for subtitle enthusiasts, content archivists, and accessibility advocates**

Last updated: February 2026

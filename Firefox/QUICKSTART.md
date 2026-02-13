# Quick Start Guide

## Installation (2 minutes)

### Step 1: Open Firefox and Load the Extension
1. Open Firefox
2. Type `about:debugging` in the address bar and press Enter
3. Click **"This Firefox"** in the left sidebar
4. Click the **"Load Temporary Add-on"** button
5. Navigate to the extension folder and select **`manifest.json`**
6. ✅ Extension is now loaded!

### Step 2: (Optional) Create Icons for Better Appearance
1. Create 3 PNG images (or download templates):
   - `icon-16.png` - 16×16 pixels
   - `icon-48.png` - 48×48 pixels
   - `icon-128.png` - 128×128 pixels
2. Place them in the `icons/` folder
3. Extension icon will update after reload

## First Use

1. **Navigate to a video page**
   - YouTube, Vimeo, or any site with HTML5 videos
   - Wait for content to load

2. **Click the extension icon**
   - Look for the extension icon in your toolbar (or click ⋮ menu)
   - A popup will appear showing detected videos

3. **Download subtitles**
   - Click **📥 Download** next to any video with subtitles
   - Choose format: SRT (recommended for compatibility)
   - Optionally rename the file
   - Click **✓ Download**

4. **Check Downloads**
   - Open your Downloads folder (Ctrl+J / Cmd+Shift+J)
   - Find your downloaded subtitle file
   - Done! 🎉

## Common Scenarios

### Scenario 1: Download from YouTube Embed
```
1. Open page with YouTube video
2. Click extension icon
3. Videos appear in popup
4. Click Download
5. Select format and download
```

### Scenario 2: Convert SRT to VTT
```
1. Open page with video that has subtitles
2. Click extension icon
3. Click 🔄 Convert (not Download)
4. Select VTT format
5. Download converted file
```

### Scenario 3: Find and Download Subtitle URL
```
1. Open page with embedded subtitles
2. Click extension icon
3. Scroll to "Found Subtitles" section
4. Click 📥 Download next to the URL
5. File downloads directly
```

## Keyboard Shortcuts

- **Ctrl+Shift+K** (Windows/Linux) or **Cmd+Shift+K** (Mac) - Open Firefox extensions menu
- **Ctrl+J** (Windows/Linux) or **Cmd+Shift+J** (Mac) - Open downloads

## Format Selection Tips

| Need | Choose |
|------|--------|
| Universal compatibility | **SRT** |
| Better styling/positioning | **VTT** or **ASS** |
| Professional video editing | **ASS** |
| Data processing/automation | **JSON** |
| Compatibility with old software | **SUB** |

## Troubleshooting

### "No videos detected"
- ✓ Refresh the page
- ✓ Wait for videos to fully load
- ✓ Click "🔄 Refresh" in the extension popup

### Can't find extension icon
- ✓ Click the menu button (⋮) in Firefox toolbar
- ✓ Look for "Subtitles Archiver"
- ✓ Click the pin icon to add to toolbar

### Downloads not working
- ✓ Check your Downloads folder settings
- ✓ Ensure Firefox has permission to download
- ✓ Try a different format (SRT → VTT)
- ✓ Check Firefox console for errors (F12)

### File is empty
- ✓ Video hasn't fully loaded
- ✓ Try clicking refresh and downloading again
- ✓ Some videos may not have downloadable subtitles

## Next Steps

- 📖 Read [README.md](README.md) for detailed documentation
- 🔧 Check file structure for advanced customization
- 🐛 Report issues or request features

## Tips & Tricks

✨ **Pro Tips:**
1. **Batch downloads**: Download multiple subtitles by opening multiple tabs
2. **Quick conversion**: Use the "Convert" button instead of "Download" to change formats
3. **Subtitle URLs**: Copy URLs directly to clipboard with the copy button
4. **Refresh often**: Click refresh if new videos load after page loads
5. **Format choice**: SRT is the safest choice for unknown players

---

**Having trouble?** Restart Firefox and try again. The extension reloads automatically!

Ready to archive subtitles? Start with any video page! 🎬📝

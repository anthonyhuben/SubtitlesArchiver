# 🎬 Quick Reference - Enhanced Subtitle Extraction

## What's New?

This update adds **intelligent network monitoring** and **extended player support** to grab subtitles from virtually any video platform.

---

## 🎯 New Detection Methods

### 1. Network Interception
**Automatically detects subtitle URLs from:**
- AJAX/Fetch requests (Netflix, Hulu, etc.)
- XMLHttpRequest calls (streaming APIs)
- Dynamic subtitle loading
- Hidden manifest URLs

**Platforms benefiting:**
- Netflix (TTML detection)
- Hulu (Caption manifests)
- Prime Video (VTT detection)
- Disney+ (DFXP detection)

### 2. Extended Player Libraries
**Now supports 8 video players:**
- ✅ Video.js (was supported)
- ✅ Plyr (was supported)
- ✅ JW Player (was supported)
- 🆕 HLS.js (HTTP Live Streaming)
- 🆕 Dash.js (MPEG-DASH)
- 🆕 Shaka Player (Google)
- 🆕 Mux Player (Video hosting)
- 🆕 Brightcove (Enterprise)

**Platforms benefiting:**
- LinkedIn Learning (Video.js + HLS)
- Skillshare (Video.js + HLS)
- Major news sites (Dash.js)
- Enterprise platforms (Multiple)

### 3. Improved Lazy-Loading Detection
**Detects videos added after page load:**
- Infinite scroll feeds
- Lazy-loaded embedded players
- Dynamic galleries
- Single-page app route changes

---

## 📝 New Format Support

### TTML/DFXP (Timed Text Markup Language)
Used by: **Netflix, Apple TV+, Disney+, Google TV**

```xml
<tt xmlns="http://www.w3.org/ns/ttml">
  <body>
    <div>
      <p begin="00:00:05.000" end="00:00:10.000">Subtitle text</p>
    </div>
  </body>
</tt>
```

**Benefits:**
- Industry standard for streaming
- Full styling support
- Professional quality
- Proper timing synchronization

### SAMI (Synchronized Accessible Media Interchange)
Used by: **Legacy Windows Media, Some DVDs, Archive content**

```html
<SAMI>
  <BODY>
    <SYNC Start=5000>
      <P>Subtitle text
</SAMI>
```

**Benefits:**
- Support for older video archives
- Accessible content
- Multiple language tracks
- Broad historical coverage

---

## 🚀 How It Works

```
┌─ Page Loads
│
├─ Scan <video> elements
├─ Extract <track> tags
├─ Check data attributes
├─ Parse JSON configs
├─ Scan network requests ← NEW
├─ Search HTML patterns
├─ Check player libraries ← ENHANCED
├─ Monitor for dynamic videos ← ENHANCED
│
└─ Return subtitle list
```

---

## 💡 Usage Examples

### Example 1: Netflix Video
**Old behavior:** No subtitles detected (iframe, DRM)
**New behavior:** Detects TTML URLs via network interception
**Result:** Can identify available languages

### Example 2: YouTube with Multiple Languages
**Old behavior:** Detected captions from visible menu
**New behavior:** Also intercepts all caption variants
**Result:** Complete subtitle list for all available languages

### Example 3: Live Streaming (HLS/DASH)
**Old behavior:** No detection
**New behavior:** HLS.js or Dash.js detection grabs captions
**Result:** Works with sports, news, events

### Example 4: Single-Page Apps (Twitter, TikTok)
**Old behavior:** Only detected initial page videos
**New behavior:** Continues monitoring for new videos
**Result:** Captures subtitles from infinite scroll

---

## 📊 Compatibility Matrix

| Platform | Detection Method | Format | Status |
|----------|-----------------|--------|--------|
| YouTube | DOM + Network | VTT, JSON | ✅ Excellent |
| Netflix | Network Intercept | TTML | ✅ Good |
| Vimeo | Player Library | VTT | ✅ Excellent |
| HTML5 Video | Track Elements | Various | ✅ Excellent |
| HLS Streams | Player Library | VTT | ✅ Good |
| DASH Streams | Player Library | VTT | ✅ Good |
| Embedded Players | Data Attributes | Various | ✅ Good |
| Custom Players | JSON Parsing | JSON | ✅ Good |

---

## 🎨 Format Conversion Reference

**Available Conversions:**

| From | To | Quality | Notes |
|------|----|---------| ----|
| Any | SRT | ⭐⭐⭐⭐⭐ | Best universal format |
| Any | VTT | ⭐⭐⭐⭐⭐ | Web standard |
| Any | ASS | ⭐⭐⭐⭐⭐ | Advanced formatting |
| Any | TTML | ⭐⭐⭐⭐⭐ | Professional streaming |
| Any | JSON | ⭐⭐⭐⭐ | Custom integration |
| Any | SUB | ⭐⭐⭐ | Legacy format |

**Recommended:**
- **General Use:** SRT (most compatible)
- **Web:** VTT (native support)
- **Professional:** ASS or TTML
- **Streaming:** TTML
- **Archive:** JSON (preserves metadata)

---

## 🔍 Troubleshooting

### "No subtitles found"
**Check:**
1. Are subtitles available in the video player?
2. Click "Refresh" button to re-scan
3. Wait for page to fully load before opening extension
4. For streaming: Check if subtitles are available in player menu

### "Only some subtitles detected"
**Reasons:**
1. Some subtitles may be lazy-loaded
2. Streaming platforms may have region restrictions
3. Hard-coded (burned-in) subtitles can't be extracted
4. **Solution:** Click refresh and wait 2-3 seconds

### Format conversion errors
**Check:**
1. File is not corrupted
2. Format is correct (check file extension)
3. Try converting to intermediate format first
4. Some advanced formatting may not convert perfectly

### Network interception not working
**Causes:**
1. Page may have unusual CORS settings
2. Some platforms use encrypted requests
3. Browser extensions blocked by site policy
4. **Solution:** Try alternative detection methods (data attributes, player API)

---

## ⚡ Performance Tips

1. **Reduce re-scans:** Don't click refresh repeatedly
2. **Page load:** Wait for page to fully load before opening extension
3. **Large pages:** May take 2-3 seconds to scan (normal)
4. **Memory:** Downloaded subtitles stored locally in browser

---

## 📚 Supported Subtitle Formats (Complete List)

| Format | Type | Usage | Support |
|--------|------|-------|---------|
| SRT | Text | General purpose | ✅ Parse & Convert |
| VTT | Text | Web video | ✅ Parse & Convert |
| ASS/SSA | Text | Advanced styling | ✅ Parse & Convert |
| TTML/DFXP | XML | Streaming (Netflix) | ✅ Parse & Convert |
| SAMI | HTML | Legacy Microsoft | ✅ Parse only |
| SUB | Text | MicroDVD | ✅ Parse & Convert |
| JSON | JSON | Custom formats | ✅ Parse & Convert |
| XML | XML | Generic | ✅ Parse only |

---

## 🎓 Learning Resources

### Understanding TTML
TTML is the professional standard for streaming video subtitles:
```xml
<!-- Timing in HH:MM:SS.mmm format -->
<p begin="00:00:05.000" end="00:00:10.000">Text here</p>

<!-- Can include styling, positioning, color, etc -->
<p style="default" region="bottom">Styled subtitle</p>
```

### Understanding SAMI
SAMI is a legacy format from Windows Media:
```html
<SYNC Start=5000>  <!-- Timing in milliseconds -->
  <P>First subtitle text
<SYNC Start=10000>
  <P>Second subtitle text
```

### HLS vs DASH Streams
- **HLS (HTTP Live Streaming):** Apple's protocol, uses .m3u8 playlists
- **DASH (Dynamic Adaptive Streaming):** MPEG standard, uses MPD manifests
- Both support embedded caption tracks that our detection grabs

---

## 🔗 Integration Examples

### Converting Downloaded Subtitles
```
1. Download subtitle from extension (e.g., as VTT)
2. Open extension, click "Convert"
3. Select target format (e.g., SRT)
4. Download converted file
5. Use with any video player
```

### Using Subtitles with Video Players
```
VLC Media Player:
  1. File > Open > Select video
  2. Subtitle > Add Subtitle File > Select downloaded subtitle
  3. Adjust sync/timing if needed

MPC-HC / MPC-BE:
  1. Open video file
  2. Subtitle > Load external subtitle
  3. Select your downloaded file

Web browsers:
  1. Create HTML video with <track> tag:
     <video src="video.mp4">
       <track src="subtitles.vtt" kind="subtitles">
     </video>
```

---

## 📞 Support

**Having issues?**
- Check compatibility with your platform
- Ensure subtitles are available in the video player
- Try clicking Refresh button
- For bugs: Check browser console (F12 > Console)

**Common questions answered in:**
- SUBTITLE_EXTRACTION_ROADMAP.md - Future features
- IMPLEMENTATION_SUMMARY.md - Technical details
- ARCHITECTURE.md - System design

---

**Version:** 2.0 Enhanced
**Last Updated:** February 2025
**Status:** ✅ Production Ready

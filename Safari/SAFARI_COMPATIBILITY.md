# Safari Compatibility Guide

This document outlines the compatibility changes made to adapt the Firefox extension for Safari.

## API Differences

### Browser Namespaces

**Firefox:**
```javascript
chrome.tabs.query(...)
chrome.runtime.sendMessage(...)
chrome.downloads.download(...)
```

**Safari (Uses same `chrome` namespace due to WebExtensions compatibility):**
```javascript
chrome.tabs.query(...)
chrome.runtime.sendMessage(...)
chrome.downloads.download(...)
```

However, for maximum compatibility with both Firefox (`browser` namespace) and Safari/Chrome (`chrome` namespace):

```javascript
const API = typeof browser !== 'undefined' ? browser : chrome;
API.tabs.query(...)
API.runtime.sendMessage(...)
API.downloads.download(...)
```

## File-by-File Changes

### popup.js

**Added at the beginning:**
```javascript
const API = typeof browser !== 'undefined' ? browser : chrome;
```

**Changed all references from:**
- `chrome.tabs.query()` → `API.tabs.query()`
- `chrome.tabs.sendMessage()` → `API.tabs.sendMessage()`
- `chrome.runtime.sendMessage()` → `API.runtime.sendMessage()`
- `chrome.runtime.lastError` → `API.runtime.lastError`

### content.js

**Added at the beginning:**
```javascript
const API = typeof browser !== 'undefined' ? browser : chrome;
```

**Changed:**
- `chrome.runtime.onMessage.addListener()` → `API.runtime.onMessage.addListener()`

### background.js

**Added at the beginning:**
```javascript
const API = typeof browser !== 'undefined' ? browser : chrome;
```

**Changed:**
- `chrome.runtime.onMessage.addListener()` → `API.runtime.onMessage.addListener()`
- `chrome.downloads.download()` → `API.downloads.download()`

### manifest.json

The manifest.json uses Manifest V3 format, which is compatible with Safari 15+, Chrome 91+, and Firefox 109+. No changes needed from Firefox version.

## Feature Compatibility Matrix

### Fully Compatible Features

| Feature | Safari | Firefox | Notes |
|---------|--------|---------|-------|
| Video Detection | ✅ | ✅ | Both support `<video>` elements |
| Subtitle Track Extraction | ✅ | ✅ | TextTrack API is standard |
| Network Interception | ✅ | ✅ | Both intercept fetch/XHR |
| Format Parsing | ✅ | ✅ | Pure JavaScript parsing |
| Format Conversion | ✅ | ✅ | Pure JavaScript conversion |
| Downloads | ✅ | ✅ | Both support downloads API |
| Storage API | ✅ | ✅ | Both support browser storage |
| Content Scripts | ✅ | ✅ | Both support content scripts |
| Shadow DOM Detection | ✅ | ✅ | Both support querySelectorAll |
| localStorage Scanning | ✅ | ✅ | Both support localStorage |

### Security Considerations

| Item | Safari | Firefox | Notes |
|------|--------|---------|-------|
| Content Security Policy | Stricter | More Lenient | Safari enforces stricter CSP |
| Cross-Origin Requests | Limited | Full | Safari may restrict more |
| DRM-Protected Content | Blocked | Blocked | Both blocked by browser security |
| Permission Prompts | Per-site | Global | Safari requires per-site auth |

## Known Limitations

### Safari Specific

1. **Per-Site Permissions**: Unlike Firefox, Safari requires users to authorize the extension on each website
   - Users must grant permission in Safari Settings → Extensions
   - Permission can be set to "Always Allow", "Ask", or "Deny"

2. **Service Worker Lifecycle**: Safari's Service Worker implementation is slightly different
   - Background scripts may be terminated more aggressively
   - Use `keepalive: true` for long-running operations if needed

3. **Content Security Policy**: Some sites enforce stricter CSP in Safari
   - May prevent script injection in some cases
   - Workaround: Use message passing instead of direct DOM manipulation

4. **Download Restrictions**: Some sites may prevent downloads in Safari
   - Check browser developer console for errors
   - Some video platforms may have additional DRM restrictions

### Shared Limitations

1. **DRM-Protected Content**
   - Netflix, Disney+, Prime Video content cannot be extracted
   - This is a browser security feature, not an extension limitation

2. **CORS Restrictions**
   - Some subtitle URLs may fail due to CORS policies
   - Workaround: Use the subtitle URL feature to copy and download manually

3. **JavaScript Injection**
   - Some pages block script injection entirely
   - Uses Content-Security-Policy headers

## Testing Checklist

When adapting Firefox features for Safari, verify:

- [ ] All `chrome.` calls use the `API` compatibility layer
- [ ] Message passing works between popup, content, and background
- [ ] Downloads complete successfully
- [ ] Subtitle detection works on major platforms (YouTube, Vimeo, etc.)
- [ ] Format conversion produces valid output files
- [ ] Error messages display correctly
- [ ] Extension icon appears in the Safari toolbar
- [ ] Refresh button works as expected
- [ ] Easy Mode downloads without modal
- [ ] Modal selection works for multiple subtitles
- [ ] Filename generation handles special characters
- [ ] Language display shows correct names

## Browser Support Version Requirements

- **Safari**: 15.0+ (macOS 12+, iOS 15+)
- **Firefox**: 109.0+ (for Manifest V3 support)
- **Chrome**: 91.0+ (Manifest V3 introduction)
- **Edge**: 91.0+ (Chromium-based)

## Migration Strategy

To maintain both Firefox and Safari versions:

1. Keep a single source for utility files (subtitle-parser.js, i18n-utils.js, etc.)
2. Apply the compatibility layer only in browser interaction files (popup.js, content.js, background.js)
3. Test changes on both platforms
4. Document any platform-specific workarounds

## Resources

- [Safari WebExtensions API Documentation](https://developer.apple.com/documentation/safariservices/safari_app_extensions)
- [MDN WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [Manifest V3 Specification](https://developer.chrome.com/docs/extensions/mv3/)

## Notes for Developers

When making changes to either version:

1. **Always test on both platforms**
2. **Use the compatibility layer consistently**
3. **Avoid browser-specific APIs** (use web standards instead)
4. **Document any platform-specific behavior**
5. **Keep utility files synchronized** between versions

The extension is designed to work identically on both platforms while respecting each platform's security and performance requirements.

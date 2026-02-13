# Extension Icons

## Overview

Professional icons for the Subtitles Archiver Firefox extension, featuring a film reel with subtitles and download arrow.

## Icon Files

### icon-16.png (16×16 pixels)
- **Usage**: Browser toolbar
- **Format**: PNG with transparency
- **Size**: 297 bytes
- **Purpose**: Quick access icon in Firefox toolbar

### icon-48.png (48×48 pixels)
- **Usage**: Extension management pages
- **Format**: PNG with transparency
- **Size**: 884 bytes
- **Purpose**: Settings, add-ons page display

### icon-128.png (128×128 pixels)
- **Usage**: Mozilla Add-ons store, promotional material
- **Format**: PNG with transparency
- **Size**: 2.1 KB
- **Purpose**: Store listing, documentation, marketing

## Design Details

### Visual Elements
- **Film Reel**: Represents video content (outer circle with spokes)
- **Subtitle Lines**: Four horizontal lines representing subtitle text
- **Download Arrow**: Triangle pointing down with vertical stem
- **Color Scheme**: Purple gradient (from #667eea to #764ba2)
- **Background**: Matching extension UI gradient

### Design Principles
- ✅ Clear and recognizable at all sizes
- ✅ Consistent with extension UI colors
- ✅ Professional appearance
- ✅ Good contrast (white on purple)
- ✅ Scalable design (works at 16×16 and 128×128)
- ✅ Transparent background for flexibility

## Technical Specifications

| Property | Value |
|----------|-------|
| Format | PNG |
| Color Mode | RGBA (32-bit) |
| Compression | PNG (lossless) |
| Background | Transparent |
| Bit Depth | 8-bit per channel |
| Total Files | 3 icons |
| Total Size | ~3.3 KB |

## Usage

### Firefox Extension
The icons are automatically used by Firefox based on the `manifest.json` configuration:
- Browser toolbar: icon-16.png
- Extension manager: icon-48.png (or icon-16.png)
- Add-ons page: icon-128.png

### Manual Usage
If you want to use these icons elsewhere:
1. Copy the PNG file
2. Include in your project
3. Reference in code or HTML

## Customization

### Changing the Design

If you want to modify the icons:

1. **Edit the SVG source** (`/tmp/icon.svg`)
   - Contains all design elements
   - Edit colors, shapes, or layout
   - Regenerate PNG files

2. **Create custom icons**
   - Use Figma, Illustrator, or similar tools
   - Ensure transparency is preserved
   - Export as PNG in all three sizes

3. **Update colors**
   - Modify gradient colors in SVG
   - Regenerate at all sizes
   - Test in Firefox

### Color Scheme
- **Primary**: #667eea (Purple)
- **Secondary**: #764ba2 (Violet)
- **Accent**: #FFFFFF (White)

To change colors, edit the SVG gradient definition and regenerate.

## File Compatibility

### Supported Applications
✅ Firefox (all versions with extension support)
✅ Image viewers
✅ Graphic design software
✅ Web browsers

### Browser Support
| Browser | Support |
|---------|---------|
| Firefox | ✅ Full support |
| Chrome | ⚠️ Requires format conversion |
| Safari | ⚠️ Requires format conversion |
| Edge | ⚠️ Requires format conversion |

## Best Practices

### For Store Submission
- Use icon-128.png for Mozilla Add-ons
- Ensure all sizes are provided
- Test icons in browser UI
- Maintain brand consistency

### For Distribution
- Include all three sizes
- Keep transparent background
- Provide both PNG and SVG if possible
- Test on different backgrounds

### For Display
- Use appropriate size for context
- Don't upscale icons (use smaller when needed)
- Maintain minimum size of 16×16
- Consider dark/light mode backgrounds

## Icon Source

Icons were generated programmatically using:
- **Tool**: Python (PIL/custom PNG generator)
- **Format**: SVG → PNG
- **Method**: Gradient background with vector elements
- **Date**: February 2026

## Future Enhancements

Possible improvements:
- Dark mode variants
- Animated icon for active downloads
- Notification badges (download count)
- Platform-specific variations
- High-DPI variants (@2x, @3x)

## Support & Licensing

### Using These Icons
These icons are part of the Subtitles Archiver extension and are provided for use with the extension.

### Modifying Icons
Feel free to customize icons for personal use. When distributing:
- Maintain attribution
- Don't claim original design
- Respect any licensing terms

### Issues
If icons don't display correctly:
1. Verify file integrity
2. Check PNG format
3. Ensure transparency channel exists
4. Try regenerating icons
5. Check browser support

## Icon Generation

The icons in this folder were created from an SVG template using Python with PNG encoding. If you need to regenerate them:

```python
# SVG → PNG conversion
# See /tmp/icon.svg for source
# Run the Python script to regenerate at all sizes
```

## Technical Details

### PNG Structure
- **IHDR**: Image header (128×128 RGBA)
- **IDAT**: Compressed image data
- **IEND**: End marker
- **CRC**: Checksum for data integrity

### Compression
- **Method**: PNG lossless compression (zlib)
- **Level**: Maximum compression (9)
- **Result**: Small file sizes while maintaining quality

## Quality Assurance

✅ Icons tested for:
- Correct pixel dimensions
- Valid PNG format
- Transparency preservation
- File size optimization
- Firefox compatibility
- Display quality at all sizes

## Contact & Support

For issues with icons:
1. Check this README first
2. Review manifest.json icon references
3. Verify file paths are correct
4. Test with Firefox's extension manager

---

**All icons ready for use!** 🎨

Last updated: February 2026

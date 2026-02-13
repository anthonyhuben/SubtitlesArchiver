# Smart Title Cleanup Feature

## Overview
The SubtitlesArchiver extension now includes smart title cleanup functionality that automatically improves video titles when generating filenames for downloaded subtitles.

## Features

### 1. **Underscore Replacement**
   - Replaces all underscores (`_`) with spaces
   - Example: `my_awesome_video` → `my awesome video`

### 2. **Title Case Conversion**
   - Converts text to proper Title Case
   - Capitalizes the first letter of significant words
   - Keeps articles and prepositions lowercase (unless they're the first word)
   - Example: `the lord of the rings` → `The Lord of the Rings`

### 3. **Single Space Normalization**
   - Removes extra spaces between words
   - Ensures exactly one space between words
   - Example: `hello   world` → `hello world`

## Implementation Details

### New File: `title-cleanup-utils.js`
A utility module containing the `TitleCleanupUtils` object with three methods:

#### `cleanupTitle(title)`
- **Input**: Raw title string (may contain underscores, inconsistent spacing, mixed case)
- **Output**: Cleaned title with proper formatting
- **Process**:
  1. Replace underscores with spaces
  2. Collapse multiple spaces into single space
  3. Trim leading/trailing whitespace
  4. Apply Title Case formatting

#### `toTitleCase(str)`
- **Input**: String to convert
- **Output**: Title-cased string
- **Features**:
  - First word always capitalized
  - Common articles/prepositions stay lowercase: `a`, `an`, `the`, `and`, `or`, `of`, `in`, `on`, `at`, `to`, `by`, `from`, `with`, `for`, `is`, `are`, `was`, `were`, `be`, `been`, `being`, `as`, `if`, `per`, `vs`, `v`

#### `sanitizeFilename(title, maxLength = 50)`
- **Input**: Title string, optional max length
- **Output**: Safe filename string
- **Process**:
  1. Apply `cleanupTitle()` first
  2. Remove invalid filename characters
  3. Replace spaces with underscores
  4. Limit to maxLength (default 50)
  5. Remove trailing underscores

### Updated File: `popup.html`
- Added script import: `<script src="title-cleanup-utils.js"></script>`

### Updated File: `popup.js`
- Modified `generateFilename()` function to use `TitleCleanupUtils.sanitizeFilename()`
- Includes fallback to original behavior if utility doesn't load

## Examples

| Input | Cleanup Output | Filename Output |
|-------|----------------|-----------------|
| `video___title___here` | `Video Title Here` | `Video_Title_Here` |
| `my_awesome_video_title` | `My Awesome Video Title` | `My_Awesome_Video_Title` |
| `the lord of the rings` | `The Lord of the Rings` | `The_Lord_of_the_Rings` |
| `test___with____multiple___underscores` | `Test with Multiple Underscores` | `Test_with_Multiple_Underscores` |
| `HELLO   WORLD   TEST` | `Hello World Test` | `Hello_World_Test` |

## Impact on Existing Features

- ✅ **Backwards Compatible**: Original behavior preserved with fallback
- ✅ **No Breaking Changes**: Only affects filename generation
- ✅ **Improved UX**: Filenames are now more readable and professional
- ✅ **Works with Language Suffix**: Compatible with existing language code appending (e.g., `_English`, `_Spanish`)

## Usage

No changes required to existing code. The feature automatically activates when:
1. User clicks download for video subtitles
2. Filename is generated from video title
3. User sees improved, cleaned-up filename in the modal

The utility can also be used directly in other parts of the extension:
```javascript
// Just clean the title for display
const displayTitle = TitleCleanupUtils.cleanupTitle(rawTitle);

// Generate a safe filename
const filename = TitleCleanupUtils.sanitizeFilename(rawTitle);
```

/**
 * Title cleanup utilities for smart formatting
 */

const TitleCleanupUtils = {
  /**
   * Smart title cleanup with multiple transformations:
   * - Replace underscores with spaces
   * - Convert to Title Case
   * - Ensure single spaces between words
   */
  cleanupTitle(title) {
    if (!title || typeof title !== 'string') {
      return '';
    }

    // Replace underscores with spaces
    let cleaned = title.replace(/_/g, ' ');

    // Replace multiple spaces with single space
    cleaned = cleaned.replace(/\s+/g, ' ');

    // Trim leading/trailing spaces
    cleaned = cleaned.trim();

    // Convert to Title Case
    cleaned = this.toTitleCase(cleaned);

    return cleaned;
  },

  /**
   * Convert string to Title Case
   * Capitalizes first letter of each word
   * Handles common lowercase words that should remain lowercase
   */
  toTitleCase(str) {
    // Words that should remain lowercase (unless at start of string)
    const lowercaseWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'nor', 'so', 'yet',
      'of', 'in', 'on', 'at', 'to', 'by', 'from', 'with', 'for',
      'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'as', 'if', 'per', 'vs', 'v'
    ]);

    return str
      .split(' ')
      .map((word, index) => {
        // Always capitalize the first word
        if (index === 0) {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }

        // Check if word should stay lowercase
        if (lowercaseWords.has(word.toLowerCase())) {
          return word.toLowerCase();
        }

        // Capitalize other words
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  },

  /**
   * Sanitize filename while preserving readability
   * - Removes invalid characters
   * - Applies title cleanup
   * - Converts to camelCase (capitalize first letter of each word, remove spaces)
   * - Limits length
   */
  sanitizeFilename(title, maxLength = 50) {
    // First clean up the title
    let cleaned = this.cleanupTitle(title);

    // Remove or replace invalid filename characters
    // Keep: letters, numbers, spaces, hyphens
    cleaned = cleaned.replace(/[^a-z0-9\s\-]/gi, '');

    // Ensure single spaces
    cleaned = cleaned.replace(/\s+/g, ' ');

    // Convert to camelCase: split by spaces and capitalize each word
    cleaned = cleaned
      .trim()
      .split(/[\s\-]+/) // Split on spaces or hyphens
      .map((word, index) => {
        // Skip empty words
        if (!word) return '';
        // Capitalize first letter of each word
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(''); // Join without spaces

    // Limit length
    cleaned = cleaned.substring(0, maxLength);

    return cleaned || 'subtitles';
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TitleCleanupUtils;
}

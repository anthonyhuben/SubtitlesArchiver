/**
 * Internationalization utilities for language codes and names
 */

const I18nUtils = {
  /**
   * ISO 639-1 language code to full name mapping
   */
  languageNames: {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'zh': 'Chinese',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'ko': 'Korean',
    'vi': 'Vietnamese',
    'th': 'Thai',
    'pl': 'Polish',
    'tr': 'Turkish',
    'nl': 'Dutch',
    'sv': 'Swedish',
    'da': 'Danish',
    'fi': 'Finnish',
    'no': 'Norwegian',
    'el': 'Greek',
    'hu': 'Hungarian',
    'cs': 'Czech',
    'sk': 'Slovak',
    'ro': 'Romanian',
    'uk': 'Ukrainian',
    'he': 'Hebrew',
    'id': 'Indonesian',
    'ms': 'Malay',
    'fil': 'Filipino',
    'bn': 'Bengali',
    'ta': 'Tamil',
    'te': 'Telugu',
    'mr': 'Marathi',
    'gu': 'Gujarati',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'pa': 'Punjabi',
    'fa': 'Persian',
    'ur': 'Urdu',
    'bg': 'Bulgarian',
    'hr': 'Croatian',
    'sr': 'Serbian',
    'sl': 'Slovenian',
    'et': 'Estonian',
    'lv': 'Latvian',
    'lt': 'Lithuanian',
    'af': 'Afrikaans',
    'eu': 'Basque',
    'gl': 'Galician',
    'ca': 'Catalan',
    'mk': 'Macedonian',
    'is': 'Icelandic',
    'ga': 'Irish',
    'cy': 'Welsh',
    'sq': 'Albanian',
    'mt': 'Maltese',
    'sw': 'Swahili',
    'zu': 'Zulu',
    'xh': 'Xhosa'
  },

  /**
   * Get full language name from ISO 639-1 code
   * Falls back to Intl.DisplayNames if available (modern browsers)
   * Returns the original code if no mapping found
   */
  getLanguageName(code) {
    if (!code) return 'Unknown';

    // Extract base language code if it contains region (e.g., 'en-US' -> 'en')
    const baseCode = code.split('-')[0].toLowerCase();

    // Try to use native Intl.DisplayNames API if available (more accurate, localized)
    try {
      if (typeof Intl !== 'undefined' && Intl.DisplayNames) {
        const displayNames = new Intl.DisplayNames(['en'], { type: 'language' });
        const name = displayNames.of(baseCode);
        if (name && name !== baseCode) {
          return name.charAt(0).toUpperCase() + name.slice(1);
        }
      }
    } catch (e) {
      // Fallback to hardcoded list
    }

    // Use hardcoded mapping
    if (this.languageNames[baseCode]) {
      return this.languageNames[baseCode];
    }

    // Return capitalized code if no mapping found
    return baseCode.toUpperCase();
  },

  /**
   * Format a language display string from code and label
   * Example: code='en', label='English' -> 'English'
   * Example: code='en-US', label=undefined -> 'English (US)'
   * Example: code='unknown', label='Manual' -> 'Manual'
   */
  formatLanguageDisplay(code, label) {
    // Use label if provided
    if (label && label !== 'unknown' && label !== code) {
      return label;
    }

    // Otherwise use code to generate name
    const name = this.getLanguageName(code);

    // If code includes region, append it
    if (code && code.includes('-')) {
      const region = code.split('-')[1].toUpperCase();
      if (name !== code.toUpperCase()) {
        return `${name} (${region})`;
      }
    }

    return name;
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = I18nUtils;
}

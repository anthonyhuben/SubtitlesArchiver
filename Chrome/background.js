/**
 * Background Service Worker
 * Handles cross-origin requests, downloads, and conversions
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchAndDownload') {
    fetchAndDownloadSubtitle(request.url, request.filename, request.format)
      .then(success => sendResponse({ success }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request.action === 'convertAndDownload') {
    convertAndDownloadSubtitle(request.url, request.filename, request.targetFormat)
      .then(success => sendResponse({ success }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (request.action === 'downloadUrl') {
    downloadUrl(request.url, request.filename)
      .then(success => sendResponse({ success }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

/**
 * Fetch subtitle from URL and download in specified format
 */
async function fetchAndDownloadSubtitle(url, filename, format) {
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const content = await response.text();
    const subtitles = SubtitleParser.parse(content, 'auto');

    if (subtitles.length === 0) {
      throw new Error('No subtitles found in file');
    }

    let converted;
    const extension = getExtensionForFormat(format);

    switch (format.toLowerCase()) {
      case 'srt':
        converted = SubtitleParser.toSRT(subtitles);
        break;
      case 'vtt':
        converted = SubtitleParser.toVTT(subtitles);
        break;
      case 'ass':
        converted = SubtitleParser.toASS(subtitles);
        break;
      case 'json':
        converted = SubtitleParser.toJSON(subtitles);
        break;
      case 'sub':
        converted = SubtitleParser.toSUB(subtitles);
        break;
      case 'sbv':
        converted = SubtitleParser.toSBV(subtitles);
        break;
      case 'sami':
        converted = SubtitleParser.toSAMI(subtitles);
        break;
      case 'ttml':
      case 'dfxp':
        converted = SubtitleParser.toTTML(subtitles);
        break;
      default:
        converted = content;
    }

    await downloadFile(converted, filename + extension);
    return true;
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
}

/**
 * Convert subtitle format and download
 */
async function convertAndDownloadSubtitle(url, filename, targetFormat) {
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const content = await response.text();
    const subtitles = SubtitleParser.parse(content, 'auto');

    if (subtitles.length === 0) {
      throw new Error('No subtitles found in file');
    }

    let converted;
    const extension = getExtensionForFormat(targetFormat);

    switch (targetFormat.toLowerCase()) {
      case 'srt':
        converted = SubtitleParser.toSRT(subtitles);
        break;
      case 'vtt':
        converted = SubtitleParser.toVTT(subtitles);
        break;
      case 'ass':
        converted = SubtitleParser.toASS(subtitles);
        break;
      case 'json':
        converted = SubtitleParser.toJSON(subtitles);
        break;
      case 'sub':
        converted = SubtitleParser.toSUB(subtitles);
        break;
      case 'sbv':
        converted = SubtitleParser.toSBV(subtitles);
        break;
      case 'sami':
        converted = SubtitleParser.toSAMI(subtitles);
        break;
      case 'ttml':
      case 'dfxp':
        converted = SubtitleParser.toTTML(subtitles);
        break;
      default:
        throw new Error('Unsupported format: ' + targetFormat);
    }

    await downloadFile(converted, filename + extension);
    return true;
  } catch (error) {
    console.error('Conversion error:', error);
    throw error;
  }
}

/**
 * Download file directly from URL
 */
async function downloadUrl(url, filename) {
  try {
    return new Promise((resolve, reject) => {
      chrome.downloads.download({
        url: url,
        filename: filename,
        saveAs: false
      }, (downloadId) => {
        if (downloadId) {
          resolve(true);
        } else {
          reject(new Error('Failed to start download'));
        }
      });
    });
  } catch (error) {
    console.error('URL download error:', error);
    throw error;
  }
}

/**
 * Download converted content as file
 */
async function downloadFile(content, filename) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: false
    }, (downloadId) => {
      setTimeout(() => URL.revokeObjectURL(url), 100);

      if (downloadId) {
        resolve(true);
      } else {
        reject(new Error('Failed to download file'));
      }
    });
  });
}

/**
 * Get file extension for format
 */
function getExtensionForFormat(format) {
  const extensions = {
    'srt': '.srt',
    'vtt': '.vtt',
    'ass': '.ass',
    'ssa': '.ssa',
    'json': '.json',
    'sub': '.sub',
    'sbv': '.sbv',
    'sami': '.sami',
    'ttml': '.ttml',
    'dfxp': '.dfxp'
  };
  return extensions[format.toLowerCase()] || '.' + format.toLowerCase();
}

/**
 * Subtitle Parser (duplicate for background script)
 */
const SubtitleParser = {
  parse(content, format = 'auto') {
    if (format === 'auto') {
      format = this.detectFormat(content);
    }
    format = format.toLowerCase();
    switch (format) {
      case 'srt':
        return this.parseSRT(content);
      case 'vtt':
        return this.parseVTT(content);
      case 'ass':
      case 'ssa':
        return this.parseASS(content);
      case 'sub':
        return this.parseSUB(content);
      case 'sbv':
        return this.parseSBV(content);
      case 'sami':
        return this.parseSAMI(content);
      case 'json':
        return this.parseJSON(content);
      case 'xml':
        return this.parseXML(content);
      default:
        return [];
    }
  },

  detectFormat(content) {
    // Sample more content for better detection (1000+ chars instead of 500)
    const sample = content.substring(0, 1000).toLowerCase().trimStart();

    // Strip BOM if present
    const cleanSample = sample.replace(/^\ufeff/, '');

    // Check specific formats first (most specific patterns)
    if (cleanSample.includes('webvtt')) return 'vtt';
    if (cleanSample.includes('[script info]')) return 'ass';
    if (cleanSample.includes('[v4+ styles]') || cleanSample.includes('[v4 styles]')) return 'ass';

    // SRT pattern: number on first line, then HH:MM:SS timestamp
    if (/^\d+\s*\n\s*\d{2}:\d{2}:\d{2}/.test(cleanSample)) return 'srt';

    // SBV pattern: HH:MM:SS.mmm on its own line, followed by text
    if (/^\d{2}:\d{2}:\d{2}\.\d{3}\s*\n/.test(cleanSample)) return 'sbv';

    // TTML/DFXP detection with namespace awareness
    if ((cleanSample.includes('<tt ') || cleanSample.includes('<div ')) &&
        (cleanSample.includes('xmlns="http://www.w3.org/ns/ttml') || (cleanSample.includes('begin=') && cleanSample.includes('end=')))) {
      return 'ttml';
    }

    // SAMI detection
    if (cleanSample.includes('<sync') || cleanSample.includes('<sami')) return 'sami';

    // XML detection (with or without declaration)
    if (cleanSample.includes('<?xml') || (cleanSample.includes('<') && cleanSample.includes('xmlns'))) return 'xml';

    // JSON detection
    if (cleanSample.includes('{') && (cleanSample.includes('"') || cleanSample.includes("'"))) return 'json';

    // SUB (MicroDVD) format: {frame}{frame}text pattern
    if (/^\{.*?\}\{.*?\}/.test(cleanSample)) return 'sub';

    // Generic XML fallback
    if (cleanSample.includes('<')) return 'xml';

    return 'unknown';
  },

  parseSRT(content) {
    const subtitles = [];
    const blocks = content.split(/\n\s*\n/);
    blocks.forEach(block => {
      const lines = block.trim().split('\n');
      if (lines.length < 3) return;
      const timeMatch = lines[1].match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
      if (!timeMatch) return;
      const startMs = parseInt(timeMatch[1]) * 3600000 + parseInt(timeMatch[2]) * 60000 + parseInt(timeMatch[3]) * 1000 + parseInt(timeMatch[4]);
      const endMs = parseInt(timeMatch[5]) * 3600000 + parseInt(timeMatch[6]) * 60000 + parseInt(timeMatch[7]) * 1000 + parseInt(timeMatch[8]);
      const text = lines.slice(2).join('\n').trim();
      subtitles.push({
        index: subtitles.length + 1,
        startMs: startMs,
        endMs: endMs,
        text: text,
        startTime: this.msToTime(startMs),
        endTime: this.msToTime(endMs)
      });
    });
    return subtitles;
  },

  parseVTT(content) {
    const subtitles = [];
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const timeMatch = lines[i].match(/(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})\.(\d{3})/);
      if (!timeMatch) continue;
      const startMs = parseInt(timeMatch[1]) * 3600000 + parseInt(timeMatch[2]) * 60000 + parseInt(timeMatch[3]) * 1000 + parseInt(timeMatch[4]);
      const endMs = parseInt(timeMatch[5]) * 3600000 + parseInt(timeMatch[6]) * 60000 + parseInt(timeMatch[7]) * 1000 + parseInt(timeMatch[8]);
      let text = '';
      i++;
      while (i < lines.length && lines[i].trim() !== '') {
        text += (text ? '\n' : '') + lines[i];
        i++;
      }
      if (text.trim()) {
        subtitles.push({
          index: subtitles.length + 1,
          startMs: startMs,
          endMs: endMs,
          text: text.trim(),
          startTime: this.msToTime(startMs),
          endTime: this.msToTime(endMs)
        });
      }
    }
    return subtitles;
  },

  parseASS(content) {
    const subtitles = [];
    const lines = content.split('\n');
    let inEvents = false;
    let dialogueIndex = -1;
    lines.forEach(line => {
      if (line.startsWith('[Events]')) {
        inEvents = true;
        return;
      }
      if (inEvents && line.startsWith('Dialogue:')) {
        dialogueIndex++;
        const parts = line.substring(9).split(',');
        if (parts.length < 10) return;
        const startTime = this.assTimeToMs(parts[1].trim());
        const endTime = this.assTimeToMs(parts[2].trim());
        const text = parts.slice(9).join(',').trim();
        subtitles.push({
          index: dialogueIndex + 1,
          startMs: startTime,
          endMs: endTime,
          text: this.stripASSFormatting(text),
          startTime: this.msToTime(startTime),
          endTime: this.msToTime(endTime)
        });
      }
    });
    return subtitles;
  },

  parseSUB(content) {
    const subtitles = [];
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      const match = line.match(/\{(\d+)\}\{(\d+)\}(.+)/);
      if (!match) return;
      const startFrames = parseInt(match[1]);
      const endFrames = parseInt(match[2]);
      const text = match[3];
      const fps = 25;
      const startMs = (startFrames / fps) * 1000;
      const endMs = (endFrames / fps) * 1000;
      subtitles.push({
        index: index + 1,
        startMs: startMs,
        endMs: endMs,
        text: this.stripSubFormatting(text),
        startTime: this.msToTime(startMs),
        endTime: this.msToTime(endMs)
      });
    });
    return subtitles;
  },

  parseJSON(content) {
    try {
      const data = JSON.parse(content);
      if (Array.isArray(data)) {
        return data.map((item, index) => ({
          index: index + 1,
          startMs: item.startMs || item.start || 0,
          endMs: item.endMs || item.end || 0,
          text: item.text || item.content || '',
          startTime: this.msToTime(item.startMs || item.start || 0),
          endTime: this.msToTime(item.endMs || item.end || 0)
        }));
      } else if (data.subtitles) {
        return this.parseJSON(JSON.stringify(data.subtitles));
      } else if (data.captions) {
        return this.parseJSON(JSON.stringify(data.captions));
      }
    } catch (e) {
      console.error('JSON parsing error:', e);
    }
    return [];
  },

  parseXML(content) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(content, 'application/xml');
      if (xmlDoc.parsererror) return [];
      const subtitles = [];
      let items = xmlDoc.querySelectorAll('subtitle, entry, cue, paragraph');
      if (!items.length) items = xmlDoc.querySelectorAll('*');
      items.forEach((item, index) => {
        const startAttr = item.getAttribute('start') || item.getAttribute('startTime') || '';
        const endAttr = item.getAttribute('end') || item.getAttribute('endTime') || '';
        const text = item.textContent || '';
        if (startAttr && endAttr && text) {
          const startMs = this.timeStringToMs(startAttr);
          const endMs = this.timeStringToMs(endAttr);
          subtitles.push({
            index: index + 1,
            startMs: startMs,
            endMs: endMs,
            text: text.trim(),
            startTime: this.msToTime(startMs),
            endTime: this.msToTime(endMs)
          });
        }
      });
      return subtitles;
    } catch (e) {
      console.error('XML parsing error:', e);
      return [];
    }
  },

  toSRT(subtitles) {
    return subtitles.map(sub => {
      const start = this.msToSRTTime(sub.startMs);
      const end = this.msToSRTTime(sub.endMs);
      return `${sub.index}\n${start} --> ${end}\n${sub.text}\n`;
    }).join('\n');
  },

  toVTT(subtitles) {
    let vtt = 'WEBVTT\n\n';
    vtt += subtitles.map(sub => {
      const start = this.msToVTTTime(sub.startMs);
      const end = this.msToVTTTime(sub.endMs);
      return `${start} --> ${end}\n${sub.text}\n`;
    }).join('\n');
    return vtt;
  },

  toASS(subtitles) {
    const header = `[Script Info]
Title: Subtitles
ScriptType: v4.00+

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,68,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,2,0,0,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
    const events = subtitles.map(sub => {
      const start = this.msToAssTime(sub.startMs);
      const end = this.msToAssTime(sub.endMs);
      return `Dialogue: 0,${start},${end},Default,,0,0,0,,${sub.text}`;
    }).join('\n');
    return header + events;
  },

  toJSON(subtitles) {
    return JSON.stringify(subtitles, null, 2);
  },

  toSUB(subtitles) {
    const fps = 25;
    return subtitles.map(sub => {
      const startFrame = Math.round((sub.startMs / 1000) * fps);
      const endFrame = Math.round((sub.endMs / 1000) * fps);
      return `{${startFrame}}{${endFrame}}${sub.text}`;
    }).join('\n');
  },

  toSBV(subtitles) {
    return subtitles.map(sub => {
      const start = this.msToSBVTime(sub.startMs);
      const end = this.msToSBVTime(sub.endMs);
      return `${start},${end}\n${sub.text}`;
    }).join('\n\n');
  },

  toSAMI(subtitles) {
    const header = `<SAMI>
<HEAD>
<TITLE>Subtitles</TITLE>
<STYLE TYPE="text/css">
<!--
P { font-family: Arial; font-weight: normal; color: white; background-color: black; text-align: center; }
.ENCC { lang: en-US; }
-->
</STYLE>
</HEAD>
<BODY>`;

    const events = subtitles.map(sub => {
      return `<SYNC Start="${Math.round(sub.startMs)}">
<P Class="ENCC">${this.escapeHTML(sub.text)}</P>
</SYNC>`;
    }).join('\n');

    const footer = `</BODY>
</SAMI>`;

    return header + '\n' + events + '\n' + footer;
  },

  parseSBV(content) {
    const subtitles = [];
    const lines = content.split('\n');
    let index = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Match SBV time format: HH:MM:SS.mmm,HH:MM:SS.mmm
      const timeMatch = line.match(/^(\d{2}):(\d{2}):(\d{2})\.(\d{3}),(\d{2}):(\d{2}):(\d{2})\.(\d{3})$/);
      if (!timeMatch) continue;

      const startMs = parseInt(timeMatch[1]) * 3600000 + parseInt(timeMatch[2]) * 60000 + parseInt(timeMatch[3]) * 1000 + parseInt(timeMatch[4]);
      const endMs = parseInt(timeMatch[5]) * 3600000 + parseInt(timeMatch[6]) * 60000 + parseInt(timeMatch[7]) * 1000 + parseInt(timeMatch[8]);

      // Collect text lines until blank line
      let text = '';
      i++;
      while (i < lines.length && lines[i].trim() !== '') {
        text += (text ? '\n' : '') + lines[i];
        i++;
      }

      if (text.trim()) {
        index++;
        subtitles.push({
          index: index,
          startMs: startMs,
          endMs: endMs,
          text: text.trim(),
          startTime: this.msToTime(startMs),
          endTime: this.msToTime(endMs)
        });
      }
    }

    return subtitles;
  },

  parseSAMI(content) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');

      const subtitles = [];
      let index = 0;

      // Find all SYNC elements
      const syncs = doc.querySelectorAll('sync');
      for (let i = 0; i < syncs.length; i++) {
        const sync = syncs[i];
        const startMs = parseInt(sync.getAttribute('start')) || 0;

        // Get end time from next sync or assume same duration
        let endMs = startMs + 5000; // Default 5 second duration
        if (i + 1 < syncs.length) {
          endMs = parseInt(syncs[i + 1].getAttribute('start')) || endMs;
        }

        // Extract P elements for text
        const pElements = sync.querySelectorAll('p');
        pElements.forEach(p => {
          const text = p.textContent || '';
          if (text.trim() && text.toLowerCase() !== '&nbsp;') {
            index++;
            subtitles.push({
              index: index,
              startMs: startMs,
              endMs: endMs,
              text: text.trim(),
              startTime: this.msToTime(startMs),
              endTime: this.msToTime(endMs)
            });
          }
        });
      }

      return subtitles;
    } catch (e) {
      console.error('SAMI parsing error:', e);
      return [];
    }
  },

  msToSBVTime(ms) {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor(ms % 1000);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
  },

  escapeHTML(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  },

  msToTime(ms) {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = ms % 1000;
    return { hours, minutes, seconds, milliseconds };
  },

  msToSRTTime(ms) {
    const time = this.msToTime(ms);
    return `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')},${String(time.milliseconds).padStart(3, '0')}`;
  },

  msToVTTTime(ms) {
    const time = this.msToTime(ms);
    return `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}.${String(time.milliseconds).padStart(3, '0')}`;
  },

  msToAssTime(ms) {
    const time = this.msToTime(ms);
    return `${String(time.hours).padStart(1, '0')}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}.${Math.floor(time.milliseconds / 10).toString().padStart(2, '0')}`;
  },

  assTimeToMs(timeStr) {
    const match = timeStr.match(/(\d+):(\d{2}):(\d{2})\.(\d{2})/);
    if (!match) return 0;
    const hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const seconds = parseInt(match[3]);
    const centiseconds = parseInt(match[4]);
    return hours * 3600000 + minutes * 60000 + seconds * 1000 + centiseconds * 10;
  },

  timeStringToMs(timeStr) {
    const srtMatch = timeStr.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
    if (srtMatch) {
      return parseInt(srtMatch[1]) * 3600000 + parseInt(srtMatch[2]) * 60000 + parseInt(srtMatch[3]) * 1000 + parseInt(srtMatch[4]);
    }
    const vttMatch = timeStr.match(/(\d{2}):(\d{2}):(\d{2})\.(\d{3})/);
    if (vttMatch) {
      return parseInt(vttMatch[1]) * 3600000 + parseInt(vttMatch[2]) * 60000 + parseInt(vttMatch[3]) * 1000 + parseInt(vttMatch[4]);
    }
    return 0;
  },

  stripASSFormatting(text) {
    return text.replace(/\{[^}]+\}/g, '');
  },

  stripSubFormatting(text) {
    return text.replace(/\|[A-Z]\|/g, '');
  }
};

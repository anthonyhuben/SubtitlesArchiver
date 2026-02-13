/**
 * Popup UI Logic
 */

let currentTab = null;
let detectedVideos = [];
let detectedSubtitles = [];

// DOM Elements
const statusEl = document.getElementById('status');
const loadingEl = document.getElementById('loading');
const videosSectionEl = document.getElementById('videos-section');
const subtitlesSectionEl = document.getElementById('subtitles-section');
const videosListEl = document.getElementById('videos-list');
const subtitlesListEl = document.getElementById('subtitles-list');
const emptyStateEl = document.getElementById('empty-state');
const videoCountEl = document.getElementById('video-count');
const subtitleCountEl = document.getElementById('subtitle-count');
const refreshBtn = document.getElementById('refresh-btn');
const easyModeBtn = document.getElementById('easy-mode-btn');
const modalEl = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const closeBtn = document.querySelector('.close');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    currentTab = tabs[0];
    scanForVideos();
  });
});

// Event Listeners
refreshBtn.addEventListener('click', scanForVideos);
easyModeBtn.addEventListener('click', quickDownload);
closeBtn.addEventListener('click', closeModal);

// Close modal when clicking outside of it
window.addEventListener('click', (e) => {
  if (e.target === modalEl) closeModal();
});

/**
 * Quick download the first video's English subtitles in SRT format
 */
function quickDownload() {
  if (detectedVideos.length === 0) {
    showStatus('No videos found. Scan for videos first.', 'error');
    return;
  }

  const video = detectedVideos[0];
  if (!video.subtitles || video.subtitles.length === 0) {
    showStatus('No subtitles found in the first video', 'error');
    return;
  }

  // Find English subtitle index
  let englishIndex = 0;
  const foundIndex = video.subtitles.findIndex(sub =>
    sub.srclang && (sub.srclang.toLowerCase().startsWith('en'))
  );
  englishIndex = foundIndex >= 0 ? foundIndex : 0;

  const filename = generateFilename(video.title);
  downloadVideoSubtitles(video, 'srt', filename, englishIndex);
}

/**
 * Scan current page for videos and subtitles
 */
function scanForVideos() {
  showStatus('Scanning for videos...', 'info');
  showLoading(true);
  hideAllSections();

  chrome.tabs.sendMessage(currentTab.id, { action: 'detectVideos' }, (response) => {
    if (chrome.runtime.lastError) {
      const error = chrome.runtime.lastError.message;
      let message = 'Error: Could not scan this page. Try refreshing.';

      if (error.includes('Cannot access') || error.includes('extension')) {
        message = 'Permission denied: This page cannot be accessed by the extension (check browser security settings).';
      }

      showStatus(message, 'error');
      showLoading(false);
      showEmptyState();
      return;
    }

    detectedVideos = response.videos || [];
    detectedSubtitles = response.subtitles || [];

    showLoading(false);

    if (detectedVideos.length === 0 && detectedSubtitles.length === 0) {
      showEmptyState();
      showStatus('No videos or subtitles found on this page', 'info');
      return;
    }

    if (detectedVideos.length > 0) {
      displayVideos();
      showStatus(`Found ${detectedVideos.length} video(s)`, 'success');
    }

    if (detectedSubtitles.length > 0) {
      displaySubtitles();
      if (detectedVideos.length === 0) {
        showStatus(`Found ${detectedSubtitles.length} subtitle(s)`, 'success');
      }
    }
  });
}

/**
 * Display found videos
 */
function displayVideos() {
  videoCountEl.textContent = detectedVideos.length;
  videosListEl.innerHTML = '';

  detectedVideos.forEach((video, index) => {
    const videoEl = document.createElement('div');
    videoEl.className = 'video-item';

    let badgeHtml = '';
    if (video.type === 'iframe') {
      badgeHtml = `<span class="video-badge video-platform">${video.platformName}</span>`;
    } else if (video.type === 'native') {
      badgeHtml = '<span class="video-badge">Native Video</span>';
    } else {
      badgeHtml = '<span class="video-badge">HTML5</span>';
    }

    let subtitlesInfo = '';
    if (video.subtitles && video.subtitles.length > 0) {
      subtitlesInfo = `<span class="video-badge" style="background: #e3f9e9; color: #058b00;">${video.subtitles.length} subtitle(s)</span>`;
    }

    const sourceInfo = video.sources ? `${video.sources.length} source(s)` : video.platform || 'Video';

    videoEl.innerHTML = `
      <div class="video-item-header">
        <span class="video-title">${escapeHtml(video.title)}</span>
        ${badgeHtml}
      </div>
      <div class="video-meta">Type: ${sourceInfo} ${subtitlesInfo ? '• ' + subtitlesInfo : ''}</div>
      <div class="video-actions">
        <button class="btn-small btn-download" data-index="${index}" style="flex: 1;">
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor">
            <path d="M9 3v8m0 0l-3-3m3 3l3-3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3 12v2a2 2 0 002 2h8a2 2 0 002-2v-2" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
          Download
        </button>
      </div>
    `;

    const downloadBtn = videoEl.querySelector('.btn-download');

    downloadBtn.addEventListener('click', () => {
      if (video.subtitles && video.subtitles.length > 0) {
        showDownloadModal(video, index);
      } else {
        showStatus('No subtitles found for this video', 'error');
      }
    });

    videosListEl.appendChild(videoEl);
  });

  videosSectionEl.style.display = 'block';
}

/**
 * Display found subtitle URLs
 */
function displaySubtitles() {
  subtitleCountEl.textContent = detectedSubtitles.length;
  subtitlesListEl.innerHTML = '';

  detectedSubtitles.forEach((subtitle, index) => {
    const subEl = document.createElement('div');
    subEl.className = 'subtitle-item';

    const format = subtitle.format.toUpperCase();
    subEl.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 5px;">
        <span class="video-badge" style="background: #ffe8cc; color: #d97008;">${format}</span>
      </div>
      <div class="subtitle-url">${escapeHtml(subtitle.url.substring(0, 80))}${subtitle.url.length > 80 ? '...' : ''}</div>
      <div class="video-actions">
        <button class="btn-small btn-download" data-index="${index}">
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor">
            <path d="M9 3v8m0 0l-3-3m3 3l3-3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3 12v2a2 2 0 002 2h8a2 2 0 002-2v-2" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
          Download
        </button>
        <button class="btn-small btn-copy" data-index="${index}">
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor">
            <rect x="5.5" y="5.5" width="9" height="9" rx="1.5" stroke-width="1.5"/>
            <path d="M3.5 12.5v-9A1.5 1.5 0 015 2h9" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          Copy URL
        </button>
      </div>
    `;

    const downloadBtn = subEl.querySelector('.btn-download');
    const copyBtn = subEl.querySelector('.btn-copy');

    downloadBtn.addEventListener('click', () => {
      downloadSubtitleUrl(subtitle.url, index);
    });

    copyBtn.addEventListener('click', () => {
      copyToClipboard(subtitle.url);
      showStatus('URL copied to clipboard!', 'success');
    });

    subtitlesListEl.appendChild(subEl);
  });

  subtitlesSectionEl.style.display = 'block';
}

/**
 * Show download modal for video subtitles
 */
function showDownloadModal(video, videoIndex) {
  modalTitle.textContent = 'Download Subtitles';

  const filename = generateFilename(video.title);

  // Build language selector if multiple subtitle tracks
  let languageSelectorHTML = '';
  if (video.subtitles && video.subtitles.length > 1) {
    languageSelectorHTML = `
      <label style="display: block; margin-bottom: 8px; font-weight: 500;">Select Subtitle Track:</label>
      <select class="subtitle-track-select" style="width: 100%; padding: 8px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px; font-size: 13px;">
        ${video.subtitles.map((sub, idx) => {
          const langName = typeof I18nUtils !== 'undefined' ? I18nUtils.formatLanguageDisplay(sub.srclang, sub.label) : (sub.label || sub.srclang);
          const format = (sub.format || 'unknown').toUpperCase();
          return `<option value="${idx}">${langName} (${format})</option>`;
        }).join('')}
      </select>
    `;
  }

  modalBody.innerHTML = `
    <div>
      <div class="modal-actions" style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid rgba(161, 239, 228, 0.2);">
        <button class="btn btn-primary" id="confirm-download">✓ Download</button>
        <button class="btn btn-secondary" id="cancel-modal">Cancel</button>
      </div>

      ${languageSelectorHTML}
      <label style="display: block; margin-bottom: 8px; font-weight: 500;">Select Format:</label>
      <div class="format-options">
        <button class="format-btn selected" data-format="srt">SRT</button>
        <button class="format-btn" data-format="vtt">VTT</button>
        <button class="format-btn" data-format="ass">ASS/SSA</button>
        <button class="format-btn" data-format="json">JSON</button>
        <button class="format-btn" data-format="sub">SUB</button>
        <button class="format-btn" data-format="sbv">SBV</button>
        <button class="format-btn" data-format="sami">SAMI</button>
        <button class="format-btn" data-format="ttml">TTML</button>
      </div>

      <label style="display: block; margin-bottom: 8px; font-weight: 500; margin-top: 15px;">Filename:</label>
      <input type="text" class="filename-input" value="${escapeHtml(filename)}" />
    </div>
  `;

  // Format selection
  const formatBtns = modalBody.querySelectorAll('.format-btn');
  let selectedFormat = 'srt';

  formatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      formatBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedFormat = btn.dataset.format;
    });
  });

  // Get selected subtitle track index (default to first)
  let selectedSubtitleIndex = 0;
  const trackSelector = modalBody.querySelector('.subtitle-track-select');
  if (trackSelector) {
    trackSelector.addEventListener('change', (e) => {
      selectedSubtitleIndex = parseInt(e.target.value);
    });
  }

  // Download button - store context and attach listener
  const downloadBtn = document.getElementById('confirm-download');
  const cancelBtn = document.getElementById('cancel-modal');

  if (downloadBtn) {
    downloadBtn.onclick = () => {
      let filename = modalBody.querySelector('.filename-input')?.value || 'subtitles';
      if (!filename.trim()) {
        showStatus('Please enter a filename', 'error');
        return;
      }

      // Add language code to filename if not English
      const subtitle = video.subtitles[selectedSubtitleIndex];
      if (subtitle && subtitle.srclang && subtitle.srclang.toLowerCase() !== 'en' && subtitle.srclang.toLowerCase() !== 'en-us') {
        const langName = typeof I18nUtils !== 'undefined' ? I18nUtils.getLanguageName(subtitle.srclang) : subtitle.srclang.split('-')[0].toUpperCase();
        // Insert language before extension
        const lastDot = filename.lastIndexOf('.');
        if (lastDot > 0) {
          filename = filename.substring(0, lastDot) + '_' + langName + filename.substring(lastDot);
        } else {
          filename = filename + '_' + langName;
        }
      }

      downloadVideoSubtitles(video, selectedFormat, filename, selectedSubtitleIndex);
      closeModal();
    };
  }

  if (cancelBtn) {
    cancelBtn.onclick = closeModal;
  }

  modalEl.style.display = 'block';
}

/**
 * Show convert modal for format conversion
 */
function showConvertModal(video, videoIndex) {
  modalTitle.textContent = 'Convert Subtitles Format';

  const filename = generateFilename(video.title);

  // Build language selector if multiple subtitle tracks
  let languageSelectorHTML = '';
  if (video.subtitles && video.subtitles.length > 1) {
    languageSelectorHTML = `
      <label style="display: block; margin-bottom: 8px; font-weight: 500;">Select Subtitle Track:</label>
      <select class="subtitle-track-select" style="width: 100%; padding: 8px; margin-bottom: 15px; border: 1px solid #ccc; border-radius: 4px; font-size: 13px;">
        ${video.subtitles.map((sub, idx) => {
          const langName = typeof I18nUtils !== 'undefined' ? I18nUtils.formatLanguageDisplay(sub.srclang, sub.label) : (sub.label || sub.srclang);
          const format = (sub.format || 'unknown').toUpperCase();
          return `<option value="${idx}">${langName} (${format})</option>`;
        }).join('')}
      </select>
    `;
  }

  modalBody.innerHTML = `
    <div>
      <div class="modal-actions" style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid rgba(161, 239, 228, 0.2);">
        <button class="btn btn-primary" id="confirm-convert">✓ Convert</button>
        <button class="btn btn-secondary" id="cancel-modal">Cancel</button>
      </div>

      ${languageSelectorHTML}
      <p style="margin-bottom: 15px; color: #f3e8af; font-size: 13px;">
        Convert subtitles from ${video.subtitles[0]?.format || 'original'} to another format:
      </p>

      <label style="display: block; margin-bottom: 8px; font-weight: 500;">Convert To:</label>
      <div class="format-options">
        <button class="format-btn selected" data-format="srt">SRT</button>
        <button class="format-btn" data-format="vtt">VTT</button>
        <button class="format-btn" data-format="ass">ASS/SSA</button>
        <button class="format-btn" data-format="json">JSON</button>
        <button class="format-btn" data-format="sub">SUB</button>
        <button class="format-btn" data-format="sbv">SBV</button>
        <button class="format-btn" data-format="sami">SAMI</button>
        <button class="format-btn" data-format="ttml">TTML</button>
      </div>

      <label style="display: block; margin-bottom: 8px; font-weight: 500; margin-top: 15px;">Filename:</label>
      <input type="text" class="filename-input" value="${escapeHtml(filename)}" />
    </div>
  `;

  // Format selection
  const formatBtns = modalBody.querySelectorAll('.format-btn');
  let selectedFormat = 'srt';

  formatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      formatBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedFormat = btn.dataset.format;
    });
  });

  // Get selected subtitle track index (default to first)
  let selectedSubtitleIndex = 0;
  const trackSelector = modalBody.querySelector('.subtitle-track-select');
  if (trackSelector) {
    trackSelector.addEventListener('change', (e) => {
      selectedSubtitleIndex = parseInt(e.target.value);
    });
  }

  // Convert button - store context and attach listener
  const convertBtn = document.getElementById('confirm-convert');
  const convertCancelBtn = document.getElementById('cancel-modal');

  if (convertBtn) {
    convertBtn.onclick = () => {
      let filename = modalBody.querySelector('.filename-input')?.value || 'subtitles';
      if (!filename.trim()) {
        showStatus('Please enter a filename', 'error');
        return;
      }

      // Add language code to filename if not English
      const subtitle = video.subtitles[selectedSubtitleIndex];
      if (subtitle && subtitle.srclang && subtitle.srclang.toLowerCase() !== 'en' && subtitle.srclang.toLowerCase() !== 'en-us') {
        const langName = typeof I18nUtils !== 'undefined' ? I18nUtils.getLanguageName(subtitle.srclang) : subtitle.srclang.split('-')[0].toUpperCase();
        // Insert language before extension
        const lastDot = filename.lastIndexOf('.');
        if (lastDot > 0) {
          filename = filename.substring(0, lastDot) + '_' + langName + filename.substring(lastDot);
        } else {
          filename = filename + '_' + langName;
        }
      }

      convertAndDownloadSubtitles(video, selectedFormat, filename, selectedSubtitleIndex);
      closeModal();
    };
  }

  if (convertCancelBtn) {
    convertCancelBtn.onclick = closeModal;
  }

  modalEl.style.display = 'block';
}

/**
 * Download video subtitles
 */
function downloadVideoSubtitles(video, format, filename, subtitleIndex = 0) {
  if (!video.subtitles || video.subtitles.length === 0) {
    showStatus('No subtitles available for this video', 'error');
    return;
  }

  const subtitle = video.subtitles[subtitleIndex];
  chrome.runtime.sendMessage({
    action: 'fetchAndDownload',
    url: subtitle.src,
    filename: filename,
    format: format
  }, (response) => {
    if (response && response.success) {
      showStatus(`✓ Downloaded as ${format.toUpperCase()}`, 'success');
    } else {
      const error = response?.error || '';
      let message = 'Failed to download subtitle';

      // Provide specific error messages based on error type
      if (error.includes('HTTP error')) {
        message = 'Network error: Could not fetch the subtitle file. Check your connection or try a different video.';
      } else if (error.includes('No subtitles found')) {
        message = 'Format detection failed: Could not parse the subtitle file. Try a different format.';
      } else if (error.includes('Unsupported format')) {
        message = `Format "${format}" is not supported for conversion. Try another format.`;
      } else if (error) {
        message = error;
      }

      showStatus(message, 'error');
    }
  });
}

/**
 * Convert and download subtitles
 */
function convertAndDownloadSubtitles(video, targetFormat, filename, subtitleIndex = 0) {
  if (!video.subtitles || video.subtitles.length === 0) {
    showStatus('No subtitles available for conversion', 'error');
    return;
  }

  const subtitle = video.subtitles[subtitleIndex];
  const sourceFormat = (subtitle.format || 'unknown').toUpperCase();

  chrome.runtime.sendMessage({
    action: 'convertAndDownload',
    url: subtitle.src,
    filename: filename,
    targetFormat: targetFormat
  }, (response) => {
    if (response && response.success) {
      showStatus(`✓ Converted ${sourceFormat} → ${targetFormat.toUpperCase()} and downloaded`, 'success');
    } else {
      const error = response?.error || '';
      let message = 'Failed to convert subtitle';

      // Provide specific error messages based on error type
      if (error.includes('HTTP error')) {
        message = 'Network error: Could not fetch the subtitle file. Try refreshing the page and try again.';
      } else if (error.includes('No subtitles found')) {
        message = `Format detection failed: Could not parse the ${sourceFormat} file. The file might be corrupted.`;
      } else if (error.includes('Unsupported format')) {
        message = `Cannot convert to ${targetFormat}. This format is not supported.`;
      } else if (error) {
        message = error;
      }

      showStatus(message, 'error');
    }
  });
}

/**
 * Download subtitle from URL
 */
function downloadSubtitleUrl(url, index) {
  const format = url.split('.').pop().toLowerCase();
  const filename = `subtitle.${format}`;

  chrome.runtime.sendMessage({
    action: 'downloadUrl',
    url: url,
    filename: filename
  }, (response) => {
    if (response && response.success) {
      showStatus('✓ Subtitle downloaded', 'success');
    } else {
      const error = response?.error || '';
      let message = 'Failed to download subtitle';

      if (error.includes('Failed to start download')) {
        message = 'Download failed: Check your browser download settings.';
      } else if (error.includes('HTTP error')) {
        message = 'Network error: The subtitle URL is unreachable. The file may have been moved or deleted.';
      } else if (error) {
        message = error;
      }

      showStatus(message, 'error');
    }
  });
}

/**
 * UI Helper Functions
 */
function showStatus(message, type = 'info') {
  statusEl.textContent = message;
  statusEl.className = 'status-message ' + type;
  statusEl.style.display = 'block';

  if (type !== 'error') {
    setTimeout(() => {
      statusEl.style.display = 'none';
    }, 3000);
  }
}

function showLoading(show) {
  loadingEl.style.display = show ? 'flex' : 'none';
}

function hideAllSections() {
  videosSectionEl.style.display = 'none';
  subtitlesSectionEl.style.display = 'none';
  emptyStateEl.style.display = 'none';
  modalEl.style.display = 'none';
}

function showEmptyState() {
  emptyStateEl.style.display = 'flex';
}

function closeModal() {
  modalEl.style.display = 'none';
}

function generateFilename(title) {
  if (typeof TitleCleanupUtils !== 'undefined') {
    return TitleCleanupUtils.sanitizeFilename(title);
  }

  // Fallback if utility not loaded
  const sanitized = title.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 50);
  return sanitized || 'subtitles';
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(err => {
    console.error('Failed to copy:', err);
  });
}

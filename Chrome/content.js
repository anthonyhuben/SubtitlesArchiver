/**
 * Content script to detect videos and subtitle sources
 * Handles main frames and iframes
 * Enhanced with XHR/Fetch interception and advanced player detection
 */

const VideoDetector = {
  foundVideos: [],
  detectedSubtitleUrls: new Set(),
  interceptionEnabled: false,

  /**
   * Initialize network interception
   */
  initializeNetworkInterception() {
    if (this.interceptionEnabled) return;
    this.interceptionEnabled = true;

    // Intercept fetch calls
    this.interceptFetch();
    // Intercept XMLHttpRequest
    this.interceptXHR();
  },

  /**
   * Intercept fetch requests for subtitle URLs
   */
  interceptFetch() {
    const self = this;
    const originalFetch = window.fetch;

    window.fetch = function(...args) {
      const urlArg = args[0];
      const url = typeof urlArg === 'string' ? urlArg : (urlArg?.url || '');
      const lowerUrl = url.toLowerCase();

      // Check if URL contains subtitle keywords
      if (self.isLikelySubtitleUrl(lowerUrl)) {
        self.detectedSubtitleUrls.add(url);
      }

      return originalFetch.apply(this, args);
    };
  },

  /**
   * Intercept XMLHttpRequest for subtitle URLs
   */
  interceptXHR() {
    const self = this;
    const originalOpen = XMLHttpRequest.prototype.open;

    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
      const lowerUrl = (url || '').toLowerCase();

      if (self.isLikelySubtitleUrl(lowerUrl)) {
        self.detectedSubtitleUrls.add(url);
      }

      return originalOpen.apply(this, [method, url, ...rest]);
    };
  },

  /**
   * Check if URL is likely a subtitle file
   */
  isLikelySubtitleUrl(url) {
    const subtitlePatterns = [
      /\.vtt(\?|#|$)/i,
      /\.srt(\?|#|$)/i,
      /\.ass(\?|#|$)/i,
      /\.ssa(\?|#|$)/i,
      /\.sub(\?|#|$)/i,
      /\.sbv(\?|#|$)/i,
      /\.json(\?|#|$)/i,
      /\.xml(\?|#|$)/i,
      /caption/i,
      /subtitle/i,
      /subtitles/i,
      /captions/i,
      /track/i,
      /cue/i,
      /ttml/i,
      /dfxp/i
    ];

    return subtitlePatterns.some(pattern => pattern.test(url)) &&
           !url.includes('cdn') === false; // Allow CDN URLs
  },

  /**
   * Find all video elements and extract subtitle information
   */
  detectVideos() {
    // Start network interception
    this.initializeNetworkInterception();

    const videos = this.collectVideos();
    this.foundVideos = videos;

    // Add any intercepted subtitle URLs
    this.addInterceptedSubtitles(videos);

    // Scan for subtitles in storage (localStorage, etc)
    this.addStorageSubtitles(videos);

    return videos;
  },

  /**
   * Add subtitles found in storage to videos
   */
  addStorageSubtitles(videos) {
    const storageSubtitles = this.scanStorageForSubtitles();
    if (storageSubtitles.length === 0) return;

    // Add to first video or create virtual entry
    if (videos.length > 0) {
      const mainVideo = videos[0];
      if (mainVideo.subtitles) {
        storageSubtitles.forEach(sub => {
          if (!mainVideo.subtitles.some(s => s.src === sub.src)) {
            mainVideo.subtitles.push(sub);
          }
        });
      }
    } else {
      videos.push({
        id: 'storage-subtitles',
        type: 'detected',
        sources: [],
        subtitles: storageSubtitles,
        title: document.title || 'Cached Subtitles',
        url: window.location.href,
        isAccessible: true
      });
    }
  },

  /**
   * Add intercepted subtitle URLs to videos
   */
  addInterceptedSubtitles(videos) {
    if (this.detectedSubtitleUrls.size === 0) return;

    // If no videos found, create a virtual entry for subtitles
    if (videos.length === 0) {
      videos.push({
        id: 'intercepted-subtitles',
        type: 'detected',
        sources: [],
        subtitles: Array.from(this.detectedSubtitleUrls).map(url => ({
          src: url,
          srclang: 'unknown',
          label: 'Detected Subtitle',
          kind: 'subtitles',
          format: this.detectFormat(url)
        })),
        title: document.title || 'Video',
        url: window.location.href,
        isAccessible: true
      });
    } else {
      // Add intercepted URLs to first video
      const mainVideo = videos[0];
      if (mainVideo.subtitles) {
        Array.from(this.detectedSubtitleUrls).forEach(url => {
          if (!mainVideo.subtitles.some(s => s.src === url)) {
            mainVideo.subtitles.push({
              src: url,
              srclang: 'unknown',
              label: 'Detected Subtitle',
              kind: 'subtitles',
              format: this.detectFormat(url)
            });
          }
        });
      }
    }
  },

  /**
   * Collect videos from current document and nested iframes
   */
  collectVideos() {
    let videos = [];

    // Detect native video elements
    const nativeVideos = document.querySelectorAll('video');
    nativeVideos.forEach((video, index) => {
      const videoData = this.extractVideoData(video, index, 'native');
      if (videoData) videos.push(videoData);
    });

    // Detect common video player attributes (YouTube iframe pattern)
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach((iframe, index) => {
      const iframeData = this.detectIframeVideo(iframe, index);
      if (iframeData) videos.push(iframeData);
    });

    // Detect HTML5 video players with data attributes
    const videoContainers = document.querySelectorAll('[data-video-id], [data-video-url], [data-src*="video"], [data-src*="movie"]');
    videoContainers.forEach((container, index) => {
      if (container.tagName !== 'IFRAME' && container.tagName !== 'VIDEO') {
        const containerData = this.extractContainerData(container, index);
        if (containerData) videos.push(containerData);
      }
    });

    // Detect popular video player libraries
    const playerSubtitles = this.detectVideoPlayerLibraries();
    playerSubtitles.forEach(sub => {
      if (!videos.some(v => v.subtitles && v.subtitles.some(s => s.src === sub.src))) {
        // Create a virtual video entry for player-detected subtitles
        const existingVideo = videos.find(v => v.type === 'native');
        if (existingVideo) {
          existingVideo.subtitles.push(sub);
        } else {
          videos.push({
            id: 'player-detected',
            type: 'native',
            sources: [],
            subtitles: [sub],
            title: document.title || 'Video',
            url: window.location.href,
            isAccessible: true
          });
        }
      }
    });

    return videos;
  },

  /**
   * Detect subtitles from popular video player libraries
   */
  detectVideoPlayerLibraries() {
    const subtitles = [];

    // Video.js detection
    if (window.videojs) {
      try {
        const players = window.videojs.getAllPlayers();
        players.forEach(player => {
          const tracks = player.textTracks();
          for (let i = 0; i < tracks.length; i++) {
            const track = tracks[i];
            if (track.kind === 'subtitles' || track.kind === 'captions') {
              if (track.src) {
                subtitles.push({
                  src: track.src,
                  srclang: track.language || 'unknown',
                  label: track.label || 'Video.js Subtitle',
                  kind: track.kind,
                  format: this.detectFormat(track.src)
                });
              }
            }
          }
        });
      } catch (e) { /* Skip errors */ }
    }

    // Plyr detection
    if (window.Plyr) {
      try {
        document.querySelectorAll('.plyr').forEach(element => {
          const instance = element.plyr;
          if (instance && instance.captions) {
            const tracks = instance.captions.tracks || [];
            tracks.forEach(track => {
              if (track.src) {
                subtitles.push({
                  src: track.src,
                  srclang: track.language || 'unknown',
                  label: track.label || 'Plyr Subtitle',
                  kind: 'subtitles',
                  format: this.detectFormat(track.src)
                });
              }
            });
          }
        });
      } catch (e) { /* Skip errors */ }
    }

    // JW Player detection
    if (window.jwplayer) {
      try {
        const instances = window.jwplayer.instances;
        if (instances) {
          instances.forEach(instance => {
            const tracks = instance.getCaptionsList();
            if (tracks) {
              tracks.forEach(track => {
                if (track.file) {
                  subtitles.push({
                    src: track.file,
                    srclang: track.language || 'unknown',
                    label: track.label || 'JW Player Subtitle',
                    kind: 'subtitles',
                    format: this.detectFormat(track.file)
                  });
                }
              });
            }
          });
        }
      } catch (e) { /* Skip errors */ }
    }

    // HLS.js detection
    if (window.HLS) {
      try {
        // Check if HLS has active media element
        const videoElements = document.querySelectorAll('video');
        videoElements.forEach(video => {
          if (video.textTracks) {
            for (let i = 0; i < video.textTracks.length; i++) {
              const track = video.textTracks[i];
              if ((track.kind === 'captions' || track.kind === 'subtitles') && track.src) {
                if (!subtitles.some(s => s.src === track.src)) {
                  subtitles.push({
                    src: track.src,
                    srclang: track.language || 'unknown',
                    label: track.label || 'HLS Subtitle',
                    kind: track.kind,
                    format: this.detectFormat(track.src)
                  });
                }
              }
            }
          }
        });
      } catch (e) { /* Skip errors */ }
    }

    // Dash.js detection
    if (window.dashjs) {
      try {
        const dashInstances = document.querySelectorAll('[data-dashjs-player]');
        dashInstances.forEach(element => {
          if (element.textTracks) {
            for (let i = 0; i < element.textTracks.length; i++) {
              const track = element.textTracks[i];
              if (track.kind === 'captions' || track.kind === 'subtitles') {
                if (track.src && !subtitles.some(s => s.src === track.src)) {
                  subtitles.push({
                    src: track.src,
                    srclang: track.language || 'unknown',
                    label: track.label || 'Dash.js Subtitle',
                    kind: track.kind,
                    format: this.detectFormat(track.src)
                  });
                }
              }
            }
          }
        });
      } catch (e) { /* Skip errors */ }
    }

    // Shaka Player detection
    if (window.shaka && window.shaka.Player) {
      try {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
          if (video.textTracks) {
            for (let i = 0; i < video.textTracks.length; i++) {
              const track = video.textTracks[i];
              if ((track.kind === 'captions' || track.kind === 'subtitles') && track.src) {
                if (!subtitles.some(s => s.src === track.src)) {
                  subtitles.push({
                    src: track.src,
                    srclang: track.language || 'unknown',
                    label: track.label || 'Shaka Subtitle',
                    kind: track.kind,
                    format: this.detectFormat(track.src)
                  });
                }
              }
            }
          }
        });
      } catch (e) { /* Skip errors */ }
    }

    // Mux Player detection
    if (window.mux) {
      try {
        document.querySelectorAll('mux-player').forEach(element => {
          if (element.textTracks) {
            for (let i = 0; i < element.textTracks.length; i++) {
              const track = element.textTracks[i];
              if (track.kind === 'captions' || track.kind === 'subtitles') {
                if (track.src && !subtitles.some(s => s.src === track.src)) {
                  subtitles.push({
                    src: track.src,
                    srclang: track.language || 'unknown',
                    label: track.label || 'Mux Subtitle',
                    kind: track.kind,
                    format: this.detectFormat(track.src)
                  });
                }
              }
            }
          }
        });
      } catch (e) { /* Skip errors */ }
    }

    // Brightcove Player detection
    if (window.bc || window.brightcove) {
      try {
        document.querySelectorAll('video-js').forEach(element => {
          if (element.textTracks) {
            for (let i = 0; i < element.textTracks.length; i++) {
              const track = element.textTracks[i];
              if (track.kind === 'captions' || track.kind === 'subtitles') {
                if (track.src && !subtitles.some(s => s.src === track.src)) {
                  subtitles.push({
                    src: track.src,
                    srclang: track.language || 'unknown',
                    label: track.label || 'Brightcove Subtitle',
                    kind: track.kind,
                    format: this.detectFormat(track.src)
                  });
                }
              }
            }
          }
        });
      } catch (e) { /* Skip errors */ }
    }

    return subtitles;
  },

  /**
   * Extract data from native video element
   */
  extractVideoData(video, index, type) {
    const sources = [];

    video.querySelectorAll('source').forEach(source => {
      sources.push({
        src: source.src,
        type: source.type
      });
    });

    if (!sources.length && video.src) {
      sources.push({ src: video.src, type: 'video/mp4' });
    }

    if (!sources.length) return null;

    // Extract subtitles
    const subtitles = this.extractSubtitleTracks(video);

    return {
      id: `${type}-${index}`,
      type: type,
      sources: sources,
      subtitles: subtitles,
      title: document.title || 'Video',
      url: window.location.href,
      poster: video.poster || null,
      isAccessible: true
    };
  },

  /**
   * Detect iframe with video content
   */
  detectIframeVideo(iframe, index) {
    const src = iframe.src || iframe.dataset.src || '';

    // List of known video platforms (ordered by priority)
    const platforms = {
      'youtube': { regex: /(youtube\.com|youtu\.be|youtube-nocookie\.com)/, name: 'YouTube' },
      'vimeo': { regex: /vimeo\.com/, name: 'Vimeo' },
      'dailymotion': { regex: /dailymotion\.com/, name: 'Dailymotion' },
      'bilibili': { regex: /bilibili\.com/, name: 'Bilibili' },
      'twitch': { regex: /twitch\.tv/, name: 'Twitch' },
      'netflix': { regex: /netflix\.com/, name: 'Netflix' },
      'hulu': { regex: /hulu\.com/, name: 'Hulu' },
      'prime': { regex: /(primevideo\.com|amazon\.(com|co\.uk|de|fr|jp)\/gp\/video)/, name: 'Prime Video' },
      'disney': { regex: /disneyplus\.com/, name: 'Disney+' },
      'hbo': { regex: /(hbomax\.com|hbo\.com)/, name: 'HBO Max' },
      'paramount': { regex: /paramountplus\.com/, name: 'Paramount+' },
      'peacock': { regex: /peacocktv\.com/, name: 'Peacock' },
      'ted': { regex: /ted\.com/, name: 'TED' },
      'coursera': { regex: /coursera\.org/, name: 'Coursera' },
      'udemy': { regex: /udemy\.com/, name: 'Udemy' },
      'linkedin': { regex: /linkedin\.com\/learning/, name: 'LinkedIn Learning' },
      'wistia': { regex: /wistia\.(com|net)/, name: 'Wistia' },
      'brightcove': { regex: /brightcove\.(com|net)/, name: 'Brightcove' },
      'jwplayer': { regex: /jwplayer\.com/, name: 'JW Player' },
      'kaltura': { regex: /kaltura\.com/, name: 'Kaltura' },
      'generic': { regex: /(video|movie|stream|player|media)/, name: 'Video Player' }
    };

    let platform = 'unknown';
    let platformName = 'Video Player';

    for (const [key, { regex, name }] of Object.entries(platforms)) {
      if (regex.test(src)) {
        platform = key;
        platformName = name;
        break;
      }
    }

    if (platform === 'unknown') return null;

    return {
      id: `iframe-${index}`,
      type: 'iframe',
      platform: platform,
      platformName: platformName,
      src: src,
      subtitles: [],
      title: iframe.title || document.title || 'Video',
      url: window.location.href,
      isAccessible: this.canAccessIframe(iframe)
    };
  },

  /**
   * Extract data from video container with data attributes
   */
  extractContainerData(container, index) {
    const videoId = container.dataset.videoId;
    const videoUrl = container.dataset.videoUrl || container.dataset.src;

    if (!videoId && !videoUrl) return null;

    return {
      id: `container-${index}`,
      type: 'container',
      videoId: videoId,
      src: videoUrl,
      subtitles: [],
      title: container.dataset.title || document.title || 'Video',
      url: window.location.href,
      isAccessible: true
    };
  },

  /**
   * Query selector that traverses Shadow DOM
   * Recursively searches through Shadow DOM roots for matching elements
   */
  querySelectorAllWithShadow(selector, root = document) {
    const matches = [];
    const elements = root.querySelectorAll(selector);

    // Add all matches in the current root
    matches.push(...Array.from(elements));

    // Recursively search Shadow DOM
    const allElements = root.querySelectorAll('*');
    for (const element of allElements) {
      if (element.shadowRoot) {
        matches.push(...this.querySelectorAllWithShadow(selector, element.shadowRoot));
      }
    }

    // Deduplicate based on element reference
    return Array.from(new Set(matches));
  },

  /**
   * Extract subtitle tracks from video element
   */
  extractSubtitleTracks(video) {
    const tracks = [];

    // Method 1: Extract from <track> elements (including Shadow DOM)
    const trackElements = this.querySelectorAllWithShadow('track[kind="captions"], track[kind="subtitles"], track[kind="descriptions"]', video);
    trackElements.forEach(track => {
      tracks.push({
        src: track.src,
        srclang: track.srclang || 'unknown',
        label: track.label || track.srclang || 'Subtitle',
        kind: track.kind,
        format: this.detectFormat(track.src)
      });
    });

    // Method 2: Check for TextTrack API
    if (video.textTracks && video.textTracks.length > 0) {
      for (let i = 0; i < video.textTracks.length; i++) {
        const track = video.textTracks[i];
        if ((track.kind === 'subtitles' || track.kind === 'captions') && track.mode !== 'disabled') {
          // Try to get the track source
          const trackElement = video.querySelector(`track[label="${track.label}"]`);
          if (trackElement && trackElement.src && !tracks.some(t => t.src === trackElement.src)) {
            tracks.push({
              src: trackElement.src,
              srclang: track.language || 'unknown',
              label: track.label || track.language || 'Subtitle',
              kind: track.kind,
              format: this.detectFormat(trackElement.src)
            });
          }
        }
      }
    }

    // Method 3: Check video data attributes for subtitle URLs
    const dataAttrs = ['data-subtitle', 'data-subtitles', 'data-caption', 'data-captions', 'data-vtt', 'data-srt'];
    dataAttrs.forEach(attr => {
      const value = video.getAttribute(attr);
      if (value && this.isValidUrl(value) && !tracks.some(t => t.src === value)) {
        tracks.push({
          src: value,
          srclang: 'unknown',
          label: 'Subtitle',
          kind: 'subtitles',
          format: this.detectFormat(value)
        });
      }
    });

    // Method 4: Check parent container for subtitle data
    const parent = video.closest('[data-subtitle], [data-subtitles], [data-caption]');
    if (parent) {
      dataAttrs.forEach(attr => {
        const value = parent.getAttribute(attr);
        if (value && this.isValidUrl(value) && !tracks.some(t => t.src === value)) {
          tracks.push({
            src: value,
            srclang: 'unknown',
            label: 'Subtitle',
            kind: 'subtitles',
            format: this.detectFormat(value)
          });
        }
      });
    }

    return tracks;
  },

  /**
   * Check if iframe is accessible
   */
  canAccessIframe(iframe) {
    try {
      return !!iframe.contentDocument;
    } catch (e) {
      return false;
    }
  },

  /**
   * Search for subtitle URLs in page resources
   */
  searchSubtitleResources() {
    const subtitleFormats = ['.vtt', '.srt', '.ass', '.ssa', '.sub', '.json', '.xml', 'caption', 'subtitle'];
    const foundSubtitles = new Map(); // Use Map to prevent duplicates

    // Method 1: Check all script and link tags for subtitle references
    document.querySelectorAll('script, link, a').forEach(element => {
      let url = element.href || element.src || element.dataset.src || '';

      if (url && subtitleFormats.some(format => url.toLowerCase().includes(format))) {
        if (!foundSubtitles.has(url)) {
          foundSubtitles.set(url, {
            url: url,
            format: this.detectFormat(url),
            source: element.tagName,
            text: element.textContent?.substring(0, 50) || ''
          });
        }
      }
    });

    // Method 2: Search for subtitle URLs in all text nodes and data attributes
    const elementsWithData = document.querySelectorAll('[data-subtitle], [data-caption], [data-vtt], [data-srt]');
    elementsWithData.forEach(element => {
      const dataAttrs = ['data-subtitle', 'data-caption', 'data-vtt', 'data-srt', 'data-subtitles', 'data-captions'];
      dataAttrs.forEach(attr => {
        const value = element.getAttribute(attr);
        if (value && this.isValidUrl(value) && !foundSubtitles.has(value)) {
          foundSubtitles.set(value, {
            url: value,
            format: this.detectFormat(value),
            source: 'data-attribute',
            text: attr
          });
        }
      });
    });

    // Method 3: Parse inline JSON for subtitle URLs (common in modern video players)
    document.querySelectorAll('script[type="application/json"], script[type="application/ld+json"]').forEach(script => {
      try {
        const jsonData = JSON.parse(script.textContent);
        this.findSubtitlesInJSON(jsonData, foundSubtitles);
      } catch (e) {
        // Skip invalid JSON
      }
    });

    // Method 4: Check network requests via PerformanceResourceTiming
    try {
      const resources = performance.getEntriesByType('resource');
      resources.forEach(resource => {
        if (subtitleFormats.some(format => resource.name.toLowerCase().includes(format))) {
          if (!foundSubtitles.has(resource.name)) {
            foundSubtitles.set(resource.name, {
              url: resource.name,
              format: this.detectFormat(resource.name),
              source: 'network',
              text: 'Network resource'
            });
          }
        }
      });
    } catch (e) {
      // Skip if performance API not available
    }

    // Method 5: Search page HTML for subtitle URL patterns
    const bodyText = document.body.innerHTML;
    const urlPattern = /(https?:\/\/[^\s"'<>]+\.(vtt|srt|ass|ssa|sub|sbv))/gi;
    const matches = bodyText.matchAll(urlPattern);
    for (const match of matches) {
      const url = match[0];
      if (!foundSubtitles.has(url)) {
        foundSubtitles.set(url, {
          url: url,
          format: this.detectFormat(url),
          source: 'html-pattern',
          text: 'Found in HTML'
        });
      }
    }

    return Array.from(foundSubtitles.values());
  },

  /**
   * Recursively search JSON for subtitle URLs
   */
  findSubtitlesInJSON(obj, foundSubtitles, depth = 0) {
    if (depth > 5) return; // Prevent infinite recursion

    if (typeof obj === 'string') {
      if (this.isValidUrl(obj) && (obj.includes('subtitle') || obj.includes('caption') ||
          obj.includes('.vtt') || obj.includes('.srt') || obj.includes('.ass'))) {
        if (!foundSubtitles.has(obj)) {
          foundSubtitles.set(obj, {
            url: obj,
            format: this.detectFormat(obj),
            source: 'json',
            text: 'JSON data'
          });
        }
      }
    } else if (Array.isArray(obj)) {
      obj.forEach(item => this.findSubtitlesInJSON(item, foundSubtitles, depth + 1));
    } else if (typeof obj === 'object' && obj !== null) {
      Object.values(obj).forEach(value => this.findSubtitlesInJSON(value, foundSubtitles, depth + 1));
    }
  },

  /**
   * Check if string is a valid URL
   */
  isValidUrl(string) {
    try {
      const url = new URL(string, window.location.href);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (e) {
      return false;
    }
  },

  /**
   * Detect subtitle format from URL or content
   */
  detectFormat(urlOrContent) {
    const url = typeof urlOrContent === 'string' ? urlOrContent.toLowerCase() : '';

    if (url.includes('.vtt')) return 'vtt';
    if (url.includes('.srt')) return 'srt';
    if (url.includes('.ass') || url.includes('.ssa')) return 'ass';
    if (url.includes('.sub')) return 'sub';
    if (url.includes('.json')) return 'json';
    if (url.includes('.xml')) return 'xml';
    if (url.includes('.sbv')) return 'sbv';
    if (url.includes('.sami')) return 'sami';
    if (url.includes('.ttml') || url.includes('.dfxp')) return 'ttml';

    return 'unknown';
  },

  /**
   * Scan localStorage for cached subtitle data
   */
  scanStorageForSubtitles() {
    const subtitles = [];
    const subtitleKeywords = ['subtitle', 'caption', 'track', 'vtt', 'srt', 'ass', 'sami', 'sbv', 'ttml'];

    try {
      // Scan localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;

        // Check if key matches subtitle patterns
        const keyLower = key.toLowerCase();
        const isSubtitleKey = subtitleKeywords.some(keyword => keyLower.includes(keyword));

        if (isSubtitleKey) {
          try {
            const value = localStorage.getItem(key);
            if (value && typeof value === 'string' && value.length > 0) {
              // Detect format from content or key
              let format = 'unknown';
              if (keyLower.includes('vtt')) format = 'vtt';
              else if (keyLower.includes('srt')) format = 'srt';
              else if (keyLower.includes('ass')) format = 'ass';
              else if (keyLower.includes('sami')) format = 'sami';
              else if (keyLower.includes('sbv')) format = 'sbv';
              else if (keyLower.includes('ttml')) format = 'ttml';
              // Could also try to detect from content but avoid parsing potentially large strings

              subtitles.push({
                src: `localStorage://${key}`,
                srclang: 'unknown',
                label: `Storage: ${key}`,
                kind: 'subtitles',
                format: format
              });
            }
          } catch (e) {
            // Continue if storage item cannot be accessed
          }
        }
      }
    } catch (e) {
      // localStorage might be restricted on some pages
      console.debug('Cannot access localStorage:', e);
    }

    // Note: IndexedDB scanning would require async operations and is more complex
    // For now, focus on localStorage which is synchronous

    return subtitles;
  }
};

/**
 * Listen for messages from popup/background
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'detectVideos') {
    const videos = VideoDetector.detectVideos();
    const subtitles = VideoDetector.searchSubtitleResources();
    sendResponse({
      videos: videos,
      subtitles: subtitles,
      documentUrl: window.location.href
    });
  }

  if (request.action === 'extractSubtitles') {
    // Will be handled by background script for cross-origin requests
    sendResponse({ acknowledged: true });
  }
});

// Auto-detect videos when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    VideoDetector.detectVideos();
  });
} else {
  VideoDetector.detectVideos();
}

// Re-detect when new iframes are added dynamically
const observer = new MutationObserver((mutations) => {
  let shouldRedetect = false;

  mutations.forEach(mutation => {
    // Check for added video elements or iframes
    mutation.addedNodes.forEach(node => {
      if (node.tagName === 'VIDEO' || node.tagName === 'IFRAME' ||
          (node.classList && (node.classList.contains('video') || node.classList.contains('player')))) {
        shouldRedetect = true;
      }
    });

    // Check for attribute changes (src, data-src, etc)
    if (mutation.type === 'attributes' &&
        (mutation.attributeName === 'src' ||
         mutation.attributeName === 'data-src' ||
         mutation.attributeName === 'data-video-url')) {
      shouldRedetect = true;
    }
  });

  if (shouldRedetect) {
    // Debounce to avoid excessive re-detection
    clearTimeout(VideoDetector.detectionTimeout);
    VideoDetector.detectionTimeout = setTimeout(() => {
      VideoDetector.detectVideos();
    }, 500);
  }
});

observer.observe(document, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['src', 'data-src', 'data-video-url', 'data-video-id'],
  attributeOldValue: true
});

(() => {
  // Public website: fetch blogs list from backend and render cards
  const API_URL = 'http://127.0.0.1:8000';
  const grid = document.getElementById('blogsGrid');

  const escapeHtml = (s) =>
    String(s ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const parseFirstImage = (html) => {
    try {
      const doc = new DOMParser().parseFromString(String(html ?? ''), 'text/html');
      const img = doc.querySelector('img');
      return img?.getAttribute('src') || '';
    } catch {
      return '';
    }
  };

  const makeExcerpt = (html, maxLen = 160) => {
    try {
      const doc = new DOMParser().parseFromString(String(html ?? ''), 'text/html');
      const text = (doc.body?.textContent || '').replace(/\s+/g, ' ').trim();
      if (!text) return '';
      return text.length > maxLen ? text.slice(0, maxLen).trimEnd() + '…' : text;
    } catch {
      return '';
    }
  };

  const renderError = (msg) => {
    if (!grid) return;
    grid.innerHTML = `<div style="color:#fff; padding: 20px;">${escapeHtml(msg)}</div>`;
  };

  const renderBlogs = (blogs) => {
    if (!grid) return;
    if (!Array.isArray(blogs) || blogs.length === 0) {
      grid.innerHTML = `<div style="color:#fff; padding: 20px;">No blogs found.</div>`;
      return;
    }

    grid.innerHTML = blogs
      .map((b) => {
        const imgSrc = b._firstImage || '../images/Blog Posts.jpg';
        const date = formatDate(b.created_at);
        const excerpt = b._excerpt || '';
        return `
          <article class="blog-card">
            <div class="blog-image">
              <img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(b.title || 'Blog')}">
              <span class="blog-category">BLOGS</span>
            </div>
            <div class="blog-content">
              <h3>${escapeHtml(b.title || '')}</h3>
              <p>${escapeHtml(excerpt)}</p>
              <div class="blog-meta">
                <span class="blog-date">${escapeHtml(date)}</span>
              </div>
              <a href="blog-details.html?id=${encodeURIComponent(b.id)}" class="blog-read-more">Read More →</a>
            </div>
          </article>
        `;
      })
      .join('');
  };

  const fetchJson = async (url) => {
    const res = await fetch(url);
    if (!res.ok) {
      let err = null;
      try {
        err = await res.json();
      } catch {
        // ignore
      }
      throw new Error(err?.detail || `Request failed (${res.status})`);
    }
    return res.json();
  };

  const main = async () => {
    if (!grid) return;
    try {
      // Step 1: list (lightweight)
      const list = await fetchJson(`${API_URL}/blogs?skip=0&limit=50`);

      // Step 2: fetch details for first image + excerpt (limit to keep it fast)
      const withDetails = await Promise.all(
        (Array.isArray(list) ? list : []).slice(0, 24).map(async (b) => {
          try {
            const full = await fetchJson(`${API_URL}/blogs/${b.id}`);
            return {
              ...b,
              _firstImage: parseFirstImage(full?.content),
              _excerpt: makeExcerpt(full?.content),
            };
          } catch {
            return { ...b, _firstImage: '', _excerpt: '' };
          }
        })
      );

      // If there were more than 24, append remaining without excerpts (still clickable)
      const rest = (Array.isArray(list) ? list : []).slice(24).map((b) => ({
        ...b,
        _firstImage: '',
        _excerpt: '',
      }));

      renderBlogs([...withDetails, ...rest]);
    } catch (e) {
      renderError(e?.message || 'Failed to load blogs.');
    }
  };

  main();
})();



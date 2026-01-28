(() => {
  // Public website: render a single blog by id from backend
  const API_URL = 'http://127.0.0.1:8000';

  const titleEl = document.getElementById('blogTitle');
  const metaEl = document.getElementById('blogMeta');
  const contentEl = document.getElementById('blogContent');
  const featuredWrap = document.getElementById('blogFeaturedWrap');
  const featuredImg = document.getElementById('blogFeaturedImage');
  const recentEl = document.getElementById('recentPosts');

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

  const getBlogId = () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return null;
    const n = Number(id);
    return Number.isFinite(n) ? n : null;
  };

  const renderRecent = (items) => {
    if (!recentEl) return;
    if (!Array.isArray(items) || items.length === 0) {
      recentEl.innerHTML = `<div style="color:#d0d0d0; padding: 10px;">No recent posts.</div>`;
      return;
    }

    recentEl.innerHTML = items
      .map((b) => {
        const date = formatDate(b.created_at);
        return `
          <div class="recent-post-card">
            <div class="rp-image">
              <img src="${escapeHtml(b._firstImage || '../images/Blog Posts.jpg')}" alt="Thumb" />
            </div>
            <div class="rp-content">
              <a href="blog-details.html?id=${encodeURIComponent(b.id)}" class="rp-title">${escapeHtml(
                b.title || ''
              )}</a>
              <div class="rp-meta">
                <span class="rp-author">by ${escapeHtml(b.author || 'Admin')}</span>
                <span class="rp-date">${escapeHtml(date)}</span>
              </div>
            </div>
          </div>
        `;
      })
      .join('');
  };

  const main = async () => {
    const blogId = getBlogId();
    if (!blogId) {
      if (titleEl) titleEl.textContent = 'Blog not found';
      if (contentEl) contentEl.innerHTML = `<p style="color:#d0d0d0;">Missing blog id.</p>`;
      return;
    }

    try {
      const blog = await fetchJson(`${API_URL}/blogs/${blogId}`);

      if (titleEl) titleEl.textContent = blog?.title || 'Blog';
      document.title = `${blog?.title || 'Blog'} - Emerging Software`;

      if (metaEl) {
        const date = formatDate(blog?.created_at);
        metaEl.textContent = `${blog?.author ? `By ${blog.author}` : ''}${date ? ` • ${date}` : ''}`;
      }

      const firstImg = parseFirstImage(blog?.content);
      if (firstImg && featuredWrap && featuredImg) {
        featuredImg.src = firstImg;
        featuredWrap.style.display = '';
      } else if (featuredWrap) {
        featuredWrap.style.display = 'none';
      }

      // Render saved HTML content (includes <img> tags inside content)
      if (contentEl) {
        contentEl.innerHTML = blog?.content || '<p style="color:#d0d0d0;">No content.</p>';
      }

      // Recent posts (top 5)
      if (recentEl) {
        const list = await fetchJson(`${API_URL}/blogs?skip=0&limit=10`);
        const top = (Array.isArray(list) ? list : []).slice(0, 5);
        const topWithImages = await Promise.all(
          top.map(async (b) => {
            try {
              const full = await fetchJson(`${API_URL}/blogs/${b.id}`);
              return { ...b, _firstImage: parseFirstImage(full?.content) };
            } catch {
              return { ...b, _firstImage: '' };
            }
          })
        );
        renderRecent(topWithImages);
      }
    } catch (e) {
      if (titleEl) titleEl.textContent = 'Failed to load blog';
      if (contentEl) contentEl.innerHTML = `<p style="color:#d0d0d0;">${escapeHtml(e?.message || 'Error')}</p>`;
    }
  };

  main();
})();



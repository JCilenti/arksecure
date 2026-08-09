(() => {
  'use strict';

  const config = window.ARK_CONFIG;
  const list = document.querySelector('#blog-list');
  const filter = document.querySelector('#blog-filter');
  const emptyState = document.querySelector('#blog-empty');

  if (!list || !config) return;

  const escapeHtml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const formatDate = (dateString) => {
    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const render = (query = '') => {
    const normalized = query.trim().toLowerCase();
    const posts = (config.blogPosts || []).filter(post => {
      if (!normalized) return true;

      const searchable = [
        post.slug,
        post.title,
        post.summary,
        ...(post.categories || [])
      ].join(' ').toLowerCase();

      return searchable.includes(normalized);
    });

    list.innerHTML = posts.map(post => `
      <article class="blog-card">
        <p class="blog-card-meta">${escapeHtml(formatDate(post.date))} // ${(post.categories || []).map(escapeHtml).join(' / ')}</p>
        <h2><a href="${escapeHtml(post.url)}">${escapeHtml(post.title)}</a></h2>
        <p>${escapeHtml(post.summary)}</p>
        <p><a href="${escapeHtml(post.url)}">Read article →</a></p>
      </article>
    `).join('');

    if (emptyState) emptyState.hidden = posts.length !== 0;
  };

  if (filter) {
    filter.addEventListener('input', () => render(filter.value));
  }

  render();
})();
// Simple hash-based SPA router

const routes = {};
let currentView = null;

export function registerRoute(name, handler) {
  routes[name] = handler;
}

export function navigate(viewName, params = {}) {
  const hash = params && Object.keys(params).length > 0
    ? `#${viewName}?${new URLSearchParams(params).toString()}`
    : `#${viewName}`;
  window.location.hash = hash;
}

export function parseHash() {
  const hash = window.location.hash.slice(1) || 'home';
  const [viewName, queryString] = hash.split('?');
  const params = {};
  if (queryString) {
    const searchParams = new URLSearchParams(queryString);
    for (const [key, value] of searchParams) {
      params[key] = value;
    }
  }
  return { viewName, params };
}

export function initRouter() {
  const handleRoute = async () => {
    const { viewName, params } = parseHash();
    const handler = routes[viewName];

    if (handler) {
      // Update nav highlighting
      document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.view === viewName);
      });

      const container = document.getElementById('view-container');

      // Add exit animation
      if (currentView) {
        container.classList.add('view-exit');
        await new Promise(r => setTimeout(r, 150));
      }

      container.classList.remove('view-exit');
      container.classList.add('view-enter');

      await handler(container, params);
      currentView = viewName;

      // Trigger enter animation
      requestAnimationFrame(() => {
        container.classList.remove('view-enter');
      });
    }
  };

  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

export function getCurrentView() {
  return parseHash().viewName;
}

async function request(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });

  if (res.status === 401) {
    window.location.href = '/login';
    throw new Error('Não autenticado');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Erro ${res.status}`);
  }
  return data;
}

export const api = {
  listProspects: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.status?.length) qs.set('status', params.status.join(','));
    if (params.score?.length) qs.set('score', params.score.join(','));
    if (params.q) qs.set('q', params.q);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return request(`/api/prospects${suffix}`);
  },
  getProspect: (id) => request(`/api/prospects/${id}`),
  createProspect: (body) => request('/api/prospects', { method: 'POST', body: JSON.stringify(body) }),
  updateProspect: (id, body) => request(`/api/prospects/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  addActivity: (id, body) =>
    request(`/api/prospects/${id}/activities`, { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
};

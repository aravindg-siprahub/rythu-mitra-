/**
 * Work / Labor Market API — all requests go through Django → Supabase (service role).
 * Responses may be legacy (raw) or normalized { success, message, data, errors }.
 *
 * Identity: workers apply using supplier_profiles.id (stored as supplier_id on job_applications).
 *
 * RLS: Direct browser Supabase writes (e.g. job_posts updates in WorkPage) must match your
 * Supabase policies — prefer Django endpoints for sensitive mutations when tightening security.
 */

// Same origin resolution as api.js — relative /api/... hits the React dev server (404) unless proxy is set.
const rawBase = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';
const trimmedBase = rawBase.replace(/\/$/, '');
const API_V1 = trimmedBase.endsWith('/api/v1') ? trimmedBase : `${trimmedBase}/api/v1`;
const API_BASE = `${API_V1}/work`;

function unwrap(payload) {
  if (payload == null) return payload;
  if (typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    return payload.success ? payload.data : null;
  }
  return payload;
}

function getErrorMessage(payload, fallback) {
  if (payload && typeof payload === 'object') {
    if (payload.message) return payload.message;
    if (payload.errors && typeof payload.errors === 'object') {
      const first = Object.values(payload.errors)[0];
      if (typeof first === 'string') return first;
    }
    if (payload.error) return payload.error;
  }
  return fallback || 'Request failed';
}

async function parseJson(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { _parseError: true, raw: text };
  }
}

export async function fetchJobFeed(params = {}) {
  const q = new URLSearchParams();
  if (params.service_type) q.set('service_type', params.service_type);
  if (params.district) q.set('district', params.district);
  if (params.q) q.set('q', params.q);
  if (params.offset != null) q.set('offset', String(params.offset));
  const res = await fetch(`${API_BASE}/feed/?${q.toString()}`);
  const data = await parseJson(res);
  const inner = unwrap(data) ?? data;
  const posts = inner.posts ?? data.posts ?? [];
  if (!res.ok) throw new Error(getErrorMessage(data, 'Failed to load jobs'));
  return posts;
}

export async function createJobPost(body) {
  const res = await fetch(`${API_BASE}/create/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await parseJson(res);
  const inner = unwrap(data) ?? data;
  const post = inner.post ?? data.post;
  if (!res.ok) throw new Error(getErrorMessage(data, 'Failed to post job'));
  return post;
}

export async function fetchFarmerPosts(farmerId) {
  const res = await fetch(`${API_BASE}/farmer/${farmerId}/posts/`);
  const data = await parseJson(res);
  const inner = unwrap(data) ?? data;
  const posts = inner.posts ?? data.posts ?? [];
  if (!res.ok) throw new Error(getErrorMessage(data, 'Failed to load posts'));
  return posts;
}

export async function updateJobPostStatus(jobId, farmerId, status) {
  const res = await fetch(`${API_BASE}/${jobId}/status/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ farmer_id: farmerId, status }),
  });
  const data = await parseJson(res);
  const inner = unwrap(data) ?? data;
  const post = inner.post ?? data.post;
  if (!res.ok) throw new Error(getErrorMessage(data, 'Failed to update job status'));
  return post;
}

export async function applyToJob(jobId, supplierProfileId, coverNote = '') {
  const res = await fetch(`${API_BASE}/${jobId}/apply/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      supplier_profile_id: supplierProfileId,
      cover_note: coverNote,
    }),
  });
  const data = await parseJson(res);
  const inner = unwrap(data) ?? data;
  const application = inner.application ?? data.application;
  if (!res.ok) throw new Error(getErrorMessage(data, 'Failed to apply'));
  return application;
}

export async function fetchSupplierApplications(supplierProfileId) {
  const res = await fetch(`${API_BASE}/supplier/${supplierProfileId}/applications/`);
  const data = await parseJson(res);
  const inner = unwrap(data) ?? data;
  const applications = inner.applications ?? data.applications ?? [];
  if (!res.ok) throw new Error(getErrorMessage(data, 'Failed to load applications'));
  return applications;
}

export async function updateApplicationStatus(applicationId, farmerId, status) {
  const res = await fetch(`${API_BASE}/application/${applicationId}/status/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ farmer_id: farmerId, status }),
  });
  const data = await parseJson(res);
  const inner = unwrap(data) ?? data;
  const application = inner.application ?? data.application;
  if (!res.ok) throw new Error(getErrorMessage(data, 'Failed to update application'));
  return application;
}

export async function registerSupplier(body) {
  const res = await fetch(`${API_BASE}/supplier/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await parseJson(res);
  const inner = unwrap(data) ?? data;
  const supplier = inner.supplier ?? data.supplier;
  if (!res.ok) throw new Error(getErrorMessage(data, 'Registration failed'));
  return supplier;
}

export function isJobOpenStatus(status) {
  const s = (status || '').toLowerCase();
  return s === 'open';
}

export function isJobClosedStatus(status) {
  const s = (status || '').toLowerCase();
  return s === 'closed' || s === 'filled';
}

const BASE = 'http://localhost:5000';

async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    const res = await fetch(`${BASE}/users/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
    });

    if (res.ok) {
        const data = await res.json();
        localStorage.setItem('accessToken', data.accessToken);
        return data.accessToken;
    }
    return null;
}

export async function apiFetch(path, options = {}) {
    let token = localStorage.getItem('accessToken');

    let res = await fetch(`${BASE}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    // if token expired, try refresh once
    if (res.status === 401) {
        token = await refreshAccessToken();
        if (token) {
            res = await fetch(`${BASE}${path}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    ...options.headers,
                },
            });
        }
    }

    return res;
}
export async function uploadImage(path, options = {}) {
    let token = localStorage.getItem('accessToken');

    let res = await fetch(`${BASE}${path}`, {
        ...options,
        headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    // if token expired, try refresh once
    if (res.status === 401) {
        token = await refreshAccessToken();
        if (token) {
            res = await fetch(`${BASE}${path}`, {
                ...options,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    ...options.headers,
                },
            });
        }
    }

    return res;
}
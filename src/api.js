const API_BASE_URL = "http://localhost:5000/api";

export async function apiFetch(path, options = {}) {
    const { auth = true, body, headers = {}, ...fetchOptions } = options;
    const requestHeaders = { ...headers };
    if (body !== undefined) requestHeaders["Content-Type"] = "application/json";
    const token = localStorage.getItem("libraryToken");
    if (auth && token) requestHeaders.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...fetchOptions,
        headers: requestHeaders,
        ...(body !== undefined ? { body: JSON.stringify(body) } : {})
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        if (response.status === 401 && auth) {
            localStorage.removeItem("libraryToken");
            localStorage.removeItem("currentUser");
        }
        throw new Error(data.message || `Request failed (${response.status}).`);
    }
    return data;
}

import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

const REFRESH_URL = "/api/auth/refresh";
const CSRF_URL = "/api/auth/csrf";
const MUTATING_METHODS = ["post", "patch", "put", "delete"];

let isRefreshing = false;
let pendingQueue = [];

function flushQueue(error) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  pendingQueue = [];
}

let csrfHeaderName = "X-XSRF-TOKEN";
let csrfToken = null;
let csrfFetchPromise = null;

function fetchCsrfToken() {
  if (csrfFetchPromise) return csrfFetchPromise;

  csrfFetchPromise = axios
    .get(CSRF_URL, {
      baseURL: import.meta.env.VITE_API_BASE_URL,
      withCredentials: true,
    })
    .then((response) => {
      const result = response.data.result;
      csrfHeaderName = result.headerName || csrfHeaderName;
      csrfToken = result.token;
      return csrfToken;
    })
    .finally(() => {
      csrfFetchPromise = null;
    });

  return csrfFetchPromise;
}

export function refreshCsrfToken() {
  csrfToken = null;
  return fetchCsrfToken();
}

apiClient.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase();
  if (!MUTATING_METHODS.includes(method) || config.url === CSRF_URL) {
    return config;
  }

  if (!csrfToken) {
    await fetchCsrfToken();
  }

  config.headers[csrfHeaderName] = csrfToken;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;

    if (!response || !config) {
      return Promise.reject(error);
    }

    if (response.data?.code === "AUTH403_2" && !config._csrfRetry) {
      config._csrfRetry = true;
      await refreshCsrfToken();
      return apiClient(config);
    }

    if (response.status !== 401 || config._retry) {
      return Promise.reject(error);
    }

    if (config.url === REFRESH_URL) {
      return Promise.reject(error);
    }

    config._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then(() => apiClient(config));
    }

    isRefreshing = true;
    try {
      await apiClient.post(REFRESH_URL);
      flushQueue(null);
      return apiClient(config);
    } catch (refreshError) {
      flushQueue(refreshError);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default apiClient;

import axios from 'axios';

const api = axios.create({
    baseURL: 'https://symfony-app.zakariyazouazou.com', // e.g. "https://api.myshop.com"
    withCredentials: true,                     // send & receive HttpOnly cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor: on 401, try a refresh and retry once
let isRefreshing = false;
let refreshQueue: ((token: string) => void)[] = [];

api.interceptors.response.use(
    res => res,
    async err => {
        const { config, response } = err;
        if (response?.status === 401 && !config._retry) {
            if (isRefreshing) {
                // queue up until refresh finishes
                return new Promise(resolve => {
                    refreshQueue.push((token: string) => {
                        config.headers!['Authorization'] = `Bearer ${token}`;
                        resolve(api(config));
                    });
                });
            }

            config._retry = true;
            isRefreshing = true;
            try {
                const { data } = await api.post('/auth/refresh');
                const newToken = data.accessToken;
                // notify queued requests
                refreshQueue.forEach(cb => cb(newToken));
                refreshQueue = [];
                config.headers!['Authorization'] = `Bearer ${newToken}`;
                return api(config);
            } catch (_refreshErr) {
                // refresh failed: force logout
                window.location.href = '/login';
                return Promise.reject(_refreshErr);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(err);
    }
);

export default api;

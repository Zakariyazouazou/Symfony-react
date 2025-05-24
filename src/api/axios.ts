import axios from 'axios';


// local host
const Thehost = 'https://symfony-app.zakariyazouazou.com' // e.g. http://localhost:8000  //https://symfony-app.zakariyazouazou.com/

const api = axios.create({
    baseURL: Thehost, 
    withCredentials: true,                     
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
                const { data } = await axios.post(
                    `${Thehost}/api/token/refresh`,
                    {},
                    { withCredentials: true }
                );
                // console.log("this is messag for the main axios", data);
                const newToken = data.accessToken;
                // notify queued requests
                refreshQueue.forEach(cb => cb(newToken));
                refreshQueue = [];
                config.headers!['Authorization'] = `Bearer ${newToken}`;
                return api(config);
            } catch (_refreshErr) {
                console.error("you dont have the permession to get acces for the rest of the data", err);
                // return Promise.reject(_refreshErr);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(err);
    }
);

export default api;

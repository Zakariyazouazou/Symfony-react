import api from './axios';

interface LoginPayload { email: string; password: string }
interface RegisterPayload { name: string; email: string; password: string }

export const authApi = {
    login: (data: LoginPayload) =>
        api.post<{ token: string; user: { id: string; username: string; roles: string[] } }>(
            '/auth/login_check', {
            username: data.email,
            password: data.password,
        },
            {
                withCredentials: true, // ✅ This is needed for cookies
            }
        ),
    register: (data: RegisterPayload) =>
        api.post<{ accessToken: string; user: { id: string; name: string; role: string } }>(
            '/auth/register', data
        ),
    logout: () =>
        api.post('/auth/logout'),
    refresh: () =>
        api.post<{ accessToken: string }>('/auth/refresh'),
};

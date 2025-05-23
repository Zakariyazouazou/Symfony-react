import api from './axios';

interface LoginPayload {
    email: string;
    password: string;
}

interface RegisterPayload {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
}

interface RefreshResponse {
    token: string;
    user: {
        id: number;
        username: string;
        email: string;
        roles: string[];
    };
}

export const authApi = {
    login: (data: LoginPayload) =>
        api.post<{ token: string; roles: string[] }>(
            '/api/login_check',
            {
                username: data.email,
                password: data.password,
            },
            {
                withCredentials: true, // send/receive HttpOnly cookies
            }
        ),

    register: (data: RegisterPayload) =>
        api.post<{ accessToken: string; user: { id: number; name: string; role: string } }>(
            '/api/register',
            data,
            {
                withCredentials: true, // send/receive HttpOnly cookies
            }
        ),

    logout: () =>
        api.post(
            '/api/logout',
            {},
            {
                withCredentials: true, // ensure cookie is sent
            }
        ),

    refresh: () =>
        api.post<RefreshResponse>(
            '/api/token/refresh',
            {},
            {
                withCredentials: true, // send refresh cookie
            }
        ),
};

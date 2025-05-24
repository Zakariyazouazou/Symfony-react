// src/api/orderApi.ts
import api from './axios';



export interface UserRequest {
    "id": number,
    "email": string,
    "username": string,
    "firstName": string,
    "lastName": string,
    "roles": string[],
}

export const UserApi = {
    UserList: () => {
        // note: axios will URL-encode the orderId for you
        return api.get<UserRequest[]>(
            `/api/user/all`
        );
    },
};

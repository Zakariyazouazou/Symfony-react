// src/api/orderApi.ts
import api from './axios';




export interface CategorieCreationResponse {
    status: string;
    category: {
        "id": number,
        "name": string,
        "slug": string,
        "description": string
    }
}


export interface CategorieDeletResponse {
    status: string;
    message: string
}

export const categorieApi = {
    createCategorie: (name: string, description: string, slug: string) => {
        // note: axios will URL-encode the orderId for you
        return api.post<CategorieCreationResponse>(
            `/api/categories`,
            {
                "name": name,
                "description": description,
                "slug": slug
            }
        );
    },


    UpdateCategorie: (id:number , name: string, description: string, slug: string) => {
        // note: axios will URL-encode the orderId for you
        return api.patch(
            `/api/categories/${id}`,
            {
                "name": name,
                "description": description,
                "slug": slug
            }
        );
    },


    DeleteCategorie: (categorieId: number) => {
        // note: axios will URL-encode the orderId for you
        return api.delete<CategorieDeletResponse>(
            `/api/categories/${categorieId}`,
        );
    },
};

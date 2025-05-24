// src/api/orderApi.ts
import api from './axios';


export interface OrderItemImage {
    "url": string
}

export interface OrderItem {
    product_id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    product_name: string;
    item_id: number
    images: OrderItemImage[]
}

export interface OrderResponse {
    order_id: number;
    customer_email: string;
    status: string;
    total_amount: number;
    total_quantity: number;
    items: OrderItem[];
}


// Single user order shape
export interface SingleOrderResponse {
    order_id: number;
    status: string;
    customer_email: string;
    total_amount: number;
    created_at: string; // ISO timestamp or datetime string
    items: OrderItem[];
}





export interface OrderItemImageFull {
    url: string;
    alt_text: string | null;
    position: number | null;
}

export interface UserOrderItem {
    item_id: number;
    product_id: number;
    product_name: string;
    unit_price: number;
    quantity: number;
    total_price: number;
    images: OrderItemImageFull[];
}

export interface UserOrderResponse {
    order_id: number;
    status: string;
    customer_email: string;
    total_amount: number;
    created_at: string;
    items: UserOrderItem[];
}

export interface PayementRequest {
    "message": string,
    "stripeCheckoutLink": string;

}


export interface OrderListe {
    "order_id": number,
    "order_name": string,
    "status": string,
    "total_quantity": number,
    "total_amount": number
}

export interface ItemsDependOrder {
    "item_id": number,
    "product_id": number,
    "product_name": string,
    "product_image": string,
    "unit_price": number,
    "quantity": number,
    "total_price": number
}


export const orderApi = {
    create: (user_id: number, product_id: number, quantity: number) => {
        // note: axios will URL-encode the orderId for you
        return api.post<OrderResponse>(
            `/api/orders`,
            {
                "user_id": user_id,
                "product_id": product_id,
                "quantity": quantity
            }
        );
    },

    SingleUserOrder: (user_id: number) => {
        // note: axios will URL-encode the orderId for you
        return api.get<SingleOrderResponse[]>(
            `/api/orders/user/${user_id}`
        );
    },


    DeleteUserOrderItem: (Item_id: number) => {
        // note: axios will URL-encode the orderId for you
        return api.delete(
            `/api/orders/items/${Item_id}`
        );
    },


    UpdateQuantityUserOrderItem: (Item_id: number, quantity: number) => {
        // note: axios will URL-encode the orderId for you
        return api.patch(
            `/api/orders/items/${Item_id}`,
            {
                "quantity": quantity,
            }
        );
    },


    ClearAllOrders: (Order_id: number,) => {
        // note: axios will URL-encode the orderId for you
        return api.delete(
            `/api/orders/${Order_id}`,
        );
    },


    UserOrder: (UserId: number,) => {
        // note: axios will URL-encode the orderId for you
        return api.get<UserOrderResponse[]>(
            `/api/orders/user/${UserId}`,
        );
    },

    AllOrder: () => {
        // note: axios will URL-encode the orderId for you
        return api.get<OrderListe[]>(
            `/api/main_order_list`,
        );
    },

    GetItemsSingleOrder: (Order_id: number) => {
        // note: axios will URL-encode the orderId for you
        return api.get<ItemsDependOrder[]>(
            `/api/orders/${Order_id}/items_details`,
        );
    },

    UpdateStatus: (Order_id: number, status: string) => {
        // note: axios will URL-encode the orderId for you
        return api.patch(
            `/api/orders/${Order_id}/status`,
            {
                "status": status,
            }
        );
    },



    PayementProcess: (Orderid: number,) => {
        // note: axios will URL-encode the orderId for you
        return api.post<PayementRequest>(
            `/api/create-checkout-session`,
            {
                "orderId": Orderid,
                "successUrl": "https://yourdomain.com/payment-success",
                "cancelUrl": "https://yourdomain.com/payment-cancel"
            }
        );
    },


};

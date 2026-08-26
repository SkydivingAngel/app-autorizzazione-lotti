export interface LoginRequest {
    grant_type: string;
    client_id: string;
    client_secret: string;
    scope: string;
}
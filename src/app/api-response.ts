export interface ApiResponse {
    success: boolean;
    message: string;
    data: any | null;
    errors: string[];
}
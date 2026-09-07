export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}
// Car Interface
export interface Car {
    model: string;
    seats: number;
    fuelType: string;
}

// Bike Interface
export interface Bike {
    model: string;
    engineCC: number;
}

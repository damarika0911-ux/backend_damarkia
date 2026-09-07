import { Bike, Car } from "../module/apiResponse";



// Type Guard for Car
export const isCar = (body: any): body is Car => {
    return (
        typeof body.model === "string" &&
        typeof body.seats === "number" &&
        typeof body.fuelType === "string"
    );
};

// Type Guard for Bike
export const isBike = (body: any): body is Bike => {
    return (
        typeof body.model === "string" &&
        typeof body.engineCC === "number"
    );
};

import { describe, it, expect} from 'vitest'
import { calculateFee } from '../src/utils/calculateFee'

describe('calculateFee function', () => {
    const orderMinimum = 1000; // 10€
    const basePrice = 190; // 1.90€
    const venueLatitude = 60.17012143;
    const venueLongitude = 24.92813512;

    const distanceRanges = [
        { min: 0, max: 500, a: 0, b: 0, flag: null },
        { min: 500, max: 1000, a: 100, b: 0, flag: null },
        { min: 1000, max: 1500, a: 200, b: 0, flag: null },
        { min: 1500, max: 2000, a: 200, b: 1, flag: null },
        { min: 2000, max: 0, a: 0, b: 0, flag: null },
    ];

    describe('when the delivery distance is short', () => {
        it('calculates delivery fee and total price for a short distance', () => {
            const cartValue = 10;
            const userLatitude = 60.17094;
            const userLongitude = 24.93087;
        
            const result = calculateFee({
                cartValue,
                userLatitude,
                userLongitude,
                venueLatitude,
                venueLongitude,
                orderMinimum,
                basePrice,
                distanceRanges,
            });
            expect(result.deliveryFee).toBe(190);
            expect(result.deliveryDistance).toBe(177);
            expect(result.totalPrice).toBe(1190);
        });
    });

    describe('when the cart value is less than order minimum(10)', () => {
        it('adds small order surcharge', () => {
            const cartValue = 5;
            const userLatitude = 60.17094;
            const userLongitude = 24.93087;
        
            const result = calculateFee({
                cartValue,
                userLatitude,
                userLongitude,
                venueLatitude,
                venueLongitude,
                orderMinimum,
                basePrice,
                distanceRanges,
            });
            expect(result.deliveryFee).toBe(190);
            expect(result.deliveryDistance).toBe(177);
            expect(result.smallOrderFee).toBe(500);
            expect(result.totalPrice).toBe(1190);
        });
    });

    describe('when the delivery distance is long', () => {
        it('calculates delivery fee for a long distance with correct range-based pricing', () => {
            const cartValue = 10;
            const userLatitude = 60.170751;
            const userLongitude = 24.918719;
        
            const result = calculateFee({
                cartValue,
                userLatitude,
                userLongitude,
                venueLatitude,
                venueLongitude,
                orderMinimum,
                basePrice,
                distanceRanges,
            });
        
            expect(result.deliveryFee).toBe(290);
            expect(result.deliveryDistance).toBe(525);
            expect(result.totalPrice).toBe(1290);
        });
    });

    describe('when the delivery distance is out of range', () => {
        it("returns 0 delivery fee and total price", () => {
            const cartValue = 10;
            const userLatitude = 60.1754347;
            const userLongitude = 24.8248982;

            const result = calculateFee({
                cartValue,
                userLatitude,
                userLongitude,
                venueLatitude,
                venueLongitude,
                orderMinimum,
                basePrice,
                distanceRanges,
            });
        
            expect(result.deliveryFee).toBe(0);
            expect(result.deliveryDistance).toBe(5740);
            expect(result.totalPrice).toBe(0);
        });
    });
});

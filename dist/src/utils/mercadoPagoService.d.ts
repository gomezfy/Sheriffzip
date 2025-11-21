import { Payment, Preference } from 'mercadopago';
export declare const preference: Preference | null;
export declare const payment: Payment | null;
export interface PackageInfo {
    id: string;
    name: string;
    description: string;
    amountRexBucks: number;
    bonusRexBucks: number;
    priceCents: number;
    currency: string;
    totalRexBucks: number;
    displayPrice: string;
}
export declare function getActivePackages(): Promise<PackageInfo[]>;
export declare function createPaymentPreference(userId: string, username: string, packageId: string): Promise<{
    success: boolean;
    url?: string;
    error?: string;
}>;
export declare function processPaymentNotification(paymentId: string): Promise<{
    success: boolean;
    error?: string;
}>;
//# sourceMappingURL=mercadoPagoService.d.ts.map
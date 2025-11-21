interface WeaponData {
    name: string;
    damage: number;
    imageUrl: string;
    price: number;
    currency: string;
    description: string;
}
export declare function generateWeaponCard(weapon: WeaponData): Promise<Buffer>;
export {};
//# sourceMappingURL=weaponCanvas.d.ts.map
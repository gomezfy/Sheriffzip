export declare class BaseBotError extends Error {
    readonly code?: string | undefined;
    readonly isOperational: boolean;
    constructor(message: string, code?: string | undefined, isOperational?: boolean);
}
export declare class DatabaseError extends BaseBotError {
    constructor(message: string, code?: string);
}
export declare class ValidationError extends BaseBotError {
    constructor(message: string, code?: string);
}
export declare class InsufficientFundsError extends BaseBotError {
    constructor(message: string);
}
export declare class InventoryFullError extends BaseBotError {
    constructor(message: string);
}
export declare class CooldownError extends BaseBotError {
    readonly remainingTime: number;
    constructor(message: string, remainingTime: number);
}
export declare class PermissionError extends BaseBotError {
    constructor(message: string);
}
export declare class NotFoundError extends BaseBotError {
    constructor(message: string, code?: string);
}
//# sourceMappingURL=BaseBotError.d.ts.map
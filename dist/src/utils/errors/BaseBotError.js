"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = exports.PermissionError = exports.CooldownError = exports.InventoryFullError = exports.InsufficientFundsError = exports.ValidationError = exports.DatabaseError = exports.BaseBotError = void 0;
class BaseBotError extends Error {
    code;
    isOperational;
    constructor(message, code, isOperational = true) {
        super(message);
        this.code = code;
        this.isOperational = isOperational;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.BaseBotError = BaseBotError;
class DatabaseError extends BaseBotError {
    constructor(message, code) {
        super(message, code);
    }
}
exports.DatabaseError = DatabaseError;
class ValidationError extends BaseBotError {
    constructor(message, code) {
        super(message, code);
    }
}
exports.ValidationError = ValidationError;
class InsufficientFundsError extends BaseBotError {
    constructor(message) {
        super(message, "INSUFFICIENT_FUNDS");
    }
}
exports.InsufficientFundsError = InsufficientFundsError;
class InventoryFullError extends BaseBotError {
    constructor(message) {
        super(message, "INVENTORY_FULL");
    }
}
exports.InventoryFullError = InventoryFullError;
class CooldownError extends BaseBotError {
    remainingTime;
    constructor(message, remainingTime) {
        super(message, "COOLDOWN_ACTIVE");
        this.remainingTime = remainingTime;
    }
}
exports.CooldownError = CooldownError;
class PermissionError extends BaseBotError {
    constructor(message) {
        super(message, "INSUFFICIENT_PERMISSION");
    }
}
exports.PermissionError = PermissionError;
class NotFoundError extends BaseBotError {
    constructor(message, code) {
        super(message, code || "NOT_FOUND");
    }
}
exports.NotFoundError = NotFoundError;
//# sourceMappingURL=BaseBotError.js.map
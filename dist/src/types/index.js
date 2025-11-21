"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuildError = exports.DatabaseError = exports.InventoryError = exports.EconomyError = exports.BotError = void 0;
/**
 * Error types
 */
class BotError extends Error {
    code;
    details;
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = "BotError";
    }
}
exports.BotError = BotError;
class EconomyError extends BotError {
    constructor(message, details) {
        super(message, "ECONOMY_ERROR", details);
        this.name = "EconomyError";
    }
}
exports.EconomyError = EconomyError;
class InventoryError extends BotError {
    constructor(message, details) {
        super(message, "INVENTORY_ERROR", details);
        this.name = "InventoryError";
    }
}
exports.InventoryError = InventoryError;
class DatabaseError extends BotError {
    constructor(message, details) {
        super(message, "DATABASE_ERROR", details);
        this.name = "DatabaseError";
    }
}
exports.DatabaseError = DatabaseError;
class GuildError extends BotError {
    constructor(message, details) {
        super(message, "GUILD_ERROR", details);
        this.name = "GuildError";
    }
}
exports.GuildError = GuildError;
//# sourceMappingURL=index.js.map
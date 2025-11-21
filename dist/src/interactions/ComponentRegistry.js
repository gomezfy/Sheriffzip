"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.componentRegistry = exports.ComponentRegistry = void 0;
class ComponentRegistry {
    buttonHandlers = new Map();
    buttonPatterns = [];
    selectMenuHandlers = new Map();
    selectMenuPatterns = [];
    registerButton(customId, handler, description) {
        this.buttonHandlers.set(customId, handler);
    }
    registerButtonPattern(pattern, handler, description) {
        this.buttonPatterns.push({ pattern, handler, description });
    }
    registerSelectMenu(customId, handler, description) {
        this.selectMenuHandlers.set(customId, handler);
    }
    registerSelectMenuPattern(pattern, handler, description) {
        this.selectMenuPatterns.push({ pattern, handler, description });
    }
    async handleButton(interaction) {
        const customId = interaction.customId;
        const exactHandler = this.buttonHandlers.get(customId);
        if (exactHandler) {
            await exactHandler(interaction);
            return true;
        }
        for (const { pattern, handler } of this.buttonPatterns) {
            if (pattern.test(customId)) {
                await handler(interaction);
                return true;
            }
        }
        return false;
    }
    async handleSelectMenu(interaction) {
        const customId = interaction.customId;
        const exactHandler = this.selectMenuHandlers.get(customId);
        if (exactHandler) {
            await exactHandler(interaction);
            return true;
        }
        for (const { pattern, handler } of this.selectMenuPatterns) {
            if (pattern.test(customId)) {
                await handler(interaction);
                return true;
            }
        }
        return false;
    }
    unregisterButton(customId) {
        this.buttonHandlers.delete(customId);
    }
    unregisterSelectMenu(customId) {
        this.selectMenuHandlers.delete(customId);
    }
    getRegisteredButtons() {
        return Array.from(this.buttonHandlers.keys());
    }
    getRegisteredSelectMenus() {
        return Array.from(this.selectMenuHandlers.keys());
    }
    clear() {
        this.buttonHandlers.clear();
        this.buttonPatterns = [];
        this.selectMenuHandlers.clear();
        this.selectMenuPatterns = [];
    }
}
exports.ComponentRegistry = ComponentRegistry;
exports.componentRegistry = new ComponentRegistry();
//# sourceMappingURL=ComponentRegistry.js.map
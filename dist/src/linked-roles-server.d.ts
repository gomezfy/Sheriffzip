/**
 * Linked Roles Verification Server
 * Enables Discord Linked Roles integration for Sheriff Rex Bot
 *
 * This server provides OAuth2 endpoints for Discord's Linked Roles feature,
 * allowing servers to use bot data as role requirements.
 */
declare const app: import("express-serve-static-core").Express;
declare module "express-session" {
    interface SessionData {
        userId?: string;
        accessToken?: string;
        state?: string;
    }
}
export default app;
//# sourceMappingURL=linked-roles-server.d.ts.map
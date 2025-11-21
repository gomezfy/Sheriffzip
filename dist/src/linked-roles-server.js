"use strict";
/**
 * Linked Roles Verification Server
 * Enables Discord Linked Roles integration for Sheriff Rex Bot
 *
 * This server provides OAuth2 endpoints for Discord's Linked Roles feature,
 * allowing servers to use bot data as role requirements.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const database_1 = require("./utils/database");
const mercadoPagoService_1 = require("./utils/mercadoPagoService");
const app = (0, express_1.default)();
const PORT = parseInt(process.env.LINKED_ROLES_PORT || "5000");
// Discord OAuth2 Configuration
const DISCORD_CONFIG = {
    clientId: process.env.DISCORD_CLIENT_ID || process.env.CLIENT_ID || "",
    clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
    redirectUri: process.env.DISCORD_REDIRECT_URI ||
        `http://localhost:${PORT}/discord/callback`,
    apiEndpoint: "https://discord.com/api/v10",
    scopes: ["identify", "role_connections.write"],
};
// Session configuration
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || crypto_1.default.randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static files from public directory
app.use(express_1.default.static("public"));
/**
 * Get Discord OAuth2 access token
 */
async function getDiscordAccessToken(code) {
    const params = new URLSearchParams({
        client_id: DISCORD_CONFIG.clientId,
        client_secret: DISCORD_CONFIG.clientSecret,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: DISCORD_CONFIG.redirectUri,
    });
    try {
        const response = await axios_1.default.post(`${DISCORD_CONFIG.apiEndpoint}/oauth2/token`, params.toString(), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        return response.data;
    }
    catch (error) {
        console.error("Error getting Discord access token:", error.response?.data || error.message);
        throw error;
    }
}
/**
 * Get Discord user info
 */
async function getDiscordUser(accessToken) {
    try {
        const response = await axios_1.default.get(`${DISCORD_CONFIG.apiEndpoint}/users/@me`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return response.data;
    }
    catch (error) {
        console.error("Error getting Discord user:", error.response?.data || error.message);
        throw error;
    }
}
/**
 * Update user's role connection metadata
 */
async function updateRoleConnectionMetadata(userId, accessToken, metadata) {
    try {
        await axios_1.default.put(`${DISCORD_CONFIG.apiEndpoint}/users/@me/applications/${DISCORD_CONFIG.clientId}/role-connection`, {
            platform_name: "Sheriff Rex Bot",
            platform_username: userId,
            metadata: metadata,
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });
        console.log(`✅ Updated role connection for user ${userId}`);
    }
    catch (error) {
        console.error("Error updating role connection:", error.response?.data || error.message);
        throw error;
    }
}
/**
 * Get user metadata from bot database
 */
function getUserMetadata(userId) {
    const economyData = (0, database_1.readData)("economy.json");
    const userData = economyData[userId];
    if (!userData) {
        return {
            total_coins: 0,
            total_tokens: 0,
            level: 0,
            bounties_captured: 0,
            games_played: 0,
            mining_sessions: 0,
        };
    }
    // Calculate total wealth
    const totalCoins = (userData.silverCoins || 0) + (userData.goldBars || 0) * 100;
    const totalTokens = userData.saloonTokens || 0;
    // Calculate level based on total wealth
    const level = Math.floor((totalCoins + totalTokens * 10) / 1000);
    // Get statistics
    const bountiesCaptured = userData.bountiesCaptured || 0;
    const gamesPlayed = userData.gamesPlayed || 0;
    const miningSessions = userData.miningSessions || 0;
    return {
        total_coins: totalCoins,
        total_tokens: totalTokens,
        level: level,
        bounties_captured: bountiesCaptured,
        games_played: gamesPlayed,
        mining_sessions: miningSessions,
    };
}
// Routes
/**
 * Home page - Verification instructions
 */
app.get("/", (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sheriff Rex - Linked Roles</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 800px;
          margin: 50px auto;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        }
        h1 { 
          font-size: 2.5em; 
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .emoji { font-size: 3em; margin-bottom: 20px; }
        a.button {
          display: inline-block;
          background: #5865F2;
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 10px;
          font-weight: bold;
          margin-top: 20px;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(88, 101, 242, 0.4);
        }
        a.button:hover {
          background: #4752C4;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(88, 101, 242, 0.6);
        }
        .info {
          background: rgba(255, 255, 255, 0.1);
          padding: 20px;
          border-radius: 10px;
          margin-top: 30px;
        }
        .info h3 { margin-top: 0; }
        ul { text-align: left; }
        li { margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="emoji">🤠</div>
        <h1>Sheriff Rex Bot</h1>
        <h2>Linked Roles Verification</h2>
        <p>Connect your Discord account to verify your Sheriff Rex Bot statistics and unlock special roles!</p>
        
        <a href="/discord/verify" class="button">🔗 Connect with Discord</a>
        
        <div class="info">
          <h3>📊 Available Metadata</h3>
          <ul>
            <li>💰 <strong>Total Coins:</strong> Your total wealth in Silver Coins</li>
            <li>🎫 <strong>Total Tokens:</strong> Your Saloon Tokens balance</li>
            <li>⭐ <strong>Level:</strong> Your calculated level based on wealth</li>
            <li>🎯 <strong>Bounties Captured:</strong> Number of bounties you've captured</li>
            <li>🎰 <strong>Games Played:</strong> Total gambling games played</li>
            <li>⛏️ <strong>Mining Sessions:</strong> Number of mining sessions completed</li>
          </ul>
        </div>
        
        <div class="info">
          <h3>🔒 Privacy</h3>
          <p>We only access your Discord user ID to link your bot data. No personal information is stored.</p>
          <p>See our <a href="https://github.com/gomezfy/Sheriffbot-/blob/main/PRIVACY_POLICY.md" style="color: #fff;">Privacy Policy</a></p>
        </div>
      </div>
    </body>
    </html>
  `);
});
/**
 * Initiate Discord OAuth2 flow
 */
app.get("/discord/verify", (req, res) => {
    const state = crypto_1.default.randomBytes(16).toString("hex");
    req.session.state = state;
    const authUrl = new URL(`${DISCORD_CONFIG.apiEndpoint}/oauth2/authorize`);
    authUrl.searchParams.append("client_id", DISCORD_CONFIG.clientId);
    authUrl.searchParams.append("redirect_uri", DISCORD_CONFIG.redirectUri);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("scope", DISCORD_CONFIG.scopes.join(" "));
    authUrl.searchParams.append("state", state);
    res.redirect(authUrl.toString());
});
/**
 * Discord OAuth2 callback
 */
app.get("/discord/callback", async (req, res) => {
    const { code, state } = req.query;
    // Verify state to prevent CSRF
    if (!state || state !== req.session.state) {
        return res.status(403).send("Invalid state parameter");
    }
    if (!code) {
        return res.status(400).send("No code provided");
    }
    try {
        // Exchange code for access token
        const tokenData = await getDiscordAccessToken(code);
        const accessToken = tokenData.access_token;
        // Get user info
        const user = await getDiscordUser(accessToken);
        const userId = user.id;
        // Get user metadata from bot database
        const metadata = getUserMetadata(userId);
        // Update role connection
        await updateRoleConnectionMetadata(userId, accessToken, metadata);
        // Store in session
        req.session.userId = userId;
        req.session.accessToken = accessToken;
        // Success page
        res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sheriff Rex - Verification Success</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
          }
          .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          }
          .success { font-size: 5em; margin-bottom: 20px; }
          h1 { font-size: 2.5em; margin-bottom: 20px; }
          .stats {
            background: rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 10px;
            margin: 30px 0;
            text-align: left;
          }
          .stat-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          }
          .stat-item:last-child { border-bottom: none; }
          a {
            color: #fff;
            text-decoration: none;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success">✅</div>
          <h1>Verification Successful!</h1>
          <p>Your Sheriff Rex Bot data has been linked to your Discord account.</p>
          
          <div class="stats">
            <h3>📊 Your Statistics</h3>
            <div class="stat-item">
              <span>💰 Total Coins:</span>
              <strong>${metadata.total_coins.toLocaleString()}</strong>
            </div>
            <div class="stat-item">
              <span>🎫 Total Tokens:</span>
              <strong>${metadata.total_tokens.toLocaleString()}</strong>
            </div>
            <div class="stat-item">
              <span>⭐ Level:</span>
              <strong>${metadata.level}</strong>
            </div>
            <div class="stat-item">
              <span>🎯 Bounties Captured:</span>
              <strong>${metadata.bounties_captured}</strong>
            </div>
            <div class="stat-item">
              <span>🎰 Games Played:</span>
              <strong>${metadata.games_played}</strong>
            </div>
            <div class="stat-item">
              <span>⛏️ Mining Sessions:</span>
              <strong>${metadata.mining_sessions}</strong>
            </div>
          </div>
          
          <p>You can now close this window and return to Discord.</p>
          <p>Server administrators can use these stats as role requirements!</p>
          
          <p style="margin-top: 30px; font-size: 0.9em;">
            <a href="/">🔄 Verify Again</a> | 
            <a href="https://github.com/gomezfy/Sheriffbot-">📖 Documentation</a>
          </p>
        </div>
      </body>
      </html>
    `);
    }
    catch (error) {
        console.error("Error in OAuth callback:", error);
        res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sheriff Rex - Verification Error</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
          }
          .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          }
          .error { font-size: 5em; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="error">❌</div>
          <h1>Verification Failed</h1>
          <p>There was an error verifying your account. Please try again.</p>
          <p><a href="/" style="color: #fff;">← Back to Home</a></p>
        </div>
      </body>
      </html>
    `);
    }
});
/**
 * Health check endpoint
 */
app.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        service: "Sheriff Rex Linked Roles",
        timestamp: new Date().toISOString(),
    });
});
/**
 * API endpoint to manually update metadata
 */
app.post("/api/update-metadata/:userId", async (req, res) => {
    const { userId } = req.params;
    const { accessToken } = req.body;
    if (!accessToken) {
        return res.status(400).json({ error: "Access token required" });
    }
    try {
        const metadata = getUserMetadata(userId);
        await updateRoleConnectionMetadata(userId, accessToken, metadata);
        res.json({
            success: true,
            metadata: metadata,
        });
    }
    catch (error) {
        res.status(500).json({
            error: "Failed to update metadata",
            message: error.message,
        });
    }
});
/**
 * Mercado Pago Webhook Handler
 * Processes payment notifications from Mercado Pago
 *
 * SECURITY: This endpoint validates payments by fetching them directly from
 * Mercado Pago's API, preventing spoofing attacks. Only verified payments
 * are processed.
 */
app.post("/webhook/mercadopago", async (req, res) => {
    try {
        console.log("📥 Mercado Pago Webhook received - Full body:", JSON.stringify(req.body, null, 2));
        console.log("📥 Query params:", JSON.stringify(req.query, null, 2));
        const { type, data, action, id } = req.body;
        const queryId = req.query?.id || req.query?.['data.id'];
        // Try different payload formats
        const paymentId = data?.id || id || queryId;
        const eventType = type || action;
        console.log("🔍 Extracted data:", { eventType, paymentId });
        // Validate required fields
        if (!paymentId) {
            console.error("❌ Invalid webhook payload - missing payment ID");
            console.log("ℹ️  This might be a webhook validation/test ping - responding with 200");
            // Return 200 for validation pings
            return res.status(200).json({
                success: true,
                message: "Webhook endpoint is active"
            });
        }
        if (eventType === "payment" || eventType === "payment.created" || eventType === "payment.updated") {
            console.log(`💳 Processing payment notification: ${paymentId}`);
            // Process payment - this internally validates by fetching from MP API
            const result = await (0, mercadoPagoService_1.processPaymentNotification)(paymentId);
            if (!result.success) {
                console.error(`❌ Payment processing failed: ${result.error}`);
                // Return 200 to prevent retries for business logic errors
                // Return 4xx for validation errors to trigger retries
                if (result.error?.includes('not found') || result.error?.includes('not configured')) {
                    return res.status(404).json({
                        error: result.error,
                        success: false
                    });
                }
                return res.status(200).json({
                    error: result.error,
                    success: false
                });
            }
            console.log(`✅ Payment ${paymentId} processed successfully`);
            return res.status(200).json({ success: true });
        }
        // Unknown event type - acknowledge but don't process
        console.log(`ℹ️  Event type '${eventType}' not handled - acknowledging`);
        return res.status(200).json({ success: true, message: 'Event type not handled' });
    }
    catch (error) {
        console.error("❌ Error processing Mercado Pago webhook:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        // Return 500 to trigger Mercado Pago retries for unexpected errors
        return res.status(500).json({
            error: errorMessage,
            success: false
        });
    }
});
/**
 * Payment success page
 */
app.get("/payment/success", (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pagamento Aprovado - Sheriff Rex</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          text-align: center;
          max-width: 500px;
        }
        h1 { color: #2ecc71; margin-bottom: 10px; }
        p { color: #555; line-height: 1.6; }
        .emoji { font-size: 64px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="emoji">✅</div>
        <h1>Pagamento Aprovado!</h1>
        <p>Seus RexBucks foram creditados automaticamente!</p>
        <p>Verifique seu saldo no Discord com o comando <code>/rexbucks balance</code></p>
        <p style="margin-top: 30px; font-size: 14px; color: #999;">
          Você pode fechar esta janela
        </p>
      </div>
    </body>
    </html>
  `);
});
/**
 * Payment pending page
 */
app.get("/payment/pending", (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pagamento Pendente - Sheriff Rex</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          text-align: center;
          max-width: 500px;
        }
        h1 { color: #f39c12; margin-bottom: 10px; }
        p { color: #555; line-height: 1.6; }
        .emoji { font-size: 64px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="emoji">⏳</div>
        <h1>Pagamento Pendente</h1>
        <p>Seu pagamento está sendo processado.</p>
        <p>Assim que for aprovado, seus RexBucks serão creditados automaticamente!</p>
        <p style="margin-top: 30px; font-size: 14px; color: #999;">
          Você pode fechar esta janela
        </p>
      </div>
    </body>
    </html>
  `);
});
/**
 * Payment failure page
 */
app.get("/payment/failure", (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pagamento Falhou - Sheriff Rex</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #f2709c 0%, #ff9472 100%);
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          text-align: center;
          max-width: 500px;
        }
        h1 { color: #e74c3c; margin-bottom: 10px; }
        p { color: #555; line-height: 1.6; }
        .emoji { font-size: 64px; margin-bottom: 20px; }
        a {
          display: inline-block;
          margin-top: 20px;
          padding: 12px 24px;
          background: #3498db;
          color: white;
          text-decoration: none;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="emoji">❌</div>
        <h1>Pagamento Falhou</h1>
        <p>Não foi possível processar seu pagamento.</p>
        <p>Tente novamente usando o comando <code>/loja</code> no Discord.</p>
      </div>
    </body>
    </html>
  `);
});
/**
 * API endpoint to get custom emojis
 */
app.get("/api/emojis", (req, res) => {
    try {
        const { APPLICATION_EMOJIS } = require("./utils/customEmojis");
        const emojiMap = {};
        for (const [key, value] of Object.entries(APPLICATION_EMOJIS)) {
            if (value && value !== "") {
                const emojiString = value;
                const match = emojiString.match(/<:([^:]+):(\d+)>/);
                if (match) {
                    const [, name, id] = match;
                    emojiMap[key.toLowerCase()] = `https://cdn.discordapp.com/emojis/${id}.png`;
                }
            }
        }
        res.json(emojiMap);
    }
    catch (error) {
        console.error("Error fetching emojis:", error);
        res.status(500).json({ error: "Failed to fetch emojis" });
    }
});
/**
 * API endpoint to get event data
 */
app.get("/api/events", (req, res) => {
    try {
        const { getAllActiveEvents, getEventLeaderboard, getTimeUntilNextEvent, getNextSundayDate, getCurrentHuntingEvent, getHuntingEventLeaderboard } = require("./utils/eventManager");
        const activeEvents = getAllActiveEvents();
        const miningEvent = activeEvents.find((e) => e.type === "mining");
        const huntingEvent = activeEvents.find((e) => e.type === "hunting");
        const miningLeaderboard = getEventLeaderboard();
        const huntingLeaderboard = getHuntingEventLeaderboard();
        const timeUntilNext = getTimeUntilNextEvent();
        const nextSunday = getNextSundayDate();
        const miningLeaderboardWithAvatars = miningLeaderboard.slice(0, 10).map((player) => ({
            ...player,
            avatarUrl: `https://cdn.discordapp.com/embed/avatars/${parseInt(player.userId) % 6}.png`
        }));
        const huntingLeaderboardWithAvatars = huntingLeaderboard.slice(0, 10).map((player) => ({
            ...player,
            avatarUrl: `https://cdn.discordapp.com/embed/avatars/${parseInt(player.userId) % 6}.png`
        }));
        const miningPrizes = [
            { position: 1, silver: 300000, tokens: 300, xp: 3500 },
            { position: 2, silver: 200000, tokens: 200, xp: 1750 },
            { position: 3, silver: 100000, tokens: 100, xp: 875 },
            { position: 4, silver: 50000, tokens: 50, xp: 400 },
            { position: 5, silver: 40000, tokens: 40, xp: 350 },
            { position: 6, silver: 30000, tokens: 30, xp: 300 },
            { position: 7, silver: 20000, tokens: 20, xp: 250 },
            { position: 8, silver: 15000, tokens: 15, xp: 200 },
            { position: 9, silver: 10000, tokens: 10, xp: 150 },
            { position: 10, silver: 5000, tokens: 5, xp: 100 },
        ];
        const huntingPrizes = [
            { position: 1, silver: 250000, tokens: 250, xp: 3000 },
            { position: 2, silver: 150000, tokens: 150, xp: 1500 },
            { position: 3, silver: 80000, tokens: 80, xp: 750 },
            { position: 4, silver: 50000, tokens: 50, xp: 500 },
            { position: 5, silver: 35000, tokens: 35, xp: 350 },
            { position: 6, silver: 25000, tokens: 25, xp: 250 },
            { position: 7, silver: 18000, tokens: 18, xp: 180 },
            { position: 8, silver: 12000, tokens: 12, xp: 120 },
            { position: 9, silver: 8000, tokens: 8, xp: 80 },
            { position: 10, silver: 5000, tokens: 5, xp: 50 },
        ];
        res.json({
            currentEvent: miningEvent ? {
                id: miningEvent.id,
                name: miningEvent.name,
                type: "mining",
                active: miningEvent.active,
                startTime: miningEvent.startTime,
                endTime: miningEvent.endTime,
                phase: miningEvent.phase,
                participantCount: Object.keys(miningEvent.participants).length
            } : null,
            huntingEvent: huntingEvent ? {
                id: huntingEvent.id,
                name: huntingEvent.name,
                type: "hunting",
                active: huntingEvent.active,
                startTime: huntingEvent.startTime,
                endTime: huntingEvent.endTime,
                phase: huntingEvent.phase,
                participantCount: Object.keys(huntingEvent.participants).length
            } : null,
            leaderboard: miningLeaderboardWithAvatars,
            huntingLeaderboard: huntingLeaderboardWithAvatars,
            prizes: miningPrizes,
            huntingPrizes,
            nextEvent: {
                date: nextSunday.toISOString(),
                timeUntil: timeUntilNext
            }
        });
    }
    catch (error) {
        console.error("Error fetching event data:", error);
        res.status(500).json({ error: "Failed to fetch event data" });
    }
});
// Start server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🔗 Linked Roles server running on port ${PORT}`);
        console.log(`📍 Verification URL: http://localhost:${PORT}`);
        console.log(`🔧 Redirect URI: ${DISCORD_CONFIG.redirectUri}`);
        console.log("");
        console.log("⚙️  Configuration:");
        console.log(`   Client ID: ${DISCORD_CONFIG.clientId ? "✅ Set" : "❌ Not set"}`);
        console.log(`   Client Secret: ${DISCORD_CONFIG.clientSecret ? "✅ Set" : "❌ Not set"}`);
        console.log(`   Redirect URI: ${DISCORD_CONFIG.redirectUri}`);
    });
}
exports.default = app;
//# sourceMappingURL=linked-roles-server.js.map
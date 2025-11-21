"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redemptionCodesRelations = exports.rexBuckTransactionsRelations = exports.guildJoinRequestsRelations = exports.guildMembersRelations = exports.playerGuildsRelations = exports.punishmentsRelations = exports.territoriesRelations = exports.activeMiningRelations = exports.bountiesRelations = exports.inventoryItemsRelations = exports.usersRelations = exports.mercadoPagoPayments = exports.rexBuckPackages = exports.redemptionCodes = exports.welcomeSettings = exports.rexBuckTransactions = exports.logs = exports.guildJoinRequests = exports.guildMembers = exports.playerGuilds = exports.punishments = exports.territories = exports.activeMining = exports.bounties = exports.inventoryItems = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.users = (0, pg_core_1.pgTable)('users', {
    userId: (0, pg_core_1.text)('user_id').primaryKey(),
    username: (0, pg_core_1.text)('username').notNull(),
    gold: (0, pg_core_1.integer)('gold').notNull().default(0),
    silver: (0, pg_core_1.integer)('silver').notNull().default(0),
    saloonTokens: (0, pg_core_1.integer)('saloon_tokens').notNull().default(0),
    bank: (0, pg_core_1.integer)('bank').notNull().default(0),
    rexBucks: (0, pg_core_1.integer)('rex_bucks').notNull().default(0),
    level: (0, pg_core_1.integer)('level').notNull().default(1),
    xp: (0, pg_core_1.integer)('xp').notNull().default(0),
    lastMessage: (0, pg_core_1.timestamp)('last_message'),
    lastClaimDaily: (0, pg_core_1.timestamp)('last_claim_daily'),
    dailyStreak: (0, pg_core_1.integer)('daily_streak').notNull().default(0),
    customBackground: (0, pg_core_1.text)('custom_background'),
    isVip: (0, pg_core_1.boolean)('is_vip').notNull().default(false),
    badges: (0, pg_core_1.jsonb)('badges').notNull().default([]),
    gamesPlayed: (0, pg_core_1.integer)('games_played').notNull().default(0),
    bountiesCaptured: (0, pg_core_1.integer)('bounties_captured').notNull().default(0),
    miningSessions: (0, pg_core_1.integer)('mining_sessions').notNull().default(0),
    totalEarnings: (0, pg_core_1.integer)('total_earnings').notNull().default(0),
    totalSpent: (0, pg_core_1.integer)('total_spent').notNull().default(0),
    language: (0, pg_core_1.text)('language').notNull().default('pt-BR'),
    showStats: (0, pg_core_1.boolean)('show_stats').notNull().default(true),
    privateProfile: (0, pg_core_1.boolean)('private_profile').notNull().default(false),
    backpackCapacity: (0, pg_core_1.integer)('backpack_capacity').notNull().default(100),
    lastMiningTime: (0, pg_core_1.timestamp)('last_mining_time'),
    totalMined: (0, pg_core_1.integer)('total_mined').notNull().default(0),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
});
exports.inventoryItems = (0, pg_core_1.pgTable)('inventory_items', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    userId: (0, pg_core_1.text)('user_id').notNull().references(() => exports.users.userId, { onDelete: 'cascade' }),
    itemId: (0, pg_core_1.text)('item_id').notNull(),
    name: (0, pg_core_1.text)('name').notNull(),
    quantity: (0, pg_core_1.integer)('quantity').notNull().default(1),
    weight: (0, pg_core_1.real)('weight').notNull(),
    value: (0, pg_core_1.integer)('value').notNull(),
    type: (0, pg_core_1.text)('type').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
}, (table) => ({
    userItemUnique: (0, pg_core_1.unique)().on(table.userId, table.itemId),
}));
exports.bounties = (0, pg_core_1.pgTable)('bounties', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    targetId: (0, pg_core_1.text)('target_id').notNull().references(() => exports.users.userId, { onDelete: 'cascade' }),
    issuerId: (0, pg_core_1.text)('issuer_id').notNull().references(() => exports.users.userId, { onDelete: 'cascade' }),
    amount: (0, pg_core_1.integer)('amount').notNull(),
    reason: (0, pg_core_1.text)('reason').notNull(),
    timestamp: (0, pg_core_1.timestamp)('timestamp').notNull().defaultNow(),
    active: (0, pg_core_1.boolean)('active').notNull().default(true),
});
exports.activeMining = (0, pg_core_1.pgTable)('active_mining', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    userId: (0, pg_core_1.text)('user_id').notNull().references(() => exports.users.userId, { onDelete: 'cascade' }),
    startTime: (0, pg_core_1.timestamp)('start_time').notNull(),
    duration: (0, pg_core_1.integer)('duration').notNull(),
    type: (0, pg_core_1.text)('type').notNull(),
    participants: (0, pg_core_1.jsonb)('participants'),
    expectedRewards: (0, pg_core_1.integer)('expected_rewards').notNull(),
});
exports.territories = (0, pg_core_1.pgTable)('territories', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    ownerId: (0, pg_core_1.text)('owner_id').references(() => exports.users.userId, { onDelete: 'set null' }),
    controlledGuildId: (0, pg_core_1.text)('controlled_guild_id'),
    income: (0, pg_core_1.integer)('income').notNull().default(0),
    defenseLevel: (0, pg_core_1.integer)('defense_level').notNull().default(1),
    lastIncomeTime: (0, pg_core_1.timestamp)('last_income_time').notNull().defaultNow(),
});
exports.punishments = (0, pg_core_1.pgTable)('punishments', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    userId: (0, pg_core_1.text)('user_id').notNull().references(() => exports.users.userId, { onDelete: 'cascade' }),
    reason: (0, pg_core_1.text)('reason').notNull(),
    startTime: (0, pg_core_1.timestamp)('start_time').notNull(),
    duration: (0, pg_core_1.integer)('duration').notNull(),
    active: (0, pg_core_1.boolean)('active').notNull().default(true),
});
exports.playerGuilds = (0, pg_core_1.pgTable)('player_guilds', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull().unique(),
    description: (0, pg_core_1.text)('description').notNull(),
    leaderId: (0, pg_core_1.text)('leader_id').notNull().references(() => exports.users.userId, { onDelete: 'cascade' }),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    level: (0, pg_core_1.integer)('level').notNull().default(1),
    xp: (0, pg_core_1.integer)('xp').notNull().default(0),
    maxMembers: (0, pg_core_1.integer)('max_members').notNull().default(10),
    isPublic: (0, pg_core_1.boolean)('is_public').notNull().default(true),
    requireApproval: (0, pg_core_1.boolean)('require_approval').notNull().default(false),
});
exports.guildMembers = (0, pg_core_1.pgTable)('guild_members', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    guildId: (0, pg_core_1.text)('guild_id').notNull().references(() => exports.playerGuilds.id, { onDelete: 'cascade' }),
    userId: (0, pg_core_1.text)('user_id').notNull().references(() => exports.users.userId, { onDelete: 'cascade' }),
    joinedAt: (0, pg_core_1.timestamp)('joined_at').notNull().defaultNow(),
    role: (0, pg_core_1.text)('role').notNull().default('member'),
});
exports.guildJoinRequests = (0, pg_core_1.pgTable)('guild_join_requests', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    userId: (0, pg_core_1.text)('user_id').notNull().references(() => exports.users.userId, { onDelete: 'cascade' }),
    guildId: (0, pg_core_1.text)('guild_id').notNull().references(() => exports.playerGuilds.id, { onDelete: 'cascade' }),
    requestedAt: (0, pg_core_1.timestamp)('requested_at').notNull().defaultNow(),
    status: (0, pg_core_1.text)('status').notNull().default('pending'),
});
exports.logs = (0, pg_core_1.pgTable)('logs', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    timestamp: (0, pg_core_1.timestamp)('timestamp').notNull().defaultNow(),
    type: (0, pg_core_1.text)('type').notNull(),
    guildId: (0, pg_core_1.text)('guild_id').notNull(),
    userId: (0, pg_core_1.text)('user_id'),
    details: (0, pg_core_1.jsonb)('details').notNull(),
});
exports.rexBuckTransactions = (0, pg_core_1.pgTable)('rex_buck_transactions', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    userId: (0, pg_core_1.text)('user_id').notNull().references(() => exports.users.userId, { onDelete: 'cascade' }),
    amount: (0, pg_core_1.integer)('amount').notNull(),
    type: (0, pg_core_1.text)('type').notNull(),
    redemptionCode: (0, pg_core_1.text)('redemption_code'),
    balanceBefore: (0, pg_core_1.integer)('balance_before').notNull(),
    balanceAfter: (0, pg_core_1.integer)('balance_after').notNull(),
    metadata: (0, pg_core_1.jsonb)('metadata'),
    timestamp: (0, pg_core_1.timestamp)('timestamp').notNull().defaultNow(),
});
exports.welcomeSettings = (0, pg_core_1.pgTable)('welcome_settings', {
    guildId: (0, pg_core_1.text)('guild_id').primaryKey(),
    channelId: (0, pg_core_1.text)('channel_id'),
    message: (0, pg_core_1.text)('message'),
    enabled: (0, pg_core_1.boolean)('enabled').notNull().default(false),
});
exports.redemptionCodes = (0, pg_core_1.pgTable)('redemption_codes', {
    code: (0, pg_core_1.text)('code').primaryKey(),
    productId: (0, pg_core_1.text)('product_id').notNull(),
    productName: (0, pg_core_1.text)('product_name').notNull(),
    tokens: (0, pg_core_1.integer)('tokens').notNull().default(0),
    coins: (0, pg_core_1.integer)('coins').notNull().default(0),
    rexBucks: (0, pg_core_1.integer)('rex_bucks').notNull().default(0),
    vip: (0, pg_core_1.boolean)('vip').notNull().default(false),
    background: (0, pg_core_1.boolean)('background').notNull().default(false),
    backpack: (0, pg_core_1.integer)('backpack'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    createdBy: (0, pg_core_1.text)('created_by').notNull(),
    redeemed: (0, pg_core_1.boolean)('redeemed').notNull().default(false),
    redeemedBy: (0, pg_core_1.text)('redeemed_by'),
    redeemedAt: (0, pg_core_1.timestamp)('redeemed_at'),
});
exports.rexBuckPackages = (0, pg_core_1.pgTable)('rex_buck_packages', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    description: (0, pg_core_1.text)('description').notNull(),
    amountRexBucks: (0, pg_core_1.integer)('amount_rexbucks').notNull(),
    bonusRexBucks: (0, pg_core_1.integer)('bonus_rexbucks').notNull().default(0),
    priceCents: (0, pg_core_1.integer)('price_cents').notNull(),
    currency: (0, pg_core_1.text)('currency').notNull().default('BRL'),
    active: (0, pg_core_1.boolean)('active').notNull().default(true),
    displayOrder: (0, pg_core_1.integer)('display_order').notNull().default(0),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
});
exports.mercadoPagoPayments = (0, pg_core_1.pgTable)('mercadopago_payments', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    userId: (0, pg_core_1.text)('user_id').notNull().references(() => exports.users.userId, { onDelete: 'cascade' }),
    packageId: (0, pg_core_1.text)('package_id').notNull().references(() => exports.rexBuckPackages.id),
    externalReference: (0, pg_core_1.text)('external_reference').notNull().unique(),
    preferenceId: (0, pg_core_1.text)('preference_id'),
    mpPaymentId: (0, pg_core_1.text)('mp_payment_id').unique(),
    status: (0, pg_core_1.text)('status').notNull().default('pending'),
    amount: (0, pg_core_1.integer)('amount').notNull(),
    currency: (0, pg_core_1.text)('currency').notNull().default('BRL'),
    paidAt: (0, pg_core_1.timestamp)('paid_at'),
    rawPayload: (0, pg_core_1.jsonb)('raw_payload'),
    processed: (0, pg_core_1.boolean)('processed').notNull().default(false),
    rexBuckTransactionId: (0, pg_core_1.text)('rex_buck_transaction_id'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
});
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many }) => ({
    inventoryItems: many(exports.inventoryItems),
    issuedBounties: many(exports.bounties, { relationName: 'issuer' }),
    targetedBounties: many(exports.bounties, { relationName: 'target' }),
    activeMining: many(exports.activeMining),
    territories: many(exports.territories),
    punishments: many(exports.punishments),
    guildMemberships: many(exports.guildMembers),
    guildJoinRequests: many(exports.guildJoinRequests),
    rexBuckTransactions: many(exports.rexBuckTransactions),
}));
exports.inventoryItemsRelations = (0, drizzle_orm_1.relations)(exports.inventoryItems, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.inventoryItems.userId],
        references: [exports.users.userId],
    }),
}));
exports.bountiesRelations = (0, drizzle_orm_1.relations)(exports.bounties, ({ one }) => ({
    target: one(exports.users, {
        fields: [exports.bounties.targetId],
        references: [exports.users.userId],
        relationName: 'target',
    }),
    issuer: one(exports.users, {
        fields: [exports.bounties.issuerId],
        references: [exports.users.userId],
        relationName: 'issuer',
    }),
}));
exports.activeMiningRelations = (0, drizzle_orm_1.relations)(exports.activeMining, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.activeMining.userId],
        references: [exports.users.userId],
    }),
}));
exports.territoriesRelations = (0, drizzle_orm_1.relations)(exports.territories, ({ one }) => ({
    owner: one(exports.users, {
        fields: [exports.territories.ownerId],
        references: [exports.users.userId],
    }),
}));
exports.punishmentsRelations = (0, drizzle_orm_1.relations)(exports.punishments, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.punishments.userId],
        references: [exports.users.userId],
    }),
}));
exports.playerGuildsRelations = (0, drizzle_orm_1.relations)(exports.playerGuilds, ({ one, many }) => ({
    leader: one(exports.users, {
        fields: [exports.playerGuilds.leaderId],
        references: [exports.users.userId],
    }),
    members: many(exports.guildMembers),
    joinRequests: many(exports.guildJoinRequests),
}));
exports.guildMembersRelations = (0, drizzle_orm_1.relations)(exports.guildMembers, ({ one }) => ({
    guild: one(exports.playerGuilds, {
        fields: [exports.guildMembers.guildId],
        references: [exports.playerGuilds.id],
    }),
    user: one(exports.users, {
        fields: [exports.guildMembers.userId],
        references: [exports.users.userId],
    }),
}));
exports.guildJoinRequestsRelations = (0, drizzle_orm_1.relations)(exports.guildJoinRequests, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.guildJoinRequests.userId],
        references: [exports.users.userId],
    }),
    guild: one(exports.playerGuilds, {
        fields: [exports.guildJoinRequests.guildId],
        references: [exports.playerGuilds.id],
    }),
}));
exports.rexBuckTransactionsRelations = (0, drizzle_orm_1.relations)(exports.rexBuckTransactions, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.rexBuckTransactions.userId],
        references: [exports.users.userId],
    }),
}));
exports.redemptionCodesRelations = (0, drizzle_orm_1.relations)(exports.redemptionCodes, ({ one }) => ({
    redeemedByUser: one(exports.users, {
        fields: [exports.redemptionCodes.redeemedBy],
        references: [exports.users.userId],
    }),
}));
//# sourceMappingURL=schema.js.map
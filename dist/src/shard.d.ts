/**
 * Sharding Manager for scaling to 10,000+ users
 * Automatically spawns multiple shards based on guild count
 */
export declare function broadcastEval(script: string): Promise<any[]>;
export declare function getTotalStats(): Promise<{
    guilds: number;
    users: number;
    channels: number;
    memory: number;
}>;
//# sourceMappingURL=shard.d.ts.map
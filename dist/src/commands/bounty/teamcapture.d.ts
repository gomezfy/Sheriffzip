import { ChatInputCommandInteraction } from "discord.js";
declare const TEAM_CAPTURE_COOLDOWN: number;
declare const teamCaptureData: {
    [userId: string]: number;
};
declare const _default: {
    data: any;
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
};
export default _default;
export { teamCaptureData, TEAM_CAPTURE_COOLDOWN };
//# sourceMappingURL=teamcapture.d.ts.map
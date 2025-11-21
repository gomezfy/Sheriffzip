"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleTeamCaptureButtons = handleTeamCaptureButtons;
const teamCaptureButtons_1 = require("../../../interactions/teamCaptureButtons");
/**
 * Handle all team capture related button interactions
 */
async function handleTeamCaptureButtons(interaction) {
    await (0, teamCaptureButtons_1.handleTeamCaptureButton)(interaction);
}
//# sourceMappingURL=teamCaptureHandlers.js.map
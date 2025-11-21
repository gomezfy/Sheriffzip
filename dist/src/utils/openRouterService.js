"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openRouterService = exports.OpenRouterService = void 0;
const axios_1 = __importDefault(require("axios"));
class OpenRouterService {
    apiKey;
    baseUrl = "https://openrouter.ai/api/v1";
    defaultModel = "meta-llama/llama-3.3-70b-instruct:free";
    constructor(apiKey) {
        this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || "";
        if (!this.apiKey) {
            console.warn("⚠️ OpenRouter API key not configured. AI features will not work.");
        }
    }
    async chat(messages, model, maxTokens = 500) {
        if (!this.apiKey) {
            throw new Error("OpenRouter API key not configured. Please set OPENROUTER_API_KEY environment variable.");
        }
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/chat/completions`, {
                model: model || this.defaultModel,
                messages,
                max_tokens: maxTokens,
                temperature: 0.7,
            }, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    "HTTP-Referer": "https://discord.bot",
                    "X-Title": "Sheriff Bot Discord AI",
                    "Content-Type": "application/json",
                },
                timeout: 30000,
            });
            if (!response.data.choices || response.data.choices.length === 0) {
                throw new Error("No response from AI model");
            }
            return response.data.choices[0].message.content;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                const axiosError = error;
                if (axiosError.response) {
                    const status = axiosError.response.status;
                    const data = axiosError.response.data;
                    if (status === 401) {
                        throw new Error("Invalid API key. Please check your OpenRouter API key.");
                    }
                    else if (status === 429) {
                        throw new Error("Rate limit exceeded. Please try again later.");
                    }
                    else if (status === 402) {
                        throw new Error("Insufficient credits. Please check your OpenRouter account.");
                    }
                    else {
                        throw new Error(data?.error?.message || `API error: ${status}`);
                    }
                }
                else if (axiosError.code === "ECONNABORTED") {
                    throw new Error("Request timeout. The AI model is taking too long to respond.");
                }
                else {
                    throw new Error("Failed to connect to OpenRouter API. Please check your internet connection.");
                }
            }
            throw error;
        }
    }
    async getAvailableModels() {
        if (!this.apiKey) {
            throw new Error("OpenRouter API key not configured.");
        }
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/models`, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                },
                timeout: 10000,
            });
            return response.data.data || [];
        }
        catch (error) {
            console.error("Error fetching models:", error);
            throw new Error("Failed to fetch available models from OpenRouter.");
        }
    }
    getDefaultModel() {
        return this.defaultModel;
    }
    setDefaultModel(modelId) {
        this.defaultModel = modelId;
    }
    isConfigured() {
        return !!this.apiKey && this.apiKey.length > 0;
    }
}
exports.OpenRouterService = OpenRouterService;
exports.openRouterService = new OpenRouterService();
//# sourceMappingURL=openRouterService.js.map
export interface OpenRouterModel {
    id: string;
    name: string;
    pricing: {
        prompt: string;
        completion: string;
        image?: string;
        request?: string;
    };
    context_length: number;
    description?: string;
    created?: number;
}
export interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}
export interface ChatCompletionResponse {
    id: string;
    choices: Array<{
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }>;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}
export declare class OpenRouterService {
    private apiKey;
    private baseUrl;
    private defaultModel;
    constructor(apiKey?: string);
    chat(messages: ChatMessage[], model?: string, maxTokens?: number): Promise<string>;
    getAvailableModels(): Promise<OpenRouterModel[]>;
    getDefaultModel(): string;
    setDefaultModel(modelId: string): void;
    isConfigured(): boolean;
}
export declare const openRouterService: OpenRouterService;
//# sourceMappingURL=openRouterService.d.ts.map
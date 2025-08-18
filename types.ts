
export interface PackagingInterrelation {
    type: string;
    description: string;
    utility_tool: string;
}

export interface Agent {
    name: string;
    role: string;
    philosophy: string;
    focus_areas: string[];
    packaging_interrelation: PackagingInterrelation[];
}

export interface Tool {
    name: string;
    primary_agent: string;
}

export interface ChainStep {
    tool: string;
    input: string;
    params?: Record<string, any>;
}

export interface ChainedBookmark {
    name: string;
    associated_agent?: string;
    description: string;
    chain: ChainStep[];
}

export interface CodexData {
    version: string;
    author: string;
    contact: string;
    ai_family: Agent[];
    tools: Tool[];
    chained_bookmarks: ChainedBookmark[];
}

export interface ChatMessage {
    role: 'user' | 'model' | 'system';
    content: string;
    timestamp: number;
}

export interface FileSystemNode {
    type: 'file' | 'directory';
    content?: string;
    contents?: { [key: string]: FileSystemNode };
}

export interface CustomInstructions {
    system: string;
    ai: string;
    user: string;
}

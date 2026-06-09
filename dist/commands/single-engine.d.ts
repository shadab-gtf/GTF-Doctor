export type SingleEngine = "seo" | "metadata" | "accessibility" | "performance" | "nextjs" | "gsap";
export declare function singleEngineCommand(rootDir: string, engine: SingleEngine): Promise<void>;

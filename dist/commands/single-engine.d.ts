export type SingleEngine = "seo" | "metadata" | "accessibility" | "performance" | "memory" | "react" | "runtime" | "component" | "page" | "nextjs" | "gsap" | "engineer";
export declare function singleEngineCommand(rootDir: string, engine: SingleEngine): Promise<void>;

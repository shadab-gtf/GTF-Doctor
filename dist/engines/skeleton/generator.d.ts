import { SkeletonAnalysis } from "./analyzer.js";
export interface SkeletonGenerationResult {
    generated: string[];
    skipped: string[];
    analyses: SkeletonAnalysis[];
    timeSavedMinutes: number;
}
export declare function generateSkeletons(rootDir: string, componentPaths: string[]): Promise<SkeletonGenerationResult>;
export declare function generateSkeletonFromAnalysis(rootDir: string, analysis: SkeletonAnalysis): Promise<SkeletonGenerationResult>;

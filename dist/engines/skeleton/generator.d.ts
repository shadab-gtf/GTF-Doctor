export interface SkeletonGenerationResult {
    generated: string[];
    skipped: string[];
    timeSavedMinutes: number;
}
export declare function generateSkeletons(rootDir: string, componentPaths: string[]): Promise<SkeletonGenerationResult>;

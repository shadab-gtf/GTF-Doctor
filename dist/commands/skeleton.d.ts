export interface SkeletonGenerateOptions {
    all?: boolean;
}
export declare function skeletonCheckCommand(rootDir: string): Promise<void>;
export declare function skeletonGenerateCommand(rootDir: string, targetName: string | undefined, options: SkeletonGenerateOptions): Promise<void>;

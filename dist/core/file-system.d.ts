import { PackageJson, ProjectFile } from "../types/report.js";
export declare function pathExists(target: string): Promise<boolean>;
export declare function ensureDir(target: string): Promise<void>;
export declare function readPackageJson(rootDir: string): Promise<PackageJson | undefined>;
export declare function collectProjectFiles(rootDir: string): Promise<ProjectFile[]>;
export declare function writeTextFile(target: string, content: string): Promise<void>;

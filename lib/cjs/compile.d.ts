export declare function compileFileAsync(inFile: string, outFile: string, consts: {
    [key: string]: string | number | undefined;
}, options?: {
    root?: string;
    maxPasses?: number;
    debug?: boolean;
}): Promise<void>;
export declare function compileFile(inFile: string, outFile: string, consts: {
    [key: string]: string | number | undefined;
}, options?: {
    root?: string;
    maxPasses?: number;
    debug?: boolean;
}): void;
export interface IProject {
    root: string;
    out: string;
    pages: {
        file: string;
        outFile?: string;
        consts: {
            [key: string]: string | number;
        };
    }[];
}
export declare function compileProjectAsync(projectFile?: string, options?: {
    debug?: boolean;
}): Promise<void>;
export declare function compileProject(projectFile?: string, options?: {
    debug?: boolean;
}): void;

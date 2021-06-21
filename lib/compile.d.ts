export declare function compileFileAsync(inFile: string, outFile: string, consts: {
    [key: string]: string | number | undefined;
}, options?: {
    root?: string;
    maxPasses?: number;
    prettify?: boolean;
    debug?: boolean;
}): Promise<void>;
export declare function compileFile(inFile: string, outFile: string, consts: {
    [key: string]: string | number | undefined;
}, options?: {
    root?: string;
    maxPasses?: number;
    prettify?: boolean;
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
    prettify?: boolean;
    debug?: boolean;
}): Promise<void>;
export declare function compileProject(projectFile?: string, options?: {
    prettify?: boolean;
    debug?: boolean;
}): void;

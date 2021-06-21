export declare function evaluateAsync(inFile: string, data: {
    [key: string]: string | number;
}, options?: {
    prettify?: boolean;
    debug?: boolean;
}): Promise<string>;
export declare function evaluate(inFile: string, data: {
    [key: string]: string | number;
}, callback: (page: string) => void, options?: {
    prettify?: boolean;
    debug?: boolean;
}): void;

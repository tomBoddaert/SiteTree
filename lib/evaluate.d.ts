export declare function evaluateAsync(inFile: string, data: {
    [key: string]: string | number;
}): Promise<string>;
export declare function evaluate(inFile: string, data: {
    [key: string]: string | number;
}, callback: (page: string) => void): void;

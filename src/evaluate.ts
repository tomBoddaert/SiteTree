import { readFile } from 'fs/promises';

import prettify from 'html-prettify';

import { isValidFilePath, getRegexGroups, regexReplace } from './functions';

export async function evaluateAsync(inFile: string, data: { [key: string]: string | number }, options?: { prettify?: boolean, debug?: boolean }) {
    if (options?.debug) console.log(`SiteTree evaluator: Opening ${inFile}`);
    if (!isValidFilePath(inFile)) throw new Error('SiteTree evaluator: Invalid file path!');

    let template = (await readFile(inFile)).toString();

    let variables = getRegexGroups(/(?:\{\{\s*)(.*?)(?:\s*\}\})/g, template).map(key => [ key, data[key] ] as [string, string | number | undefined]);
    if (variables.length > 0) {
        if (options?.debug) console.log(`SiteTree evaluator: Evaluating ${variables.length} variables`);
        template = regexReplace(['{{\\s*', '\\s*}}'], template, variables);
    }

    if (options?.prettify && options?.debug) console.log(`SiteTree evaluator: Prettifying HTML`);
    if (options?.prettify) template = prettify(template);

    if (options?.debug) console.log(`SiteTree evaluator: Evaluated file`);
    return template;
}

export function evaluate(inFile: string, data: { [key: string]: string | number }, callback: (page: string) => void, options?: { prettify?: boolean, debug?: boolean }) {
    evaluateAsync(inFile, data, options)
        .then(callback)
        .catch(console.error);
}
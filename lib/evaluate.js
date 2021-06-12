import { readFile } from 'fs/promises';
import { isValidFilePath, getRegexGroups, regexReplace } from './functions';
export async function evaluateAsync(inFile, data) {
    if (!isValidFilePath(inFile))
        throw new Error('SiteTree evaluator: Invalid file path!');
    let template = (await readFile(inFile)).toString();
    let constants = getRegexGroups(/(?:\{\{\s*)(.*?)(?:\s*\}\})/g, template).map(key => [key, data[key]]);
    if (constants.length > 0) {
        template = regexReplace(['{{\\s*', '\\s*}}'], template, constants);
    }
    return template;
}
export function evaluate(inFile, data, callback) {
    evaluateAsync(inFile, data)
        .then(callback)
        .catch(console.error);
}

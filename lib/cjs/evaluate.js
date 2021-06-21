"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluate = exports.evaluateAsync = void 0;
const promises_1 = require("fs/promises");
const html_prettify_1 = __importDefault(require("html-prettify"));
const functions_1 = require("./functions");
async function evaluateAsync(inFile, data, options) {
    if (options?.debug)
        console.log(`SiteTree evaluator: Opening ${inFile}`);
    if (!functions_1.isValidFilePath(inFile))
        throw new Error('SiteTree evaluator: Invalid file path!');
    let template = (await promises_1.readFile(inFile)).toString();
    let variables = functions_1.getRegexGroups(/(?:\{\{\s*)(.*?)(?:\s*\}\})/g, template).map(key => [key, data[key]]);
    if (variables.length > 0) {
        if (options?.debug)
            console.log(`SiteTree evaluator: Evaluating ${variables.length} variables`);
        template = functions_1.regexReplace(['{{\\s*', '\\s*}}'], template, variables);
    }
    if (options?.prettify && options?.debug)
        console.log(`SiteTree evaluator: Prettifying HTML`);
    if (options?.prettify)
        template = html_prettify_1.default(template);
    if (options?.debug)
        console.log(`SiteTree evaluator: Evaluated file`);
    return template;
}
exports.evaluateAsync = evaluateAsync;
function evaluate(inFile, data, callback, options) {
    evaluateAsync(inFile, data, options)
        .then(callback)
        .catch(console.error);
}
exports.evaluate = evaluate;

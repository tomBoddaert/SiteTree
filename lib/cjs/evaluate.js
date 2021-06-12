"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluate = exports.evaluateAsync = void 0;
const promises_1 = require("fs/promises");
const functions_1 = require("./functions");
async function evaluateAsync(inFile, data) {
    if (!functions_1.isValidFilePath(inFile))
        throw new Error('SiteTree evaluator: Invalid file path!');
    let template = (await promises_1.readFile(inFile)).toString();
    let constants = functions_1.getRegexGroups(/(?:\{\{\s*)(.*?)(?:\s*\}\})/g, template).map(key => [key, data[key]]);
    if (constants.length > 0) {
        template = functions_1.regexReplace(['{{\\s*', '\\s*}}'], template, constants);
    }
    return template;
}
exports.evaluateAsync = evaluateAsync;
function evaluate(inFile, data, callback) {
    evaluateAsync(inFile, data)
        .then(callback)
        .catch(console.error);
}
exports.evaluate = evaluate;

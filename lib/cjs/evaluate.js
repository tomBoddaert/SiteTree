"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluate = exports.evaluateAsync = void 0;
const promises_1 = require("fs/promises");
const prettify = __importStar(require("html-prettify"));
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
        template = prettify(template);
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

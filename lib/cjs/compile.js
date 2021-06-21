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
exports.compileProject = exports.compileProjectAsync = exports.compileFile = exports.compileFileAsync = void 0;
const promises_1 = require("fs/promises");
const path_1 = require("path");
const prettify = __importStar(require("html-prettify"));
const functions_1 = require("./functions");
async function compileFileAsync(inFile, outFile, consts, options) {
    if (options?.debug)
        console.log(`SiteTree compiler: Opening ${inFile}`);
    if (!functions_1.isValidFilePath(inFile) || !functions_1.isValidFilePath(outFile))
        throw new Error('SiteTree compiler: Invalid file path!');
    let root = options?.root ?? path_1.parse(inFile).dir + path_1.sep;
    let template = (await promises_1.readFile(inFile)).toString();
    if (options?.debug)
        console.log('SiteTree compiler: Opened file');
    let passesLeft = options?.maxPasses ?? 10;
    if (options?.debug)
        console.log(`SiteTree compiler: Max passes: ${passesLeft}`);
    while (passesLeft) {
        let modified = false;
        let componentPaths = functions_1.getRegexGroups(/(?:\<\{\s*)(.*?)(?:\s*\}\s?\/?\>)/g, template);
        if (componentPaths.length > 0) {
            componentPaths.forEach(path => { if (!functions_1.isValidFilePath(root + path))
                throw new Error(`SiteTree compiler: Invalid file path in file (${inFile})!`); });
            let componentPromises = Promise.all(componentPaths.map(path => promises_1.readFile(root + path_1.sep + path).then(data => [path, data.toString()])));
            template = functions_1.regexReplace(['<{\\s*', '\\s*}\s?\/?>'], template, await componentPromises);
            modified = true;
        }
        let constants = functions_1.getRegexGroups(/(?:\[\{\s*)(.*?)(?:\s*\}\])/g, template).map(key => [key, consts[key]]);
        if (constants.length > 0) {
            template = functions_1.regexReplace(['\\[{\\s*', '\\s*}\\]'], template, constants);
            modified = true;
        }
        passesLeft--;
        if (!modified)
            passesLeft = 0;
        if (options?.debug)
            console.log(`SiteTree compiler: Modified: ${modified}, Passes left: ${passesLeft}`);
    }
    if (options?.prettify && options.debug)
        console.log(`SiteTree compiler: Prettifying HTML`);
    if (options?.prettify)
        outFile = prettify(outFile);
    await promises_1.writeFile(outFile, template).catch(err => {
        if (err.code === 'ENOENT')
            throw new Error('SiteTree compiler: Out file path invalid!');
        else
            throw new Error(err);
    });
    if (options?.debug)
        console.log(`SiteTree compiler: Written file to ${outFile}`);
}
exports.compileFileAsync = compileFileAsync;
function compileFile(inFile, outFile, consts, options) {
    compileFileAsync(inFile, outFile, consts, options).catch(console.error);
}
exports.compileFile = compileFile;
async function compileProjectAsync(projectFile = './stproject.json', options) {
    projectFile = path_1.resolve(projectFile);
    if (options?.debug)
        console.log(`SiteTree compiler: Opening project ${projectFile}`);
    const project = require(projectFile);
    if (!functions_1.isValidFilePath(project.root) || !functions_1.isValidFilePath(project.out))
        throw new Error('SiteTree compiler: Invalid root/out path in project file!');
    if (options?.debug)
        console.log('SiteTree compiler: Opened project');
    await promises_1.mkdir(project.out).catch(err => { if (err.code !== 'EEXIST')
        throw new Error(err); });
    for (let { file: path, outFile: newPath, consts } of project.pages) {
        let relDir = path_1.parse(newPath ?? path).dir;
        await promises_1.mkdir(project.out + (relDir ? path_1.sep + relDir : ''), { recursive: true }).catch(err => { if (err.code !== 'EEXIST')
            throw new Error(err); });
        await compileFileAsync(project.root + path_1.sep + path, project.out + path_1.sep + (newPath ?? path), consts, { root: project.root, debug: options?.debug });
        if (options?.debug)
            console.log(`SiteTree compiler: Compiled ${path}`);
    }
    if (options?.debug)
        console.log(`SiteTree compiler: Project compiled`);
}
exports.compileProjectAsync = compileProjectAsync;
function compileProject(projectFile, options) {
    compileProjectAsync(projectFile, options).catch(console.error);
}
exports.compileProject = compileProject;

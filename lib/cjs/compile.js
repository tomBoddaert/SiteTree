"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileProject = exports.compileProjectAsync = exports.compileFile = exports.compileFileAsync = void 0;
const promises_1 = require("fs/promises");
const path_1 = require("path");
const functions_1 = require("./functions");
async function compileFileAsync(inFile, outFile, consts, options) {
    if (!functions_1.isValidFilePath(inFile) || !functions_1.isValidFilePath(outFile))
        throw new Error('SiteTree compiler: Invalid file path!');
    let root = options?.root ?? path_1.parse(inFile).dir + '/';
    let template = (await promises_1.readFile(inFile)).toString();
    let passesLeft = options?.maxPasses ?? 3;
    while (passesLeft) {
        passesLeft--;
        let componentPaths = functions_1.getRegexGroups(/(?:\<\{\s*)(.*?)(?:\s*\}\>)/g, template);
        if (componentPaths.length > 0) {
            componentPaths.forEach(path => { if (!functions_1.isValidFilePath(root + path))
                throw new Error(`SiteTree compiler: Invalid file path in file (${inFile})!`); });
            let componentPromises = Promise.all(componentPaths.map(path => promises_1.readFile(root + path).then(data => [path, data.toString()])));
            template = functions_1.regexReplace(['<{\\s*', '\\s*}>'], template, await componentPromises);
            passesLeft = 0;
        }
        let constants = functions_1.getRegexGroups(/(?:\[\{\s*)(.*?)(?:\s*\}\])/g, template).map(key => [key, consts[key]]);
        if (constants.length > 0) {
            template = functions_1.regexReplace(['\\[{\\s*', '\\s*}\\]'], template, constants);
            passesLeft = 0;
        }
    }
    await promises_1.writeFile(outFile, template).catch(err => {
        if (err.code === 'ENOENT')
            throw new Error('SiteTree compiler: Out file path invalid!');
        else
            throw new Error(err);
    });
}
exports.compileFileAsync = compileFileAsync;
function compileFile(inFile, outFile, consts) {
    compileFileAsync(inFile, outFile, consts).catch(console.error);
}
exports.compileFile = compileFile;
async function compileProjectAsync(projectFile = './stproject.json') {
    const project = require(projectFile);
    if (!functions_1.isValidFilePath(project.root) || !functions_1.isValidFilePath(project.out))
        throw new Error('SiteTree compiler: Invalid root/out path in project file!');
    await promises_1.mkdir(project.out).catch(err => { if (err.code !== 'EEXIST')
        throw new Error(err); });
    for (let { file: path, outFile: newPath, consts } of project.pages) {
        await promises_1.mkdir(project.out + '/' + (newPath ?? path), { recursive: true }).catch(err => { if (err.code !== 'EEXIST')
            throw new Error(err); });
        await compileFileAsync(project.root + '/' + path, project.out + '/' + (newPath ?? path), consts, { root: project.root });
    }
}
exports.compileProjectAsync = compileProjectAsync;
function compileProject(projectFile) {
    compileProjectAsync(projectFile).catch(console.error);
}
exports.compileProject = compileProject;

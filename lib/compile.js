import { readFile, writeFile, mkdir } from 'fs/promises';
import { parse as pathParse } from 'path';
import { isValidFilePath, getRegexGroups, regexReplace } from './functions';
export async function compileFileAsync(inFile, outFile, consts, options) {
    if (!isValidFilePath(inFile) || !isValidFilePath(outFile))
        throw new Error('SiteTree compiler: Invalid file path!');
    let root = options?.root ?? pathParse(inFile).dir + '/';
    let template = (await readFile(inFile)).toString();
    let passesLeft = options?.maxPasses ?? 3;
    while (passesLeft) {
        passesLeft--;
        let componentPaths = getRegexGroups(/(?:\<\{\s*)(.*?)(?:\s*\}\>)/g, template);
        if (componentPaths.length > 0) {
            componentPaths.forEach(path => { if (!isValidFilePath(root + path))
                throw new Error(`SiteTree compiler: Invalid file path in file (${inFile})!`); });
            let componentPromises = Promise.all(componentPaths.map(path => readFile(root + path).then(data => [path, data.toString()])));
            template = regexReplace(['<{\\s*', '\\s*}>'], template, await componentPromises);
            passesLeft = 0;
        }
        let constants = getRegexGroups(/(?:\[\{\s*)(.*?)(?:\s*\}\])/g, template).map(key => [key, consts[key]]);
        if (constants.length > 0) {
            template = regexReplace(['\\[{\\s*', '\\s*}\\]'], template, constants);
            passesLeft = 0;
        }
    }
    await writeFile(outFile, template).catch(err => {
        if (err.code === 'ENOENT')
            throw new Error('SiteTree compiler: Out file path invalid!');
        else
            throw new Error(err);
    });
}
export function compileFile(inFile, outFile, consts) {
    compileFileAsync(inFile, outFile, consts).catch(console.error);
}
export async function compileProjectAsync(projectFile = './stproject.json') {
    const project = require(projectFile);
    if (!isValidFilePath(project.root) || !isValidFilePath(project.out))
        throw new Error('SiteTree compiler: Invalid root/out path in project file!');
    await mkdir(project.out).catch(err => { if (err.code !== 'EEXIST')
        throw new Error(err); });
    for (let { path, consts } of project.files) {
        await compileFileAsync(project.root + path, project.out + path, consts, { root: project.root });
    }
}
export function compileProject(projectFile) {
    compileProjectAsync(projectFile).catch(console.error);
}

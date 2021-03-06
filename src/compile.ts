import { readFile, writeFile, mkdir } from 'fs/promises';
import { parse as pathParse, sep as pathSep, resolve as pathResolve } from 'path';

import prettify from 'html-prettify';

import { isValidFilePath, getRegexGroups, regexReplace } from './functions'

export async function compileFileAsync(inFile: string, outFile: string, consts: { [key: string]: string | number | undefined }, options?: { root?: string, maxPasses?: number, prettify?: boolean, debug?: boolean }) {
    if (options?.debug) console.log(`SiteTree compiler: Opening ${inFile}`);
    if (!isValidFilePath(inFile) || !isValidFilePath(outFile)) throw new Error('SiteTree compiler: Invalid file path!');

    let root = options?.root ?? pathParse(inFile).dir + pathSep;
    let template = (await readFile(inFile)).toString();
    if (options?.debug) console.log('SiteTree compiler: Opened file');

    let passesLeft = options?.maxPasses ?? 10;
    if (options?.debug) console.log(`SiteTree compiler: Max passes: ${passesLeft}`);
    while (passesLeft) {
        let modified = false;

        let componentPaths = getRegexGroups(/(?:\<\{\s*)(.*?)(?:\s*\}\s?\/?\>)/g, template);
        if (componentPaths.length > 0) {
            componentPaths.forEach(path => { if (!isValidFilePath(root + path)) throw new Error(`SiteTree compiler: Invalid file path in file (${inFile})!`); });
            let componentPromises = Promise.all(componentPaths.map(path => readFile(root + pathSep + path).then(data => [ path, data.toString() ] as [string, string | number | undefined])));
            template = regexReplace(['<{\\s*', '\\s*}\\s?\/?>'], template, await componentPromises);
            modified = true;
        }

        let constants = getRegexGroups(/(?:\[\{\s*)(.*?)(?:\s*\}\])/g, template).map(key => [ key, consts[key] ] as [string, string | number | undefined]);
        if (constants.length > 0) {
            template = regexReplace(['\\[{\\s*', '\\s*}\\]'], template, constants);
            modified = true;
        }

        passesLeft--;
        if (!modified) passesLeft = 0;
        if (options?.debug) console.log(`SiteTree compiler: Modified: ${modified}, Passes left: ${passesLeft}`);
    }

    if (options?.prettify && options.debug) console.log(`SiteTree compiler: Prettifying HTML`)
    if (options?.prettify) template = prettify(template);

    await writeFile(outFile, template).catch(err => {
        if (err.code === 'ENOENT') throw new Error('SiteTree compiler: Out file path invalid!');
        else throw new Error(err);
    });
    if (options?.debug) console.log(`SiteTree compiler: Written file to ${outFile}`);
}

export function compileFile(inFile: string, outFile: string, consts: { [key: string]: string | number | undefined }, options?: { root?: string, maxPasses?: number, prettify?: boolean, debug?: boolean }) {
    compileFileAsync(inFile, outFile, consts, options).catch(console.error);
}

export interface IProject {
    root: string,
    out: string,
    pages: {
        file: string,
        outFile?: string,
        consts: { [key: string]: string | number }
    }[]
}

export async function compileProjectAsync(projectFile: string = './stproject.json', options?: { prettify?: boolean, debug?: boolean }) {
    projectFile = pathResolve(projectFile);
    if (options?.debug) console.log(`SiteTree compiler: Opening project ${projectFile}`);
    const project = require(projectFile) as IProject;
    if (!isValidFilePath(project.root) || !isValidFilePath(project.out)) throw new Error('SiteTree compiler: Invalid root/out path in project file!');
    if (options?.debug) console.log('SiteTree compiler: Opened project');

    await mkdir(project.out).catch(err => { if (err.code !== 'EEXIST') throw new Error(err) });
    
    for (let {file: path, outFile: newPath, consts} of project.pages) {
        let relDir = pathParse(newPath ?? path).dir;
        await mkdir(project.out + (relDir ? pathSep + relDir : ''), { recursive: true }).catch(err => { if (err.code !== 'EEXIST') throw new Error(err) });
        await compileFileAsync(project.root + pathSep + path, project.out + pathSep + (newPath ?? path), consts, {root: project.root, prettify: options?.prettify, debug: options?.debug});
        if (options?.debug) console.log(`SiteTree compiler: Compiled ${path}`);
    }

    if (options?.debug) console.log(`SiteTree compiler: Project compiled`);
}

export function compileProject(projectFile?: string, options?: { prettify?: boolean, debug?: boolean }) {
    compileProjectAsync(projectFile, options).catch(console.error);
}
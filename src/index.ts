import { compileFileAsync, compileFile, compileProjectAsync, compileProject } from './compile';
import { evaluateAsync, evaluate } from './evaluate'

export {
    // Compiler
    compileFileAsync,
    compileFile,
    compileProjectAsync,
    compileProject,
    // - aliases
    compileProject as compile,
    compileProject as comp,
    // Evaluater
    evaluateAsync,
    evaluate,
    // - aliases
    evaluate as eval
}
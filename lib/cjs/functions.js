"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.regexReplace = exports.getRegexGroups = exports.isValidFilePath = void 0;
function isValidFilePath(path) {
    return path === (path.match(/^(\.|[a-z]:)?((\\|\/)[a-z0-9\s_@\-^!#$%&+={}\[\]]+)+(\.[a-z0-9\s_@\-^!#$%&+={}\[\]]+)?$/i) ?? [])[0];
}
exports.isValidFilePath = isValidFilePath;
function getRegexGroups(regex, string) {
    let out = [];
    let m;
    while ((m = regex.exec(string)) !== null) {
        if (m.index === regex.lastIndex)
            regex.lastIndex++;
        if (m && m[1]) {
            if (out.includes(m[1]))
                continue;
            out.push(m[1]);
        }
    }
    return out;
}
exports.getRegexGroups = getRegexGroups;
function regexReplace(regexTemplate, string, data) {
    return data.reduce((acc, [key, value]) => acc.replace(new RegExp(regexTemplate[0] + key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + regexTemplate[1]), value?.toString() ?? '_undefined_'), string);
}
exports.regexReplace = regexReplace;

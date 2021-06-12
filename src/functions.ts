export function isValidFilePath(path: string) {
    return path === (path.match(/^(\.|[a-z]:)?((\\|\/)[a-z0-9\s_@\-^!#$%&+={}\[\]]+)+(\.[a-z0-9\s_@\-^!#$%&+={}\[\]]+)?$/i) ?? [])[0];
}

export function getRegexGroups(regex: RegExp, string: string) {
    let out: string[] = [];
    let m;
    while ((m = regex.exec(string)) !== null) {
        if (m.index === regex.lastIndex) regex.lastIndex++; 
        if (m && m[1]) {
            if (out.includes(m[1])) continue;
            out.push(m[1]);
        }
    }
    return out;
}

export function regexReplace(regexTemplate: [string, string], string: string, data: [string, string | number | undefined][]) {
    return data.reduce((acc, [key, value]) => acc.replace(new RegExp(regexTemplate[0] + key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + regexTemplate[1]), value?.toString() ?? '_undefined_'), string);
}
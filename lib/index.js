"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var crossSpawn = require('cross-spawn');
var request = require('sync-request');
function envUrl(args) {
    // First Parse the args from the command line
    var parsedArgs = parseArgs(args);
    // If a .rc file was found then use that
    var env = useUrl(parsedArgs);
    // Add in the system environment variables to our environment list
    env = Object.assign({}, process.env, env);
    // Execute the command with the given environment variables
    var proc = crossSpawn.spawn(parsedArgs.command, parsedArgs.commandArgs, {
        stdio: 'inherit',
        env: env
    });
    process.on('SIGTERM', proc.kill.bind(proc, 'SIGTERM'));
    proc.on('exit', process.exit);
    return proc;
}
exports.envUrl = envUrl;
// Parses the arguments passed into the cli
function parseArgs(args) {
    if (args.length < 2) {
        throw new Error('Error! Too few arguments passed to env-url.');
    }
    var url = args[0], command = args[1], commandArgs = args.slice(2);
    return {
        url: url,
        command: command,
        commandArgs: commandArgs
    };
}
function toConstant(value) {
    return value.replace(/([A-Z])/g, function ($1) {
        return "_" + $1;
    }).toUpperCase();
}
function pathToKey(path) {
    return path.map(function (item) { return toConstant(item); }).join('_');
}
function jsonToEnv(value, path) {
    if (path === void 0) { path = []; }
    var result = {};
    if (value instanceof Array) {
        throw new Error('Arrays not supported');
    }
    else if (typeof (value) === 'string') {
        result[pathToKey(path)] = value;
    }
    else if (typeof (value) === 'number') {
        result[pathToKey(path)] = value;
    }
    else if (typeof (value) === 'boolean') {
        result[pathToKey(path)] = value;
    }
    else if (typeof (value) === 'object') {
        Object.keys(value).forEach(function (key) {
            var newPath = path.concat(key);
            result = __assign({}, result, jsonToEnv(value[key], newPath));
        });
    }
    return result;
}
// Uses the cli passed env file to get env vars
function useUrl(parsedArgs) {
    var response = request('POST', parsedArgs.url);
    var body = response.getBody('utf-8');
    var json = JSON.parse(body);
    var env = jsonToEnv(json);
    return env;
}
// Prints out some minor help text
function printHelp() {
    return "\nUsage: env-url [env_url] command [command options]\n\nA simple utility for running a cli application using an env config file.\n  ";
}
function handleUncaughtExceptions(e) {
    if (e.message.match(/passed/gi)) {
        console.log(printHelp());
    }
    console.log(e.message);
    process.exit(1);
}
process.on('uncaughtException', handleUncaughtExceptions);
//# sourceMappingURL=index.js.map
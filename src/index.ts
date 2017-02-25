const crossSpawn = require('cross-spawn');
const request = require('sync-request');

export function envUrl(args: any) {
    // First Parse the args from the command line
    const parsedArgs = parseArgs(args);

    // If a .rc file was found then use that
    let env = useUrl(parsedArgs);

    // Add in the system environment variables to our environment list
    env = Object.assign({}, process.env, env);

    // Execute the command with the given environment variables
    const proc = crossSpawn.spawn(parsedArgs.command, parsedArgs.commandArgs, {
        stdio: 'inherit',
        env
    });
    process.on('SIGTERM', proc.kill.bind(proc, 'SIGTERM'));
    proc.on('exit', process.exit);
    return proc
}

interface ParsedArgs {
    url: string,
    command: string,
    commandArgs: string[]
}

// Parses the arguments passed into the cli
function parseArgs(args: any) : ParsedArgs {
    if (args.length < 2) {
        throw new Error('Error! Too few arguments passed to env-url.')
    }
    const [url, command, ...commandArgs] = args;
    return {
        url,
        command,
        commandArgs
    }
}

function toConstant(value: string) {
    return value.replace(/([A-Z])/g, function ($1: any) {
        return "_" + $1;
    }).toUpperCase();
}

function pathToKey(path: string[]) {
    return path.map(item => toConstant(item)).join('_');
}

function jsonToEnv(value: any, path: string[] = []) : any {
    let result = {};
    if(value instanceof Array) {
        throw new Error('Arrays not supported');
    } else if (typeof(value) === 'string') {
        result[pathToKey(path)] = value;
    } else if (typeof(value) === 'number') {
        result[pathToKey(path)] = value;
    } else if (typeof(value) === 'boolean') {
        result[pathToKey(path)] = value;
    } else if (typeof(value) === 'object') {
        Object.keys(value).forEach(key => {
            const newPath = path.concat(key);
            result = {...result, ...jsonToEnv(value[key], newPath)};
        })
    }
    return result;
}

// Uses the cli passed env file to get env vars
function useUrl(parsedArgs: ParsedArgs) {
    const response = request('POST', parsedArgs.url);
    const body = response.getBody('utf-8');
    const json = JSON.parse(body);
    const env = jsonToEnv(json);
    return env
}

// Prints out some minor help text
function printHelp() {
    return `
Usage: env-url [env_url] command [command options]

A simple utility for running a cli application using an env config file.
  `
}

function handleUncaughtExceptions(e: Error) {
    if (e.message.match(/passed/gi)) {
        console.log(printHelp());
    }
    console.log(e.message);
    process.exit(1);
}

process.on('uncaughtException', handleUncaughtExceptions);

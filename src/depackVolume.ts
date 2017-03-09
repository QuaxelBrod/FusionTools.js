/**
 * depacks Volumes sorted by Librarys
 */

/**
 * TODO
 * - implement first Version
 * - check samples
 */

// parse commandline, check print help
import * as yargs from "yargs";
let argv = yargs
    .usage("Usage: $0 [options]")
    .example("$0 --src ./input --dest output -c 4", "depack volumes in input to output, counts libs starting with 4")
    .alias("s", "src")
    .alias("d", "dest")
    .alias("c", "count")
    .nargs("s", 1)
    .nargs("f", 1)
    .describe("s", "Source Volume dir")
    .describe("d", "Destination where depacked Volumes are stored")
    .describe("c", "Libs numbered. Sarting with optional number")
    .demandOption(["s", "d"])
    .help("h")
    .alias("h", "help")
    .epilog("see https://github.com/QuaxelBrod/FusionTools.js")
    .argv;


let log = console.log;
let logd = console.dir;

depackDir(argv.s, argv.d, argv.c ? true : false, argv.c);

function depackDir(srcd: string, desd: string, count: boolean = true, countstart: number = 0): void {
    log("Depack from %s to %s", srcd, desd);
    if (count) {
        log("counting Libs starting with %d", countstart);
    }

}
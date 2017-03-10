/**
 * depacks Volumes sorted by Librarys
 */

/**
 * TODO
 * - implement first Version
 * - check samples
 */
import * as fs from "fs-extra";

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
    .describe("s", "Source Volume dir (points to the Volume directory)")
    .describe("d", "Destination where depacked Volumes are stored")
    .describe("c", "Libs numbered. Sarting with optional number [default no number / default 0]")
    .demandOption(["s", "d"])
    .help("h")
    .alias("h", "help")
    .epilog("see https://github.com/QuaxelBrod/FusionTools.js")
    .argv;


let log = console.log;
let logd = console.dir;

depackDir(argv.s, argv.d, false, argv.c ? true : false, argv.c);

/**
 * processes Volumedir and depack all libs to dest dir
 * @param {string} srcd Source directory points to Volume
 * @param {string} desd Destination library root dir. Existing libs will overwritten
 * @param {boolean} count ShouldLibrarys prefixedwith numbers
 * @param {number} countstart start numbering with
 */
function depackDir(srcd: string, desd: string, copy: boolean = true, count: boolean = true, countstart: number = 0): number {
    log("Depack from %s to %s", srcd, desd);
    if (count) {
        log("counting Libs starting with %d", countstart);
    }
    // check input dir
    log("checking input dir: %s", srcd);
    if (!fs.existsSync(srcd)) {
        console.error("Source not exists...abborting");
        return 1;
    }
    // check and create dest directory
    log("checking input dir: %s", desd);
    if (!fs.existsSync(desd)) {
        log("Destination not exist... creating");
        fs.mkdirSync(desd);
    }

    let libCounter = countstart;
    // load dir list from Volumes/Programs
    let programDirs: Array<string> = fs.readdirSync(srcd + "/Programs");
    log("Found %d Programdirs", programDirs.length);
    for (let i = 0; i < programDirs.length; i++) {
        if (fs.lstatSync(srcd + "/Programs/" + programDirs[i]).isFile()) {
            continue;
        }
        log("processing Lib: %s", programDirs[i]);

        // create new libname
        let libname = (count ? pad(libCounter, 4) : "") + "_" + programDirs[i];
        libCounter++;
        // create Dirs if necessary
        if (!fs.existsSync(desd + "/" + libname)) {
            fs.mkdirSync(desd + "/" + libname);
            fs.mkdirSync(desd + "/" + libname + "/Volume");
        }
        else if (!fs.existsSync(desd + "/" + libname + "/Volume")) {
            fs.mkdirSync(desd + "/" + libname + "/Volume");
        }
        fs.mkdirSync(desd + "/" + libname + "/Volume/Programs/");
        fs.mkdirSync(desd + "/" + libname + "/Volume/Programs/" + programDirs[i]);
        let fu = fs.move;
        if (copy) {
            fu = fs.copy;
        }
        // process dirs
        fu(srcd + "/Programs/" + programDirs[i], desd + "/" + libname + "/Volume/Programs/" + programDirs[i], err => {
            if (err) {
                console.error("failed to move /Programs/" + programDirs[i]);
                console.error(err);
            }
            log("Programs/%s processed", programDirs[i]);
        });
        if (fs.existsSync(srcd + "/Mixes/" + programDirs[i])) {
            fs.mkdirSync(desd + "/" + libname + "/Volume/Mixes/");
            fs.mkdirSync(desd + "/" + libname + "/Volume/Mixes/" + programDirs[i]);
            fu(srcd + "/Mixes/" + programDirs[i], desd + "/" + libname + "/Volume/Mixes/" + programDirs[i], err => {
                if (err) {
                    console.error("failed to move /Mixes/" + programDirs[i]);
                    console.error(err);
                }
            });
            log("Mixes/%s processed", programDirs[i]);
        }
        if (fs.existsSync(srcd + "/Multisamples/" + programDirs[i])) {
            fs.mkdirSync(desd + "/" + libname + "/Volume/Multisamples/");
            fs.mkdirSync(desd + "/" + libname + "/Volume/Multisamples/" + programDirs[i]);
            fu(srcd + "/Multisamples/" + programDirs[i], desd + "/" + libname + "/Volume/Multisamples/" + programDirs[i], err => {
                if (err) {
                    console.error("failed to move /Multisamples/" + programDirs[i]);
                    console.error(err);
                }
            });
            log("Multisamples/%s processed", programDirs[i]);
        }
        if (fs.existsSync(srcd + "/Patterns/" + programDirs[i])) {
            fs.mkdirSync(desd + "/" + libname + "/Volume/Patterns/");
            fs.mkdirSync(desd + "/" + libname + "/Volume/Patterns/" + programDirs[i]);
            fu(srcd + "/Patterns/" + programDirs[i], desd + "/" + libname + "/Volume/Patterns/" + programDirs[i], err => {
                if (err) {
                    console.error("failed to move /Patterns/" + programDirs[i]);
                    console.error(err);
                }
            });
            log("Patterns/%s processed", programDirs[i]);
        }
        if (fs.existsSync(srcd + "/Samples/" + programDirs[i])) {
            fs.mkdirSync(desd + "/" + libname + "/Volume/Samples/");
            fs.mkdirSync(desd + "/" + libname + "/Volume/Samples/" + programDirs[i]);
            fu(srcd + "/Samples/" + programDirs[i], desd + "/" + libname + "/Volume/Samples/" + programDirs[i], err => {
                if (err) {
                    console.error("failed to move /Samples/" + programDirs[i]);
                    console.error(err);
                }
            });
            log("Samples/%s processed", programDirs[i]);
        }
    }
};


/**
 * adds leading 0 to number
 * @param {number} num The number to convert
 * @param {number} size Minimal length of returned String
 * @returns {string} the converted string
 */
function pad(num: number, size: number): string {
    let s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

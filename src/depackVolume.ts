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

class ProcessJob {
    src: string;
    dest: string;
    fu: (a , b, cb: (err) => void) => void;
    cb(err): void {
        if (err) {
            console.error("failed to move " + this.src);
            console.error(err);
        }
        else {
            log("%s processed", this.src);
        }
        this.finished();
    };
    finished: () => void;
    start(): void {
        this.fu(this.src, this.dest, this.cb.bind(this));
    }
}

let log = console.log;
let logd = console.dir;

let jobs: Array<ProcessJob> = new Array<ProcessJob>();

depackDir(argv.s, argv.d, false, argv.c ? true : false, argv.c);

/**
 * processes Volumedir and depack all libs to dest dir
 * @param {string} srcd Source directory points to Volume
 * @param {string} desd Destination library root dir. Existing libs will overwritten
 * @param {boolean} copy If true the source will be copied. If false the source will be moved
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


        processLib(programDirs[i], srcd, desd + "/" + libname, copy);
    }
    start();
};

function processLib(libname: string, srcd: string, destd: string, copy: boolean) {
    let fu = fs.move;
    if (copy) {
        fu = fs.copy;
    }
    // process dirs
    if (!fs.existsSync(destd + "/Volume/Programs/"))
        fs.mkdirSync(destd + "/Volume/Programs/");
    if (!fs.existsSync(destd + "/Volume/Programs/" + libname))
        fs.mkdirSync(destd + "/Volume/Programs/" + libname);
    queueJob(srcd + "/Programs/" + libname, destd + "/Volume/Programs/" + libname, fu);
    if (fs.existsSync(srcd + "/Mixes/" + libname)) {
        if (!fs.existsSync(destd + "/Volume/Mixes/"))
            fs.mkdirSync(destd + "/Volume/Mixes/");
        if (!fs.existsSync(destd + "/Volume/Mixes/" + libname))
            fs.mkdirSync(destd + "/Volume/Mixes/" + libname);
        queueJob(srcd + "/Mixes/" + libname, destd + "/Volume/Mixes/" + libname, fu);
    }
    if (fs.existsSync(srcd + "/Multisamples/" + libname)) {
        if (!fs.existsSync(destd + "/Volume/Multisamples/"))
            fs.mkdirSync(destd + "/Volume/Multisamples/");
        if (!fs.existsSync(destd + "/Volume/Multisamples/" + libname))
            fs.mkdirSync(destd + "/Volume/Multisamples/" + libname);
        queueJob(srcd + "/Multisamples/" + libname, destd + "/Volume/Multisamples/" + libname, fu);
    }
    if (fs.existsSync(srcd + "/Patterns/" + libname)) {
        if (!fs.existsSync(destd + "/Volume/Patterns/"))
            fs.mkdirSync(destd + "/Volume/Patterns/");
        if (!fs.existsSync(destd + "/Volume/Patterns/" + libname))
            fs.mkdirSync(destd + "/Volume/Patterns/" + libname);
        queueJob(srcd + "/Patterns/" + libname, destd  + "/Volume/Patterns/" + libname, fu);
    }
    if (fs.existsSync(srcd + "/Samples/" + libname)) {
        if (!fs.existsSync(destd + "/Volume/Samples/"))
            fs.mkdirSync(destd + "/Volume/Samples/");
        if (!fs.existsSync(destd + "/Volume/Samples/" + libname))
            fs.mkdirSync(destd + "/Volume/Samples/" + libname);
        queueJob(srcd + "/Samples/" + libname, destd + "/Volume/Samples/" + libname, fu);
    }
}

function queueJob(src: string, dest: string, fu: (a , b, cb: (err) => void) => void): void {
    let job: ProcessJob = new ProcessJob();
    job.src = src;
    job.dest = dest;
    job.fu = fu;
    jobs.push(job);
}

function start() {
    let job: ProcessJob = jobs.shift();
    if (job) {
        job.finished = start;
        process.nextTick(job.start.bind(job));
    }
    else {
        log("++++++++++++++++");
        log("**  FINISHED  **");
        log("++++++++++++++++");
    }
}

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

import fs from 'fs';
import { homedir } from 'os';
import path from 'path';
import { execSync, execFileSync } from 'child_process';
import { ChromeChannel } from './types.js';

const newLineRegex = /\r?\n/;

function canAccess(file: string) {
  if (!file) return false;

  try {
    fs.accessSync(file);
    return true;
  } catch {
    return false;
  }
}

function findChromeExecutables(folder: string) {
  const argumentsRegex = /(^[^ ]+).*/; // Take everything up to the first space
  const chromeExecRegex = '^Exec=/.*/(google-chrome|chrome|chromium)-.*';

  const installations: string[] = [];
  if (canAccess(folder)) {
    // Output of the grep & print looks like:
    //    /opt/google/chrome/google-chrome --profile-directory
    //    /home/user/Downloads/chrome-linux/chrome-wrapper %U
    let execPaths;

    // Some systems do not support grep -R so fallback to -r.
    // See https://github.com/GoogleChrome/chrome-launcher/issues/46 for more context.
    try {
      execPaths = execSync(`grep -ER "${chromeExecRegex}" ${folder} | awk -F '=' '{print $2}'`);
    } catch {
      execPaths = execSync(`grep -Er "${chromeExecRegex}" ${folder} | awk -F '=' '{print $2}'`);
    }

    execPaths = execPaths
      .toString()
      .split(newLineRegex)
      .map(execPath => execPath.replace(argumentsRegex, '$1'));

    execPaths.forEach(execPath => canAccess(execPath) && installations.push(execPath));
  }

  return installations;
}

function sort(installations: string[], priorities: { regex: RegExp; weight: number }[]) {
  const defaultPriority = 10;
  return (
    installations
      // assign priorities
      .map(inst => {
        for (const pair of priorities) {
          if (pair.regex.test(inst)) return { path: inst, weight: pair.weight };
        }
        return { path: inst, weight: defaultPriority };
      })
      // sort based on priorities
      .sort((a, b) => b.weight - a.weight)
      // remove priority flag
      .map(pair => pair.path)
  );
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

async function localPuppeteer() {
  try {
    const { default: p } = await import('puppeteer');
    return p.executablePath() as string;
  } catch {
    return;
  }
}

function darwin(canary = false): string | undefined {
  const LSREGISTER =
    '/System/Library/Frameworks/CoreServices.framework' +
    '/Versions/A/Frameworks/LaunchServices.framework' +
    '/Versions/A/Support/lsregister';
  const grepexpr = canary ? 'google chrome canary' : 'google chrome';
  // eslint-disable-next-line no-useless-escape
  const result = execSync(`${LSREGISTER} -dump  | grep -i \'${grepexpr}\\?.app$\' | awk \'{$1=""; print $0}\'`);

  const paths = result
    .toString()
    .split(newLineRegex)
    .filter(a => a)
    .map(a => a.trim());
  paths.unshift(canary ? '/Applications/Google Chrome Canary.app' : '/Applications/Google Chrome.app');
  for (const p of paths) {
    if (p.startsWith('/Volumes')) continue;
    const inst = path.join(p, canary ? '/Contents/MacOS/Google Chrome Canary' : '/Contents/MacOS/Google Chrome');
    if (canAccess(inst)) return inst;
  }
  return undefined;
}

/**
 * Look for linux executables in 3 ways
 * 1. Look into CHROME_PATH env variable
 * 2. Look into the directories where .desktop are saved on gnome based distro's
 * 3. Look for google-chrome-stable & google-chrome executables by using the which command
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function linux(_canary = false) {
  let installations: string[] = [];

  // Look into the directories where .desktop are saved on gnome based distro's
  const desktopInstallationFolders = [
    path.join(homedir(), '.local/share/applications/'),
    '/usr/share/applications/',
  ];
  desktopInstallationFolders.forEach(folder => {
    installations = installations.concat(findChromeExecutables(folder));
  });

  // Look for google-chrome(-stable) & chromium(-browser) executables by using the which command
  const executables = ['google-chrome-stable', 'google-chrome', 'chromium-browser', 'chromium'];
  executables.forEach(executable => {
    try {
      const chromePath = execFileSync('which', [executable], { stdio: 'pipe' }).toString().split(newLineRegex)[0];
      if (canAccess(chromePath)) installations.push(chromePath);
    } catch {
      // nothing to do
    }
  });

  if (!installations.length)
    throw new Error(
      'The environment variable CHROME_PATH must be set to executable of a build of Chromium version 54.0 or later.',
    );

  const priorities = [
    { regex: /chrome-wrapper$/, weight: 51 },
    { regex: /google-chrome-stable$/, weight: 50 },
    { regex: /google-chrome$/, weight: 49 },
    { regex: /chromium-browser$/, weight: 48 },
    { regex: /chromium$/, weight: 47 },
  ];

  if (process.env.CHROME_PATH) priorities.unshift({ regex: new RegExp(`${process.env.CHROME_PATH}`), weight: 101 });

  return sort(uniq(installations.filter(Boolean)), priorities)[0];
}

function win32(canary = false) {
  const suffix = canary
    ? `${path.sep}Google${path.sep}Chrome SxS${path.sep}Application${path.sep}chrome.exe`
    : `${path.sep}Google${path.sep}Chrome${path.sep}Application${path.sep}chrome.exe`;
  const prefixes = [process.env.LOCALAPPDATA, process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)']].filter(
    Boolean,
  );

  let result;
  prefixes.forEach(prefix => {
    const chromePath = path.join(prefix!, suffix);
    if (canAccess(chromePath)) result = chromePath;
  });
  return result;
}

export type FindOptions = {
  executablePath?: string;
  channel?: ChromeChannel;
};

export async function findChrome(options: FindOptions) {
  if (options.executablePath) return { executablePath: options.executablePath, type: 'user' };

  const config = new Set<ChromeChannel>(options.channel ? [options.channel] : ['*']);

  let executablePath: string | undefined = undefined;
  if (config.has('puppeteer') || config.has('*')) {
    executablePath = await localPuppeteer();
    if (executablePath) return { executablePath, type: 'puppeteer' };
  }

  if (config.has('canary') || config.has('*')) {
    if (process.platform === 'linux') executablePath = linux(true);
    else if (process.platform === 'win32') executablePath = win32(true);
    else if (process.platform === 'darwin') executablePath = darwin(true);
    if (executablePath) return { executablePath, type: 'canary' };
  }

  // Then pick stable.
  if (config.has('stable') || config.has('*')) {
    if (process.platform === 'linux') executablePath = linux();
    else if (process.platform === 'win32') executablePath = win32();
    else if (process.platform === 'darwin') executablePath = darwin();
    if (executablePath) return { executablePath, type: 'stable' };
  }

  return { executablePath: null, type: null };
}

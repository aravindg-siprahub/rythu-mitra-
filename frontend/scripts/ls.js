#!/usr/bin/env node
"use strict";

const fs = require('fs');
const pathModule = require('path');

async function main() {
  const args = process.argv.slice(2);
  let showAll = false;
  let longList = false;
  let dir = process.cwd();

  // parse options
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('-') && arg.length > 1) {
      // handle combined short options like -al
      for (let j = 1; j < arg.length; j++) {
        const ch = arg[j];
        if (ch === 'a') showAll = true;
        else if (ch === 'l') longList = true;
        else if (ch === 'h') { printUsage(); return; }
        else {
          console.error(`ls: unknown option '-${ch}'`);
          printUsage();
          process.exit(1);
        }
      }
    } else if (arg === '-a') {
      showAll = true;
    } else if (arg === '-l') {
      longList = true;
    } else if (arg === '-h' || arg === '--help') {
      printUsage();
      return;
    } else if (arg.startsWith('-')) {
      console.error(`ls: unknown option '${arg}'`);
      printUsage();
      process.exit(1);
    } else {
      dir = arg;
    }
  }

  // Resolve directory
  let stats;
  try {
    stats = await fs.promises.stat(dir);
  } catch (err) {
    console.error(`ls: cannot access '${dir}': No such file or directory`);
    process.exit(1);
  }
  if (!stats.isDirectory()) {
    console.error(`ls: '${dir}' is not a directory`);
    process.exit(1);
  }

  // Read directory entries
  let entries;
  try {
    entries = await fs.promises.readdir(dir, { withFileTypes: true });
  } catch (err) {
    console.error(`ls: failed to read directory '${dir}': ${err.message}`);
    process.exit(1);
  }

  // Filter based on -a, and prepare items with metadata for -l
  const visible = entries.filter((d) => showAll || !d.name.startsWith('.'));
  const items = await Promise.all(
    visible.map(async (dirent) => {
      const full = pathModule.resolve(dir, dirent.name);
      // fetch stats for long format
      let stat = null;
      try {
        stat = await fs.promises.stat(full);
      } catch {
        // ignore stats if cannot stat
      }
      const isDir = dirent.isDirectory();
      return {
        name: dirent.name + (isDir ? '/' : ''),
        full,
        stat,
        isDir
      };
    })
  );

  if (longList) {
    const lines = items.map((it) => {
      const mode = it.stat ? it.stat.mode : 0;
      const perms = modeToString(mode, it.isDir);
      const size = it.stat ? it.stat.size : 0;
      const mtime = it.stat ? new Date(it.stat.mtimeMs) : new Date();
      const date = mtime.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
      return `${perms} ${size.toString().padStart(8, ' ')} ${date} ${it.name}`;
    });
    console.log(lines.join('\n'));
  } else {
    const names = items.map((i) => i.name);
    // Simple layout: print in a single line separated by two spaces
    console.log(names.join('  '));
  }
}

function modeToString(mode, isDir) {
  // Simple unix-like permissions string
  const type = isDir ? 'd' : '-';
  const perms = [
    (mode & 0o400) ? 'r' : '-',
    (mode & 0o200) ? 'w' : '-',
    (mode & 0o100) ? 'x' : '-',
    (mode & 0o040) ? 'r' : '-',
    (mode & 0o020) ? 'w' : '-',
    (mode & 0o010) ? 'x' : '-',
    (mode & 0o004) ? 'r' : '-',
    (mode & 0o002) ? 'w' : '-',
    (mode & 0o001) ? 'x' : '-',
  ];
  return type + perms.join('');
}

function printUsage() {
  console.log(`Usage: node frontend/scripts/ls.js [-a] [-l] [path]
Options:
  -a include hidden files
  -l long listing format
  path directory to list (default: current directory)
Examples:
  node frontend/scripts/ls.js
  node frontend/scripts/ls.js -a
  node frontend/scripts/ls.js -l /tmp`);
}

main().catch((err) => {
  console.error('ls error:', err.message);
  process.exit(1);
});

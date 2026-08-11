#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const home = os.homedir();
const roots = [
  {
    id: 'pi-config',
    label: '~/.pi/agent/skills',
    dir: path.join(home, '.pi', 'agent', 'skills'),
    editable: true,
  },
  {
    id: 'agents',
    label: '~/.agents/skills',
    dir: path.join(home, '.agents', 'skills'),
    editable: true,
  },
  {
    id: 'pi-git-packages',
    label: '~/.pi/agent/git',
    dir: path.join(home, '.pi', 'agent', 'git'),
    editable: false,
  },
];

const ignoredDirs = new Set(['.git', 'node_modules', 'dist', 'build']);
const args = new Set(process.argv.slice(2));
const asJson = args.has('--json');

function exists(dir) {
  try {
    fs.accessSync(dir);
    return true;
  } catch {
    return false;
  }
}

function walk(dir, files = []) {
  if (!exists(dir)) return files;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) walk(fullPath, files);
      continue;
    }

    if (entry.isFile() && entry.name === 'SKILL.md') files.push(fullPath);
  }

  return files;
}

function readSkillName(file) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const match = content.match(/^name:\s*['"]?([^'"\r\n]+)['"]?\s*$/m);
    return match?.[1]?.trim() || path.basename(path.dirname(file));
  } catch {
    return path.basename(path.dirname(file));
  }
}

const skills = [];

for (const root of roots) {
  for (const file of walk(root.dir)) {
    skills.push({
      name: readSkillName(file),
      source: root.id,
      sourceLabel: root.label,
      editable: root.editable,
      file,
      dir: path.dirname(file),
    });
  }
}

const byName = new Map();
for (const skill of skills) {
  if (!byName.has(skill.name)) byName.set(skill.name, []);
  byName.get(skill.name).push(skill);
}

const collisions = [...byName.entries()]
  .map(([name, entries]) => ({ name, entries }))
  .filter(({ entries }) => entries.length > 1)
  .sort((a, b) => a.name.localeCompare(b.name));

const editableSkills = skills.filter((skill) => skill.editable);
const packageSkills = skills.filter((skill) => !skill.editable);

const report = {
  roots: roots.map(({ id, label, dir, editable }) => ({
    id,
    label,
    dir,
    editable,
    exists: exists(dir),
  })),
  summary: {
    totalSkills: skills.length,
    uniqueNames: byName.size,
    editableSkills: editableSkills.length,
    packageSkills: packageSkills.length,
    collisions: collisions.length,
  },
  collisions,
};

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log('Pi skill source audit');
  console.log('=====================');
  console.log(`Editable skills: ${report.summary.editableSkills}`);
  console.log(`Git package skills: ${report.summary.packageSkills}`);
  console.log(`Unique skill names: ${report.summary.uniqueNames}`);
  console.log(`Name collisions: ${report.summary.collisions}`);

  if (collisions.length > 0) {
    console.log('\nColliding skills:');
    for (const { name, entries } of collisions) {
      console.log(`\n- ${name}`);
      for (const entry of entries) {
        console.log(`  - [${entry.sourceLabel}] ${entry.dir}`);
      }
    }
    console.log('\nPolicy: keep each skill in exactly one source. Do not copy package skills into editable skill directories.');
  } else {
    console.log('\nOK: every skill name has exactly one source.');
  }
}

process.exitCode = collisions.length > 0 ? 1 : 0;

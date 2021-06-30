import { ProjectFile } from '../modules/project-file';

// Don't store values that are `false`
const noFalse = ({ value }) => value !== false;

export const dials = new ProjectFile('lo-rez/dials.jsonl');

export const drafts = new ProjectFile('lo-rez/drafts.jsonl', noFalse);

export const ignorance = new ProjectFile('lo-rez/ignorance.jsonl', noFalse);

export const models = new ProjectFile('lo-rez/models.jsonl');

export const palettes = new ProjectFile('lo-rez/palettes.jsonl');

export const shaders = new ProjectFile('lo-rez/shaders.jsonl');

export const textures = new ProjectFile('lo-rez/textures.jsonl');

export const versions = new ProjectFile('lo-rez/versions.jsonl');

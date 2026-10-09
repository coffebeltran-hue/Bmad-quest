import {defineConfig} from 'vite';

// Vercel serves this repo from the domain root; GitHub Pages uses /Bmad-quest/.
declare const process: {env:Record<string,string|undefined>};
export default defineConfig({
 base:process.env.VERCEL?'/':'/Bmad-quest/'
});

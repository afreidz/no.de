import { join } from "path";
import { createRequire } from "module";
import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocess({
    scss: {
      importer(file, _, done) {
        if (file.startsWith("$lib/")) {
          file = file.replace("$lib", "lib");
          file = join("src", file);
          done({ file });
          return;
        } else {
          const require = createRequire(import.meta.url);
          try {
            file = require.resolve(file);
          } catch {
            return null;
          }
          done({ file });
        }
      }
    }
  }),
	kit: {
    vite: { ssr: { external: ['@no.de/ipc'] } },
		adapter: adapter(),
		target: '#app'
	}
};

export default config;

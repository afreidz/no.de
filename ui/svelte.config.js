import { join } from "path";
import { createRequire } from "module";
import sveltePreprocess from 'svelte-preprocess';

const config = {
  preprocess: sveltePreprocess({
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
    target: '#app',
    ssr: false,
    vite: {
      optimizeDeps: { include: ['ini', 'fuse.js'] },
    }
  }
};

export default config;

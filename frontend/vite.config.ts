// import { defineConfig } from 'vite'
// import { svelte } from '@sveltejs/vite-plugin-svelte'

// // https://vite.dev/config/
// export default defineConfig(({ mode }) => ({
//   plugins: [svelte()],
//   server: mode === 'development' ? {
//     proxy: {
//       '/api': {
//         target: 'http://backend:8000',
//         changeOrigin: true,
//         secure: false,
//         configure: (proxy, options) => {
//           proxy.on('proxyReq', (proxyReq, req, res) => {
//             console.log('Proxying request:', req.url)
//           })
//         }
//       },
//     },
//        watch: {
//       usePolling: true,  // Important for Docker environments
//     },
//     hmr: {
//       host: '0.0.0.0',
//       port: 5173,
//       protocol: 'ws',
//     },
//   } : undefined,
// }))
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		/* ... */
    svelte()
	],
	test: {
		// If you are testing components client-side, you need to setup a DOM environment.
		// If not all your files should have this environment, you can use a
		// `// @vitest-environment jsdom` comment at the top of the test files instead.
		environment: 'jsdom'
	},
	// Tell Vitest to use the `browser` entry points in `package.json` files, even though it's running in Node
	resolve: process.env.VITEST
		? {
				conditions: ['browser']
			}
		: undefined
});
import {defineConfig} from "@rsbuild/core"
import {pluginReact} from "@rsbuild/plugin-react"

export default defineConfig({
    plugins: [pluginReact()],
    dev: {
        hmr: true,
        writeToDisk: true
    },
    html: {
        template: "./ui.html"
    },
    source: {
        entry: {
            index: "./ui.tsx"
        }
    },
    output: {
        target: "web",
        filename: {html: "ui.html"},
        inlineScripts: true,
        inlineStyles: true,
        filenameHash: false,
        legalComments: "none"
    }
})
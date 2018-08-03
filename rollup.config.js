import typescript from "rollup-plugin-typescript2";

export default {
    input: "src/index.ts",
    output: {
        file: "files/index.js",
        format: "cjs",
    },
    plugins: [
        typescript(),
    ]
};

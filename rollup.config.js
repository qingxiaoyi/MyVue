// rollup默认可以导出一个对象，作为打包的配置文件
const babel = require('rollup-plugin-babel');
module.exports = {
    input: './src/index.js',// 入口
    output: {
        file: './dist/vue.js',// 出口
        name: 'Vue',// 全局变量名
        format: 'umd',// 打包格式 esm es6模块 commonjs life自执行函数 umd（commonjs和amd）透明模块规范
        sourcemap: true// 希望可以调试源代码
    },
    plugins: [
        babel({// 不论什么插件都是执行一个函数
            //可以在这里加配置，也可以配置一个rc文件
            exclude: 'node_modules/**'// 不要打包node_modules所有文件
        })
    ]
}
var path = require("path")
var webpack = require("webpack")
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
var ChunkManifestPlugin = require("chunk-manifest-webpack-plugin")
var WebpackChunkHash = require("webpack-chunk-hash")
var CleanWebpackPlugin = require("clean-webpack-plugin")
var CompressionPlugin = require("compression-webpack-plugin")
let FaviconsWebpackPlugin = require("favicons-webpack-plugin")
let DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin")

module.exports = {
    entry: "./src/index.jsx",
    output: {
        path: path.join(__dirname, "dist"),
        publicPath: "/",
        filename: "[name].[chunkhash].js",
        chunkFilename: "[name].[chunkhash].js"
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loaders: ["babel-loader"],
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: [{
                        loader:"css-loader",
                        options:{
                            "minimize":true
                        }
                    },"postcss-loader"]
                })
            },
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "url-loader?limit=10000&mimetype=application/font-woff"
            },
            {
                test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: "file-loader"
            },
            {
                test: /\.(jpg|jpeg|png|gif)/,
                loader: "file-loader"
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV||"production"),  //"developmentSSL" when deploying to a local docker build
                BRANCH: JSON.stringify(process.env.BRANCH||"STAGE")
            }
        }),
        //new CleanWebpackPlugin(["dist/*.*"]),   // Activate this, when you need to make shure, that the build is clean
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /(de|en)/),
        new webpack.optimize.CommonsChunkPlugin({
            name: ["vendor", "manifest"],
            minChunks: function (module) {
                return module.context && module.context.indexOf("node_modules") !== -1
            }
        }),
        new webpack.HashedModuleIdsPlugin(),
        new WebpackChunkHash(),
        new ChunkManifestPlugin({
            filename: "chunk-manifest.json",
            manifestVariable: "webpackManifest",
            inlineManifest: true
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                drop_console: true,
                drop_debugger: true,
                screw_ie8: true
                //side_effects: true
            },
            output: {
                comments: false
            },
            //sourceMap: true,
            beautify: false
        }),
        new ExtractTextPlugin({
            filename:"[name].[chunkhash].css"
        }),
        new CompressionPlugin({
            asset: "[path].gz[query]",
            algorithm: "gzip",
            test: /\.(js|html|css)$/,
            threshold: 10240,
            minRatio: 0.8
        }),
        new FaviconsWebpackPlugin({
            logo: "./assets/favicon.png",
            persistentCache: true,
            inject: true,
            background: "#fff",
            title: "MyApp"
        }),
        new HtmlWebpackPlugin({
            filename: "index.html",
            template: __dirname + "/index.ejs"
        }),
        new DuplicatePackageCheckerPlugin()
    ]
}

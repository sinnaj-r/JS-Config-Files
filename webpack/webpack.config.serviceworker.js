var path = require("path")
var webpack = require("webpack")
const ExtractTextPlugin = require("extract-text-webpack-plugin")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const ChunkManifestPlugin = require("chunk-manifest-webpack-plugin")
const WebpackChunkHash = require("webpack-chunk-hash")
const CleanWebpackPlugin = require("clean-webpack-plugin")
const SWPrecacheWebpackPlugin = require("sw-precache-webpack-plugin")
const WebpackPwaManifest = require("webpack-pwa-manifest")
const CompressionPlugin = require("compression-webpack-plugin")
const FaviconsWebpackPlugin = require("favicons-webpack-plugin")
const PUBLIC_PATH = "https://public.path/"

module.exports = {
    entry: "./src/index.jsx",
    output: {
        path: path.join(__dirname, "dist"),
        publicPath: "/",
        filename: "[name].[chunkhash].js",
        chunkFilename: "[name].[chunkhash].js"
    },
    resolve: {
        alias: {
            react: "preact-compat",
            "react-dom": "preact-compat"
        }
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
                    use: [
                        {
                            loader: "css-loader",
                            options: {
                                minimize: true
                            }
                        },
                        "postcss-loader"
                    ]
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
                NODE_ENV: JSON.stringify(process.env.NODE_ENV || "production"), //"developmentSSL" when deploying to a local docker build
                BRANCH: JSON.stringify(process.env.BRANCH || "STAGE")
            }
        }),
        new CleanWebpackPlugin(["dist/*.*"]), //This makes the build process A LOT longer, but is required to ensure a completly fresh build
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /(de|en)/),
        // new webpack.optimize.CommonsChunkPlugin({
        //     name: ["vendor", "manifest"], // vendor libs + extracted manifest
        //     minChunks: function (module) {
        //         return module.context && module.context.indexOf("node_modules") !== -1
        //     }
        // }),
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
            filename: "[name].[chunkhash].css"
        }),
        new SWPrecacheWebpackPlugin({
            cacheId: "de.minenis.yamaha_remote",
            dontCacheBustUrlsMatching: /\.\w{8}\./,
            filename: "service-worker.js",
            minify: true,
            navigateFallback: PUBLIC_PATH + "index.html",
            staticFileGlobsIgnorePatterns: [/\.map$/, /manifest\.json$/]
        }),
        new WebpackPwaManifest({
            name: "Application Name",
            short_name: "Application",
            description: "Application Description",
            background_color: "#",
            theme_color: "#C0FFEE",
            "theme-color": "#C0FFEE",
            start_url: "/",
            inject: true,
            icons: [
                {
                    src: path.resolve("assets/logo.png"),
                    sizes: [96, 128, 192, 256, 384, 512, 1024],
                    destination: path.join("assets", "icons")
                }
            ],
            ios: {
                "apple-mobile-web-app-title": "ApplicationName",
                "apple-mobile-web-app-status-bar-style": "black"
            }
        }),
        new CompressionPlugin({
            asset: "[path].gz[query]",
            algorithm: "gzip",
            test: /\.(js|html|css)$/,
            threshold: 10240,
            minRatio: 0.8
        }),
        new FaviconsWebpackPlugin({
            logo: "./assets/logo.png",
            persistentCache: true,
            inject: true,
            background: "#FF6F21",
            title: "Application Name"
        }),
        new HtmlWebpackPlugin({
            filename: "index.html",
            template: __dirname + "/index.ejs"
        })
    ]
}

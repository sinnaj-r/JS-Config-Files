var path = require("path")
var webpack = require("webpack")

module.exports = {
    devtool: "sourcemaps",
    entry: [
        "webpack-dev-server/client?http://localhost:3000", "./src/index.jsx"
    ],
    devServer: {
        historyApiFallback: true
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "bundle.js",
        publicPath: "/public/"
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loaders: ["babel-loader"],
                include: path.join(__dirname, "src")
            },
            {
                test: /\.css$/,
                loaders: [ "style-loader", "css-loader?url=false", "postcss-loader"]
            },
            {
                test: /\.(jpg|jpeg|png|gif)/,
                loader: "file-loader"
            }
        ]
    },
    plugins:[
        new webpack.LoaderOptionsPlugin({
            minimize: false,
            debug: true
        }),
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("development"),
                BRANCH:JSON.stringify("development")
            }
        })
    ]
}

import _ from 'lodash';
import Path from 'path';
import Webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

export default function (basePath, app, babelIncludePaths) {
    const production = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging';

    const BROWSER_CODE_PATH = Path.join(basePath, 'browser');
    const SRC_CODE_PATH = Path.join(basePath, 'src');

    const NODE_MODULES_PATH = Path.join(basePath, 'node_modules');

    const COMMON_LOADERS = [
        {
            test: /jquery\.min\.js$/,
            loader: 'expose?jQuery!exports?jquery=window.jQuery&$=window.jQuery'
        },
        {
            test: /\.(png)$/,
            loader: 'file-loader'
        },
        {
            test: /\.jpe?g$|\.gif$|\.wav$|\.mp3$|\.cur$/,
            loader: 'file-loader'
        },
        {
            test: /\.(woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            loader: 'file-loader'
        },
        {
            test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
            loader: 'file-loader'
        }
    ];

    //if (!production) {
    //    COMMON_LOADERS.push({
    //        test: /\.jsx?$/,
    //        loader: 'babel-loader',
    //        //loaders: ['react-hot', 'babel'],
    //        query: {
    //            cacheDirectory: true,
    //            presets: ['es2015', 'react']
    //        },
    //        include: [SRC_PATH, Path.join(NODE_MODULES_PATH, 'qs')]
    //    });
    //} else {

    if (babelIncludePaths && !_.isArray(babelIncludePaths)) {
        babelIncludePaths = [babelIncludePaths];
    }

    COMMON_LOADERS.push({
        test: /\.jsx?$/,
        loader: 'babel',
        query: {
            cacheDirectory: true,
            presets: ['es2015', 'react'],
            plugins: ['transform-runtime']
        },
        include: _.union([
            BROWSER_CODE_PATH,
            SRC_CODE_PATH,
            Path.join(NODE_MODULES_PATH, 'qs'),
            Path.join(NODE_MODULES_PATH, 'reactjs-web-boilerplate/browser')
        ], babelIncludePaths || [])
    });

    //}

    const RESOLVE_ROOT = [BROWSER_CODE_PATH, SRC_CODE_PATH, NODE_MODULES_PATH];

    const EXTENSIONS = [
        '',
        '.jsx',
        '.es6',
        '.js',
        '.json',
        '.coffee',
        '.html',
        '.jade',
        '.css',
        '.styl',
        '.scss',
        '.sass',
        '.less'
    ];

    const PUBLIC_RESOURCES_WEB_PATH = '/resources/';
    const CSS_RESOURCES_WEB_PATH = '';

    const PUBLIC_DIST_PATH = Path.join(basePath, '__public__');

    //var hotMiddlewareScript = 'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true';
    return {
        name: 'browser',
        entry: {app: [app, 'babel-polyfill']}, //production ? 'browser/browser.jsx' : ['browser/browser.jsx', hotMiddlewareScript]
        output: {
            path: PUBLIC_DIST_PATH,
            filename: '[name].js',
            chunkFilename: '[id].[name].js',
            publicPath: PUBLIC_RESOURCES_WEB_PATH
        },
        devtool: '#source-map', // do it conditionally
        module: {
            //preLoaders: [
            //    {
            //        test: /\.jsx?$/,
            //        loader: 'eslint-loader'
            //    }
            //],

            loaders: COMMON_LOADERS.concat(
              {
                  test: /\.sass$/,
                  loader: ExtractTextPlugin.extract('style-loader', 'css-loader!sass-loader', {publicPath: CSS_RESOURCES_WEB_PATH})
              },
              {
                  test: /\.scss$/,
                  loader: ExtractTextPlugin.extract('style-loader', 'css-loader!sass-loader', {publicPath: CSS_RESOURCES_WEB_PATH})
              },
              {
                  test: /\.css$/,
                  loader: ExtractTextPlugin.extract('style-loader', 'css-loader', {publicPath: CSS_RESOURCES_WEB_PATH})
              }
            ),
            noParse: /\.min\.js/
        },
        eslint: {
            quiet: true,
            emitError: true
        },
        resolve: {
            root: RESOLVE_ROOT,
            alias: {},
            extensions: EXTENSIONS
        },
        plugins: [
            new Webpack.NamedModulesPlugin(),
            new ExtractTextPlugin('style.css', {allChunks: true}),
            new Webpack.optimize.OccurenceOrderPlugin(),
            new Webpack.ProvidePlugin({$: 'jquery', jQuery: 'jquery', jquery: 'jquery'})
        ].concat(production ? [
            new Webpack.optimize.DedupePlugin()

            //new Webpack.optimize.UglifyJsPlugin({
            //    warnings: true,
            //    mangle: true,
            //    stats: true,
            //    compress: {sequences: true, unused: true, dead_code: true, if_return: true}
            //})
        ] : [
            // development
            //new Webpack.HotModuleReplacementPlugin(),

            new Webpack.NoErrorsPlugin()
        ])
    };
}
const webpack = require('webpack')
const path = require('path')
const glob = require('glob');
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const cert = {
  crt: './ddev.crt',
  key: './ddev.key',
}

// Glob
function DirectoryObject(files) {
  const names = {};
  let name = '';

  files.forEach(function(file) {
    // you can define entry names mapped to [name] here
    name = file.split('/').slice(-1)[0];
    name = name.substring(4);
    name = name.substring(0, name.length - 3);
    name = name.toLowerCase();
    names[name] = file;
  });

  names['index'] = path.resolve(__dirname, './src/js/index.js');

  return names;
}

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production'
  const contextPath = path.resolve(__dirname, './src')
  const proxy = 'https://mpu-sokopp.ddev.site/' /* REPLACE URL */

  const ASSET_SIZE_URL_LIMIT = 5 * 1024 // 5kb

  const options = {
    context: contextPath,
    mode: argv.mode || 'development',
    entry: DirectoryObject(glob.sync(path.resolve(__dirname, './src/js/*.js'))),
    output: {
      filename: 'js/[name].min.js',
      path: path.resolve(__dirname, './dist/'),
    },
    module: {
      rules: [
        // JavaScript
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: ['@babel/plugin-transform-runtime'],
            },
          },
        },
        // Fonts
        {
          test: /\.(woff(2)?|eot|svg|ttf|otf)(\?v=\d+\.\d+\.\d+)?$/,
          include: [`${contextPath}/fonts`],
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[hash][ext][query]',
          },
        },
        // Styles
        {
          test: /\.(scss|css)$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: { publicPath: '../' },
            },
            'css-loader',
            'postcss-loader',
            'sass-loader',
          ],
          sideEffects: true,
        },
        // Images + Icons
        {
          test: /\.(png|svg|jpe?g|jpg|gif)$/i,
          include: [`${contextPath}/assets`],
          type: 'asset',
          generator: {
            filename: 'assets/[name][ext]',
          },
          parser: {
            dataUrlCondition: {
              maxSize: ASSET_SIZE_URL_LIMIT,
            },
          },
        },
        {
          test: /\.mdx$/,
          use: ['babel-loader', '@mdx-js/loader'],
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.css', '.scss'],
      alias: {
        'src': path.resolve(__dirname, `${contextPath}`),
        '@': path.resolve(__dirname, `${contextPath}/scss`),
      },
    },
    optimization: { minimize: isProduction },
    plugins: [
      new MiniCssExtractPlugin({
        filename: ({ chunk }) => {
          return 'css/[name].min.css'
        },
      }),
      new CleanWebpackPlugin(),
      new ProgressBarPlugin(),
    ],
    watch: !isProduction,
    watchOptions: { poll: 1000, ignored: ['node_modules/**'] },
    performance: { hints: false },
    stats: 'errors-warnings',
  }

  if (!isProduction && env.enableLiveReload) {
    if (!fs.existsSync(cert.key) || !fs.existsSync(cert.crt)) {
      console.error('=============== Certificates missing ================')
      console.error('Please copy key and certificate to lin_core root')
      console.error(
        `docker cp ddev-io-group-website-web:/etc/ssl/certs/master.crt ${process.cwd()}/${
          cert.crt
        }`
      )
      console.error(
        `docker cp ddev-io-group-website-web:/etc/ssl/certs/master.key ${process.cwd()}/${
          cert.key
        }`
      )
      console.error('=====================================================')
      return false
    }
    options.plugins.push(
      new BrowserSyncPlugin({
        proxy,
        https: {
          key: cert.key,
          cert: cert.crt,
        },
      })
    )
    options.devtool = 'source-map'
  }

  return options
}

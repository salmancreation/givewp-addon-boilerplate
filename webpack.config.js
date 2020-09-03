const path = require( 'path' );
const CopyWebpackPlugin = require( 'copy-webpack-plugin' );
const MiniCSSExtractPlugin = require( 'mini-css-extract-plugin' );
const BrowserSyncPlugin = require( 'browser-sync-webpack-plugin' );
const ImageminPlugin = require( 'imagemin-webpack-plugin' ).default;
const { CleanWebpackPlugin } = require( 'clean-webpack-plugin' );
const WebpackRTLPlugin = require( 'webpack-rtl-plugin' );
const wpPot = require( 'wp-pot' );

const inProduction = ( 'production' === process.env.NODE_ENV );
const mode = inProduction ? 'production' : 'development';

// Webpack config.
const config = {
	mode,

	entry: {
		'give-addon-admin': [
			'./assets/src/js/admin/give-addon-admin.js',
			'./assets/src/css/admin/give-addon-admin.scss',
		],
		'give-addon': [
			'./assets/src/js/frontend/give-addon.js',
			'./assets/src/css/frontend/give-addon-frontend.scss',
		],
	},

	// Tell webpack where to output.
	output: {
		path: path.join( __dirname, './assets/dist/' ),
		filename: 'js/[name].js',
	},

	// Ensure modules like magnific know jQuery is external (loaded via WP).
	externals: {
		$: 'jQuery',
		jquery: 'jQuery',
	},

	devtool: ! inProduction ? 'source-map' : '',

	module: {
		rules: [

			// Use Babel to compile JS.
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loaders: [
					'babel-loader',
				],
			},

			// Create RTL styles.
			{
				test: /\.css$/,
				use: [
					//MiniCSSExtractPlugin.loader,
					'style-loader',
					'css-loader',
				],
			},

			// SASS to CSS.
			{
				test: /\.scss$/,
				use: [
					MiniCSSExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {
							sourceMap: true,
						},
					},
					{
						loader: 'sass-loader',
						options: {
							sourceMap: true,
						},
					} ],
			},

			// Image files.
			{
				test: /\.(png|jpe?g|gif|svg)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: 'images/[name].[ext]',
							publicPath: '../',
						},
					},
				],
			},
		],
	},

	// Plugins. Gotta have em'.
	plugins: [
		// Removes the "dist" folder before building.
		new CleanWebpackPlugin( {
			cleanStaleWebpackAssets: false,
			cleanOnceBeforeBuildPatterns: [ 'assets/dist' ],
		} ),

		new MiniCSSExtractPlugin( {
			filename: 'css/[name].css',
		} ),

		new CopyWebpackPlugin( {
			patterns: [
				{
					from: 'assets/src/images',
					to: 'images',
				},
			],
		} ),

		// Copy images and SVGs
		new CopyWebpackPlugin( {
			patterns: [
				{
					from: 'assets/src/images',
					to: 'images',
				},
			],
		} ),

		// Setup browser sync. Note: don't use ".local" TLD as it will be very slow. We recommending using ".test".
		new BrowserSyncPlugin( {
			files: [
				'**/*.php',
			],
			host: 'localhost',
			port: 3000,
			proxy: 'give.test',
		} ),
	],
};

// inProd?
if ( inProduction ) {
	// Create RTL css.
	config.plugins.push( new WebpackRTLPlugin( {
		suffix: '-rtl',
		minify: true,
	} ) );

	// Minify images.
	// Must go after CopyWebpackPlugin above: https://github.com/Klathmon/imagemin-webpack-plugin#example-usage
	config.plugins.push( new ImageminPlugin( { test: /\.(jpe?g|png|gif|svg)$/i } ) );

	// POT file.
	wpPot( {
		package: 'Give-Addon-Boilerplate',
		domain: 'give-addon-boilerplate',
		destFile: 'languages/give-addon-boilerplate.pot',
		relativeTo: './',
		bugReport: 'https://github.com/impress-org/Give-addon/issues/new',
		team: 'GiveWP <info@givewp.com>',
	} );
}

module.exports = config;

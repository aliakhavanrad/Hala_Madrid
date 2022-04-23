const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin')


module.exports = {
  mode:'development',
  module:{
    rules:[
      {
        test:/\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  entry: './src/js/main.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  resolve:{
  },
  plugins:[
    new HtmlWebpackPlugin({
      template:path.resolve(__dirname, 'index.html')
    }),
    new CopyWebpackPlugin({
      patterns:[
        { from: path.resolve(__dirname, './src/static') ,to: './static'}
      ]
    })
  ]

};
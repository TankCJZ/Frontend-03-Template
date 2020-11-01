module.exports = {
    entry: './main.js',
    rules: [
        {
          test: /\.js$/,
          use: {
            loader: 'babel-loader',
          }
        }
      ]
};
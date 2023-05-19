# A Simple Static Web Server
A Static Web Server built using Typescript.

## Details
Built using node.js with Visual Studio Code.

The Javascript was written in TypeScript.

### Main Features
- Serves static assets.
- Supports .html, .css, .js, .ico files.
- Caching of assets.

Feel free to use the web server for any purpose you want.

## How To Use
The server searches for the first '.html' file in the GET url request. For this reason, only one '.html' file should be present in each directory.

All files that the client requests should go in the './public/' folder.

Example file structure:

./public/index.html

./public/blog/index.html

./public/blog/the-journey-of-making-a-website/index.html


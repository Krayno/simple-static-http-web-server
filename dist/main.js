import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
const server = http.createServer(requestHandler);
const eTagsDictionary = generateETags('./public');
function requestHandler(req, res) {
    if (!req.headers.accept) {
        res.writeHead(415);
        res.end(`Property 'accept' in request header was 'undefined'.`);
    }
    if (req.url) {
        req.url = req.url == '/' ? "" : req.url;
        let fileExtension = path.extname(req.url);
        req.url += fileExtension == "" ? "/index.html" : "";
        fs.readFile(new URL('./public' + req.url, import.meta.url), (error, data) => {
            if (error) {
                console.log(error);
                res.writeHead(404);
                res.end(`404 - The requested URL: "${req.url}" was not found.`);
            }
            else {
                var contentType;
                var extension = req.url?.split('.')[1];
                switch (extension) {
                    case 'html': {
                        contentType = 'text/html';
                        break;
                    }
                    case 'css': {
                        contentType = 'text/css';
                        break;
                    }
                    case 'js': {
                        contentType = 'text/javascript';
                        break;
                    }
                    case 'ico': {
                        contentType = 'image/x-icon';
                        break;
                    }
                    default: {
                        contentType = undefined;
                    }
                }
                if (contentType) {
                    res.writeHead(200, { 'Content-Type': contentType, 'ETag': eTagsDictionary['./public' + req.url], 'Cache-Control': 'max-age=604800' });
                    res.end(data);
                }
                else {
                    res.writeHead(415);
                    res.end(`415 - Unsupported Media Type: "${extension}" was not supported.`);
                }
            }
        });
    }
    else {
        res.writeHead(404);
        res.end(`GET request URL string was 'undefined'.`);
    }
}
if (process.argv[3] && process.argv[2]) {
    console.log('Generated eTags for session:', eTagsDictionary);
    server.listen(parseInt(process.argv[3]), process.argv[2]);
    console.log(`Listening on ${process.argv[2]}:${process.argv[3]}`);
}
else {
    console.log(`No command line arguments found: 'hostname', 'port'`);
}
function generateETags(filePath) {
    let tempDictionary = {};
    let files = fs.readdirSync(filePath, { encoding: 'utf-8', withFileTypes: false, recursive: true });
    files.forEach(file => {
        if (path.extname(file) == '') {
            Object.assign(tempDictionary, generateETags(filePath + '/' + file));
        }
        else {
            tempDictionary[filePath + '/' + file] = crypto.createHash('md5').update(file).digest('base64');
        }
    });
    return tempDictionary;
}

import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const hostName = 'localhost';
const port = 8080;
const server = http.createServer(requestHandler);
const eTagsDictionary = generateETags(new URL('./public', import.meta.url).pathname.replace('/', ''));


function requestHandler(req: http.IncomingMessage, res: http.ServerResponse) {
    //Check if the 'accept' property in the request header is undefined.
    if (!req.headers.accept) {
        res.writeHead(415);
        res.end(`Property 'accept' in request header was 'undefined'.`);
    }

    //Check if the url is not undefined.
    if (req.url) {
        //If root request, change req.url to be empty.
        req.url = req.url == '/' ? "" : req.url;

        //If the file extension is empty, set req.url to '/index.html' and find the first 'index.html' in the directory.
        let fileExtension = path.extname(req.url);
        //Handle root request.
        req.url += fileExtension == "" ? "/index.html" : "";

        //If request etag matches stored Etag of requested URL, send Not Modified.
        if (req.headers['if-none-match']) {
            if (req.headers['if-none-match'] == eTagsDictionary[new URL('./public', import.meta.url).pathname.replace('/', '') + req.url]) {
                res.writeHead(304, { 'ETag': req.headers['if-none-match'] });
                res.end();
            }
        }
        else {
            //Read the file, handle outcomes.
            fs.readFile(new URL('./public' + req.url, import.meta.url), (error, data) => {
                if (error) {
                    console.log(error);
                    res.writeHead(404);
                    res.end(`404 - The requested URL: "${req.url}" was not found.`);
                }
                else {
                    //Determine correct MIME type based on file extension.
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

                    //Handle contentType
                    if (contentType) {
                        //Respond with data.
                        res.writeHead(200, { 'Content-Type': contentType, 'ETag': eTagsDictionary[new URL('./public', import.meta.url).pathname.replace('/', '') + req.url], 'Cache-Control': 'max-age=604800' });
                        res.end(data);
                    }
                    else {
                        res.writeHead(415);
                        res.end(`415 - Unsupported Media Type: "${extension}" was not supported.`);
                    }
                }
            });
        }
    }
    else {
        res.writeHead(404);
        res.end(`GET request URL string was 'undefined'.`);
    }
}

//Check if command line arguements have been passed.
console.log('Generated eTags for session:', eTagsDictionary);
server.listen(port, hostName);
console.log(`Listening on ${hostName}:${port}`);

function generateETags(filePath: string): Record<string, string> {
    //Create Temporary Dictionary.
    let tempDictionary: Record<string, string> = {};

    //Get all the files in the current file path.
    let files = fs.readdirSync(filePath, { encoding: 'utf-8', withFileTypes: false, recursive: true });

    //Loop through each file in the directory.
    files.forEach(file => {

        //If the file is a directory, loop through that otherwise add property and assign base64 hash value.
        if (path.extname(file) == '') {
            Object.assign(tempDictionary, generateETags(filePath + '/' + file))
        }
        else {
            tempDictionary[filePath + '/' + file] = crypto.createHash('md5').update(file).digest('base64');
        }

    });

    //Return temporary dictionary.
    return tempDictionary;
}
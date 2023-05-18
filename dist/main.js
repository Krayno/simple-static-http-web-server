import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
const server = http.createServer(requestHandler);
function requestHandler(req, res) {
    if (req.url) {
        let fileExtension = path.extname(req.url);
        req.url += fileExtension == "" ? "/index.html" : "";
        fs.readFile(new URL('./public' + req.url, import.meta.url), (error, data) => {
            if (error) {
                console.log(error);
                res.writeHead(404);
                res.end(`404 - The requested URL: "${req.url}" was not found.`);
            }
            else {
                res.writeHead(200, { 'Content-Type': req.headers.accept?.split(',')[0] });
                res.end(data);
            }
        });
    }
    else {
        res.writeHead(404);
        res.end(`GET request URL string was 'undefined'.`);
    }
}
if (process.argv[3] && process.argv[2]) {
    server.listen(parseInt(process.argv[3]), process.argv[2]);
    console.log(`Listening on ${process.argv[2]}:${process.argv[3]}`);
}
else {
    console.log(`No command line arguments found: 'hostname', 'port'`);
}

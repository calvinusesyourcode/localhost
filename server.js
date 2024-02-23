const express = require('express');
const fs = require('fs');
const path = require('path');
const markdownIt = require('markdown-it');
const md = new markdownIt();
const app = express();

const PORT = 3000;
const REFRESH = 5
const POLLING = 1

let markdownPath = path.join(__dirname, 'README.md');
let lastModified = new Date(Date.now()-1_000);
let htmlContent = '';

const checkForUpdates = () => {
    fs.stat(markdownPath, (err, stats) => {
        if (err) {console.error("Error reading file stats:", err); return}
        if (stats.mtime <= lastModified) {console.log("No updates found"); return}

        lastModified = stats.mtime;
        fs.readFile(markdownPath, 'utf8', (err, data) => {
            if (err) {console.error("Error reading markdown file:", err); return}

            htmlContent = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="refresh" content="${REFRESH}">
                    <title>Markdown Page</title>
                    <style>
                        body { font-size: 32px; }
                    </style>
                </head>
                <body>
                    ${md.render(data)}
                    <script>
                        window.onload = function() {
                            setInterval(function() {
                                window.scrollTo(0,document.body.scrollHeight);
                                console.log(document.body.scrollHeight)
                            }, ${REFRESH*1_000});
                        }   
                    </script>
                </body>
                </html>
            `;
        });
  });
};

setInterval(checkForUpdates, POLLING*1_000);

app.get('/', (req, res) => {
  res.send(htmlContent);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

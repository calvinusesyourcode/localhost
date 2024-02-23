const express = require('express');
const fs = require('fs');
const path = require('path');
const markdownIt = require('markdown-it');
const md = new markdownIt();

const app = express();
const PORT = 3000;
const markdownFilePath = path.join(__dirname, 'yourMarkdownFile.md');
let lastModified = new Date(0); // Initialize with a past date
let htmlContent = ''; // To store the converted HTML content

// Function to check for file updates
const checkForUpdates = () => {
  fs.stat(markdownFilePath, (err, stats) => {
    if (err) {
      console.error("Error reading file stats:", err);
      return;
    }

    if (stats.mtime > lastModified) {
      // File has been updated
      lastModified = stats.mtime;
      fs.readFile(markdownFilePath, 'utf8', (err, data) => {
        if (err) {
          console.error("Error reading markdown file:", err);
          return;
        }

        // Convert markdown to HTML and include a meta refresh tag
        const refreshRate = 5; // Refresh every 5 seconds
        htmlContent = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta http-equiv="refresh" content="${refreshRate}">
            <title>Markdown Page</title>
            <style>
                body {
                    font-size: 32px;
                }
            </style>
          </head>
          <body>
          
            ${md.render(data)}
          </body>
          </html>
        `;
      });
    }
  });
};

// Set an interval to check for file updates every X milliseconds
const pollingInterval = 1000; // Example: 5000 milliseconds (5 seconds)
setInterval(checkForUpdates, pollingInterval);

// Serve the latest HTML content
app.get('/', (req, res) => {
  res.send(htmlContent);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

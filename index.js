const express = require('express');
const path = require('path');
const fs = require('fs')

const app = express();

app.listen(3030, () => {
    console.log('Listening on port 3030...');
});

app.get('/public/:file', (req, res) => {
    let file_path = path.join(__dirname, '/public/' + req.params.file);
    if (fs.existsSync(file_path)) {
        res.sendFile(file_path);
        return;
    }
    
    res.send('File not found...');
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './index.html'))
});
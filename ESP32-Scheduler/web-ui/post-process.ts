const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

var getFiles = function (path, files) {
    fs.readdirSync(path).forEach(function (file) {
        var subpath = path + '/' + file;
        if (fs.lstatSync(subpath).isDirectory()) {
            getFiles(subpath, files);
        } else {
            files.push(path + '/' + file);
        }
    });
}

function searchReplaceFile(regexpFind, replace, fileName) {
    var file = fs.createReadStream(fileName, 'utf8');
    var newContent = '';

    file.on('data', function (chunk) {
        var content = chunk.toString();
        regexpFind.forEach((regex, i) => {
            content = content.replace(regex, replace[i]);
        });
        newContent += content;
    });

    file.on('end', function () {
        fs.writeFile(fileName, newContent, function (err) {
            if (err) {
                return console.log(err);
            } else {
                console.log('Updated!');
            }
        });
    });
}

const files = [];
getFiles('build/static', files);
files.forEach(file => {
    const readStream = fs.createReadStream(`${file}`);
    const writeStream = fs.createWriteStream(`${file}.gz`);
    const zip = zlib.createGzip();
    readStream.pipe(zip).pipe(writeStream).on('finish', (err) => {
        if (err) console.log('ERROR: ' + err);
    })

    const target = `build/${path.basename(file)}.gz`;
    fs.rename(`${file}.gz`, target, (err) => {
        if (err) console.log('ERROR: ' + err);
    });
});

fs.copyFile('serve.json', 'build/serve.json', (err) => {
    if (err) console.log('ERROR: ' + err);
});

fs.rmdirSync('build/static', { recursive: true });
searchReplaceFile([/\/static\/css/g, /\/static\/js/g, /.css"/g, /.js"/g], ['', '', '.css.gz"', '.js.gz"'], 'build/index.html');
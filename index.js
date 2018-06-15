#!/usr/bin/env node

var fs = require('fs');
var fetch = require('node-fetch');
var decompress = require('decompress');
var ar = require('ar');
var path = require('path');


const url = 'https://www.nohrd.com/pub/media/we-row/version/linux.zip';

const saveFile = (res) => {
  return new Promise((resolve, reject) => {
    const file = './linux.zip';
    const dest = fs.createWriteStream(file);
    res.body.pipe(dest);
    res.body.on('error', err => {
      reject(err);
    });
    dest.on('finish', () => {
      resolve(file);
    });
    dest.on('error', err => {
      reject(err);
    });
  });
};

const unzipFile = (file) => {
  return new Promise((resolve, reject) => {
    decompress(file, '.').then((files) => {
      resolve(files);
    }).catch((err) => {
      reject(err);
    });
  });
};

const fileExists = (file) => {
  return new Promise((resolve, reject) => {
    fs.stat(file, (err) => {
      if(err == null) {
        resolve(file);
      } else {
        reject(err);
      }
    });
  });
};

const unpackDeb = (file) => {
  return new Promise((resolve, reject) => {
    try {
      var outputDir = file[0].path;
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

      var archive = new ar.Archive(fs.readFileSync(file[1].path));
      var files = archive.getFiles();
      for (var i = 0; i < files.length; i++) {
        var outFile = files[i];
        fs.writeFileSync(path.resolve(outputDir, outFile.name()), outFile.fileData());
      }
      resolve(outputDir + 'data.tar.xz');
    } catch (err) {
      reject(err);
    }
  });
};

const changeFileExtension = (file, ext) => {
  var arr = file.split('.');
  arr.pop();
  arr.push(ext);
  var newFile = arr.join('.');

  return new Promise((resolve, reject) => {
    fs.rename(file, newFile, (err) => {
      if(err == null) {
        resolve(newFile);
      } else {
        reject(err);
      }
    });
  });
};

fileExists('./linux.zip')
  .then((file) => { unzipFile(file)
    .then(files => { unpackDeb(files)
      .then(file => { unzipFile(file)
        .then(res => console.log(res))
        .catch(err => console.log(err));
      });
    });
  })
  .catch(() => {
    fetch(url)
      .then(res => saveFile(res))
      .then((file) => { unzipFile(file)
        .then(res => console.log(res));
      });
  });
#!/usr/bin/env node

var fs = require('fs');
var fetch = require('node-fetch');
var decompress = require('decompress');
var ar = require('ar');
var lzma = require('lzma-native').createDecompressor({synchronous: true});
var path = require('path');
var asar = require('asar');


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

const unpackGeneric = (file, path = '.') => {
  return new Promise((resolve, reject) => {
    decompress(file, path).then((files) => {
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

const unpackXz = (file) => {
  return new Promise((resolve, reject) => {
    var input = fs.createReadStream(file);
    var output = fs.createWriteStream('data.tar');
    input.pipe(lzma).pipe(output)
      .on('unpipe', function () {
        resolve('data.tar');
      })
      .on('error', function (err) {
        reject(err);
      });
  });
};

const unpackAsar = (file, dest) => {
  return new Promise((resolve, reject) => {
    try {
      asar.extractAll(file, dest);
      resolve(dest);
    } catch (err) {
      reject(err);
    }
  });
};

const genericFindFile = (pathsArray, fileName) => {
  return new Promise((resolve, reject) => {
    const result = pathsArray.filter(paths => {
      var file = paths.path.split('/');
      return (file[file.length-1] === fileName);
    });

    if (result === undefined || result.length <= 0) {
      reject(fileName +' not found');
    } else if (result.length > 1) {
      reject('multiple files with name ' + fileName + ' found');
    } else {
      resolve(result[0]);
    }
  });
};

// unsused. might be useful at some point
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

const replaceFiles = (srcDir) => {
  return new Promise((resolve, reject) => {
    try {
      fs.writeFileSync('./'+srcDir+'/.babelrc', fs.readFileSync('./.bablerc-copy'));
      fs.writeFileSync('./'+srcDir+'/main.js', fs.readFileSync('./main.js-copy'));
      resolve('done');
    } catch (err) {
      reject(err);
    }
  });
};

// copied from https://gist.github.com/geedew/cf66b81b0bcdab1f334b
const deleteFolderRecursive = (path) => {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file){
      var curPath = path + '/' + file;
      if(fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

const cleanup = () => {
  return new Promise((resolve, reject) => {
    try {
      fs.unlinkSync('./data.tar');
      deleteFolderRecursive('./linux');
      deleteFolderRecursive('./data');
      resolve('Done.\nProject patched and extracted to folder \'headless-rower/\'');
    } catch (err) {
      reject(err);
    }
  });
};

// Choo choo! All aboard the promise train!
fileExists('./linux.zip')
  .then(file => { unpackGeneric(file)
    .then(files => { unpackDeb(files)
      .then(file => { unpackXz(file)
        .then(file => { unpackGeneric(file, 'data/')
          .then(pathsArray => { genericFindFile(pathsArray, 'app.asar')
            .then(file => { unpackAsar('data/'+file.path, 'headless-rower')
              .then(srcDir => { replaceFiles(srcDir)
                .then(() => { cleanup()
                  .then(res => console.log(res))
                  .catch(err => console.log(err));
                });
              });
            });
          });
        });
      });
    });
  })
  .catch(() => {
    fetch(url)
    .then(res => { saveFile(res)
      .then(file => { unpackGeneric(file)
        .then(files => { unpackDeb(files)
          .then(file => { unpackXz(file)
            .then(file => { unpackGeneric(file, 'data/')
              .then(pathsArray => { genericFindFile(pathsArray, 'app.asar')
                .then(file => { unpackAsar('data/'+file.path, 'headless-rower')
                  .then(srcDir => { replaceFiles(srcDir)
                    .then(() => { cleanup()
                      .then(res => console.log(res))
                      .catch(err => console.log(err));
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
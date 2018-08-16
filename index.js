const fs = require('fs');
const path = require('path');
const del = require('del');

let [ ,, dirForSort = 'images', sortedDir = 'sortedImges', delInitDir = 'yes' ] = process.argv;
let objDirFile = {};
let countDirWithFiles = 0;
let countRichedLastFile = 0;

dirForSort = path.join(__dirname, dirForSort);
sortedDir = path.join(__dirname, sortedDir);

if (!fs.existsSync(dirForSort)) {
  console.error('Проверьте название папки для сортировки');
}

makeDir(sortedDir);

const readDir = base => {
  fs.readdir(base, (err, files) => {
    writeError(err);

    files.forEach(item => {
      let localBase = path.join(base, item);
      
      fs.stat(localBase, (err, stats) => {
        writeError(err);

        if (stats.isDirectory()) {
          readDir(localBase);
        } else {
          let letterDir = path.join(sortedDir, item[0].toUpperCase());
          let filteredFile = files.filter(item => !!path.extname(item));

          if (objDirFile[base] === undefined) ++countDirWithFiles;
          objDirFile[base] = filteredFile[filteredFile.length - 1];
          
          makeDir(letterDir);
          
          fs.copyFile(localBase, path.join(letterDir, item), err => {
            writeError(err);

            if (item === objDirFile[base]) {
              ++countRichedLastFile;
              console.log(countDirWithFiles, countRichedLastFile, objDirFile);
            }

            deleteDir();
          });
        }
      });
    });
  });
};

readDir(dirForSort);

function makeDir (dirName) {
  if (!fs.existsSync(dirName)) {
    fs.mkdirSync(dirName);
  }
}

function writeError (err) {
  if (err) {
    console.error(err.message);
  }
}

function deleteDir () {
  if (delInitDir === 'yes' && countDirWithFiles === countRichedLastFile && countDirWithFiles) {
    console.log(countDirWithFiles, countRichedLastFile, objDirFile);
    del([dirForSort]).then(paths => {
      console.log('Deleted folder:\n', paths.join('\n'));
    });
  }
}

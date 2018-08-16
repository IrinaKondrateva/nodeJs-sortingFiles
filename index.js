const fs = require('fs');
const path = require('path');

let [ ,, dirForSort = 'images', sortedDir = 'sortedImges', delInitDir = 'yes' ] = process.argv;

dirForSort = path.join(__dirname, dirForSort);
sortedDir = path.join(__dirname, sortedDir);

console.log(dirForSort, sortedDir);

if (!fs.existsSync(dirForSort)) {
  console.error('Проверьте название папки для сортировки');
}

makeDir(sortedDir);

const readDir = base => {
  fs.readdir(base, (err, files) => {

    if (err) {
      console.error(err.message);
    }

    files.forEach(item => {
      let localBase = path.join(base, item);
      
      fs.stat(localBase, (err, stats) => {

        if (err) {
          console.error(err.message);
        }

        if (stats.isDirectory()) {
          readDir(localBase);
        } else {
          let letterDir = path.join(sortedDir, item[0].toUpperCase());
    
          makeDir(letterDir);
          
          fs.copyFile(localBase, path.join(letterDir, item), err => {
            if (err) {
              console.error(err.message);
            }
          });
  
          console.log('File: ' + item);
        }
      });
    });
  });
};

readDir(dirForSort);

function makeDir (dirName) {
  if (!fs.existsSync(dirName)) {
    fs.mkdir(dirName, err => {
      if (err) {
        console.error(err.message);
      }
    });
  }
}

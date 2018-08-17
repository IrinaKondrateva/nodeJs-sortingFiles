const fs = require('fs');
const path = require('path');

let [ ,, dirForSort = 'images', sortedDir = 'sortedImges', delInitDir = 'yes' ] = process.argv;
let objDirFile = {};

dirForSort = path.join(__dirname, dirForSort);
sortedDir = path.join(__dirname, sortedDir);

if (!fs.existsSync(dirForSort)) {
  console.error('Проверьте название папки для сортировки');
  process.exit(1);
}

makeDir(sortedDir);

const readDir = dir => {
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error('Невозможно прочитать содержимое папок', err.message);
      process.exit(1);
    }

    if (!files.length) deleteDir(dir);

    let filteredFile = files.filter(item => !!path.extname(item));
    if (filteredFile.length) {
      objDirFile[dir] = {
        numFilesOfDir: filteredFile.length,
        numDeletedFiles: 0
      };
    }

    files.forEach(item => {
      let localDir = path.join(dir, item);
      
      fs.stat(localDir, (err, stats) => {
        if (err) {
          console.error('Невозможно получить стат. данные', err.message);
          process.exit(1);
        }

        if (stats.isDirectory()) {
          readDir(localDir);
        } else {
          let letterDir = path.join(sortedDir, item[0].toUpperCase());
          
          makeDir(letterDir);
          
          fs.copyFile(localDir, path.join(letterDir, item), err => {
            if (err) {
              console.error('Не удалось скопировать файл', err.message);
              process.exit(1);
            }

            if (delInitDir === 'yes') {
              delFilesDir(dir, item);
            }
          });
        }
      });
    });
  });
};

readDir(dirForSort);

function makeDir (dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}

function delFilesDir (dir, file) {
  fs.unlink(path.join(dir, file), err => {
    if (err) {
      console.error('Невозможно удалить файл', err.message);
      return;
    }
    ++objDirFile[dir].numDeletedFiles;
    
    if (objDirFile[dir].numDeletedFiles !== objDirFile[dir].numFilesOfDir) return;
    
    deleteDir(dir);
  });
}

function deleteDir (dir) {
  fs.readdir(dir, (err, folders) => {
    if (err) {
      console.error('Ошибка при чтении директории для удаления', err.message);
      return;
    }

    if (folders.length) return;
    fs.rmdir(dir, err => {
      if (err) {
        console.error('Удаляемой папки уже не существует', err.message);
        return;
      }
      console.log('Папка удалена!', dir);

      if (path.dirname(dir) !== dirForSort) {
        deleteDir(path.dirname(dir));
      } else {
        deleteDir(dirForSort);
      }
    });
  });
}

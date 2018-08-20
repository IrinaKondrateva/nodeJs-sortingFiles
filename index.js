const fs = require('fs');
const path = require('path');

let [ ,, dirForSort, sortedDir = 'sortedImges', delInitDir = 'yes' ] = process.argv;

if (!dirForSort) {
  console.error('Необходимо передать название папки для сортировки');
  process.exit(1);
}

dirForSort = path.join(__dirname, dirForSort);
sortedDir = path.join(__dirname, sortedDir);

if (!fs.existsSync(dirForSort)) {
  console.error('Проверьте название папки для сортировки');
  process.exit(1);
}

makeDir(sortedDir);

const readDir = dir => {
  try {
    const filesFolders = fs.readdirSync(dir);

    filesFolders.forEach(item => {
      const localDir = path.join(dir, item);
      const stats = fs.statSync(localDir);

      if (stats.isDirectory()) {
        readDir(localDir);
      } else {
        let letterDir = path.join(sortedDir, item[0].toUpperCase());
        
        makeDir(letterDir);
        
        try {
          fs.copyFileSync(localDir, path.join(letterDir, item));
        } catch (err) {
          console.error('Не удалось скопировать файл', err.message);
          process.exit(1);
        }
      }

      if (delInitDir === 'yes') {
        delFilesDir(localDir);
      }
    });
  } catch (err) {
    console.error(err.message);
  }
};

readDir(dirForSort);

function makeDir (dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}

function delFilesDir (item) {
  try {
    if (!fs.existsSync(item)) return;
    const stats = fs.statSync(item);
    
    if (stats.isDirectory()) {
      const filesFolders = fs.readdirSync(item);
  
      if (filesFolders.length) return;
      fs.rmdirSync(item);
  
      if (path.dirname(item) !== dirForSort) {
        delFilesDir(path.dirname(item));
      } else {
        delFilesDir(dirForSort);
        console.log('Done');
      }
    } else {
      fs.unlinkSync(item);
    }
  } catch (err) {
    console.error('Ошибка при удалении файла/папки', err.message);
  }
}

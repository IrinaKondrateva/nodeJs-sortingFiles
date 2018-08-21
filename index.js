const fs = require('mz/fs');
const path = require('path');

let [ ,, dirForSort = 'images', sortedDir = 'sortedImges', isDel = 'yes' ] = process.argv;

dirForSort = path.join(__dirname, dirForSort);
sortedDir = path.join(__dirname, sortedDir);

sortFiles(dirForSort, sortedDir, isDel)
  .then(result => console.log(result))
  .catch(err => console.error(err.message));

function sortFiles (from, to, isDel) {
  return new Promise((resolve, reject) => {
    if (!from) {
      console.error('Необходимо передать название папки для сортировки');
      process.exit(1);
    }

    makeDir(to);
    readDir(from);

    async function readDir (dir) {
      try {
        let copiedItems;
        let filesFolders = await fs.readdir(dir);

        if (!filesFolders.length) return 'папка пуста';

        filesFolders = filesFolders.map(item => {
          return (async () => {
            const localDir = path.join(dir, item);
            const stats = await fs.stat(localDir);
      
            if (stats.isDirectory()) {
              await readDir(localDir);
            } else {
              let letterDir = path.join(to, item[0].toUpperCase());
              
              makeDir(letterDir);
      
              try {
                await fs.copyFile(localDir, path.join(letterDir, item));
              } catch (err) {
                console.error('Не удалось скопировать файл', err.message);
              }
            }

            return localDir;
          })();
        });

        copiedItems = await Promise.all(filesFolders);

        if (isDel === 'yes' && (await delFilesDir(copiedItems) === 'Successfully')) {
          resolve('Successfully');
        }
      } catch (err) {
        reject(err);
      }
    }
  });
}

async function delFilesDir (arrForDel) {
  try {
    let deletedItems;

    if (!arrForDel.length) return 'нечего удалять';

    arrForDel = arrForDel.map(item => {
      return (async () => {
        const stats = await fs.stat(item);
    
        if (stats.isDirectory()) {
          await fs.rmdir(item);
        } else {
          await fs.unlink(item);
        }

        return item;
      })();
    });

    deletedItems = await Promise.all(arrForDel);

    if (deletedItems.every(item => (path.dirname(item) === dirForSort))) {
      await fs.rmdir(dirForSort);
      return 'Successfully';
    }
  } catch (err) {
    console.error('Ошибка при удалении папки/файла', err.message);
  }
}

function makeDir (dir) {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  } catch (err) {
    console.error('Ошибка при создании папки', err.message);
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at:', p, 'reason:', reason);
});

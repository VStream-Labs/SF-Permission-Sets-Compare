const express = require('express');
const multer = require('multer');
const xml2js = require('xml2js');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/compare', upload.array('files', 2), async (req, res) => {
  const files = req.files;
  if (files.length !== 2) {
    return res.status(400).send('Two files are required.');
  }

  const [file1, file2] = files;

  const parseXML = (filePath) => {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (err) reject(err);
        xml2js.parseString(data, (err, result) => {
          if (err) reject(err);
          resolve(result);
        });
      });
    });
  };

  const perm1 = await parseXML(file1.path);
  const perm2 = await parseXML(file2.path);

  const comparePermissions = (perm1, perm2) => {
    const changes = {};
    const allFields = new Set([...Object.keys(perm1), ...Object.keys(perm2)]);
    allFields.forEach((field) => {
      if (!perm1[field]) {
        changes[field] = 'Created';
      } else if (!perm2[field]) {
        changes[field] = 'Deleted';
      } else if (JSON.stringify(perm1[field]) !== JSON.stringify(perm2[field])) {
        changes[field] = 'Changed';
      } else {
        changes[field] = 'Unchanged';
      }
    });
    return changes;
  };

  const changes = comparePermissions(perm1, perm2);

  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet(
    Object.entries(changes).map(([field, change]) => ({ field, change }))
  );
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Changes');
  const filePath = path.join(__dirname, 'changes.xlsx');
  xlsx.writeFile(workbook, filePath);

  res.download(filePath, 'changes.xlsx', (err) => {
    if (err) console.error(err);
    fs.unlinkSync(file1.path);
    fs.unlinkSync(file2.path);
    fs.unlinkSync(filePath);
  });
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
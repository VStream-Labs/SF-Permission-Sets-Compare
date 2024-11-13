const express = require('express');
const multer = require('multer');
const xml2js = require('xml2js');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // Import the cors package

const app = express();
app.use(cors()); // Enable CORS

const upload = multer({ dest: 'uploads/' });

const parsePermissions = (xml) => {
  const permissions = {
    applicationVisibilities: {},
    userPermissions: {},
    objectPermissions: {},
    fieldPermissions: {},
    pageAccesses: {},
    classAccesses: {},
    tabSettings: {},
    recordTypeVisibilities: {}
  };

  xml.PermissionSet.applicationVisibilities.forEach((item) => {
    permissions.applicationVisibilities[item.application[0]] = item.visible[0];
  });

  xml.PermissionSet.userPermissions.forEach((item) => {
    permissions.userPermissions[item.name[0]] = item.enabled[0];
  });

  xml.PermissionSet.objectPermissions.forEach((item) => {
    permissions.objectPermissions[item.object[0]] = {
      allowCreate: item.allowCreate[0],
      allowDelete: item.allowDelete[0],
      allowEdit: item.allowEdit[0],
      allowRead: item.allowRead[0],
      viewAllRecords: item.viewAllRecords[0],
      modifyAllRecords: item.modifyAllRecords[0]
    };
  });

  xml.PermissionSet.fieldPermissions.forEach((item) => {
    permissions.fieldPermissions[item.field[0]] = {
      editable: item.editable[0],
      readable: item.readable[0]
    };
  });

  xml.PermissionSet.pageAccesses.forEach((item) => {
    permissions.pageAccesses[item.apexPage[0]] = item.enabled[0];
  });

  xml.PermissionSet.classAccesses.forEach((item) => {
    permissions.classAccesses[item.apexClass[0]] = item.enabled[0];
  });

  xml.PermissionSet.tabSettings.forEach((item) => {
    permissions.tabSettings[item.tab[0]] = item.visibility[0];
  });

  xml.PermissionSet.recordTypeVisibilities.forEach((item) => {
    permissions.recordTypeVisibilities[item.recordType[0]] = item.visible[0];
  });

  return permissions;
};

const comparePermissions = (perm1, perm2) => {
  const changes = {};
  const allKeys = new Set([...Object.keys(perm1), ...Object.keys(perm2)]);

  allKeys.forEach((key) => {
    const subKeys = new Set([...Object.keys(perm1[key] || {}), ...Object.keys(perm2[key] || {})]);

    subKeys.forEach((subKey) => {
      if (!perm1[key] || !perm1[key][subKey]) {
        changes[`${key}.${subKey}`] = 'Created';
      } else if (!perm2[key] || !perm2[key][subKey]) {
        changes[`${key}.${subKey}`] = 'Deleted';
      } else if (JSON.stringify(perm1[key][subKey]) !== JSON.stringify(perm2[key][subKey])) {
        changes[`${key}.${subKey}`] = 'Changed';
      } else {
        changes[`${key}.${subKey}`] = 'Unchanged';
      }
    });
  });

  return changes;
};

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

  try {
    const xml1 = await parseXML(file1.path);
    const xml2 = await parseXML(file2.path);

    const perm1 = parsePermissions(xml1);
    const perm2 = parsePermissions(xml2);

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
  } catch (error) {
    console.error('Error processing files:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const app = express();
app.use(cors());
const upload = multer({ dest: 'uploads/' });

const parsePermissions = (xml) => {
  const permissions = {
    applicationVisibilities: [],
    userPermissions: [],
    objectPermissions: [],
    fieldPermissions: [],
    pageAccesses: [],
    classAccesses: [],
    tabSettings: [],
    recordTypeVisibilities: []
  };

  if (xml.PermissionSet.applicationVisibilities) {
    xml.PermissionSet.applicationVisibilities.forEach((item) => {
      permissions.applicationVisibilities.push({
        application: item.application[0],
        visible: item.visible[0]
      });
    });
  }

  if (xml.PermissionSet.userPermissions) {
    xml.PermissionSet.userPermissions.forEach((item) => {
      permissions.userPermissions.push({
        name: item.name[0],
        enabled: item.enabled[0]
      });
    });
  }

  if (xml.PermissionSet.objectPermissions) {
    xml.PermissionSet.objectPermissions.forEach((item) => {
      permissions.objectPermissions.push({
        object: item.object[0],
        allowCreate: item.allowCreate[0],
        allowDelete: item.allowDelete[0],
        allowEdit: item.allowEdit[0],
        allowRead: item.allowRead[0],
        viewAllRecords: item.viewAllRecords[0],
        modifyAllRecords: item.modifyAllRecords[0]
      });
    });
  }

  if (xml.PermissionSet.fieldPermissions) {
    xml.PermissionSet.fieldPermissions.forEach((item) => {
      permissions.fieldPermissions.push({
        field: item.field[0],
        editable: item.editable[0],
        readable: item.readable[0]
      });
    });
  }

  if (xml.PermissionSet.pageAccesses) {
    xml.PermissionSet.pageAccesses.forEach((item) => {
      permissions.pageAccesses.push({
        apexPage: item.apexPage[0],
        enabled: item.enabled[0]
      });
    });
  }

  if (xml.PermissionSet.classAccesses) {
    xml.PermissionSet.classAccesses.forEach((item) => {
      permissions.classAccesses.push({
        apexClass: item.apexClass[0],
        enabled: item.enabled[0]
      });
    });
  }

  if (xml.PermissionSet.tabSettings) {
    xml.PermissionSet.tabSettings.forEach((item) => {
      permissions.tabSettings.push({
        tab: item.tab[0],
        visibility: item.visibility[0]
      });
    });
  }

  if (xml.PermissionSet.recordTypeVisibilities) {
    xml.PermissionSet.recordTypeVisibilities.forEach((item) => {
      permissions.recordTypeVisibilities.push({
        recordType: item.recordType[0],
        visible: item.visible[0]
      });
    });
  }

  console.log('Parsed Permissions:', permissions); // Log the parsed permissions
  return permissions;
};

const comparePermissions = (perm1, perm2, file1Name, file2Name) => {
  const changes = [];

  const compare = (key, item1, item2) => {
    if (JSON.stringify(item1) !== JSON.stringify(item2)) {
      changes.push({
        path: key,
        change: 'Modified',
        file: `${file1Name}, ${file2Name}`
      });
    }
  };

  Object.keys(perm1).forEach((key) => {
    const items1 = perm1[key];
    const items2 = perm2[key];

    items1.forEach((item1) => {
      const item2 = items2.find((item) => item.field === item1.field || item.object === item1.object || item.tab === item1.tab);
      if (item2) {
        compare(`${key}.${item1.field || item1.object || item1.tab}`, item1, item2);
      } else {
        changes.push({
          path: `${key}.${item1.field || item1.object || item1.tab}`,
          change: 'Deleted',
          file: file1Name
        });
      }
    });

    items2.forEach((item2) => {
      const item1 = items1.find((item) => item.field === item2.field || item.object === item2.object || item.tab === item2.tab);
      if (!item1) {
        changes.push({
          path: `${key}.${item2.field || item2.object || item2.tab}`,
          change: 'Added',
          file: file2Name
        });
      }
    });
  });

  console.log('Changes:', changes); // Log the changes
  return changes;
};

app.post('/compare', upload.fields([{ name: 'filesSet1' }, { name: 'filesSet2' }]), async (req, res) => {
  const filesSet1 = req.files.filesSet1;
  const filesSet2 = req.files.filesSet2;
  if (!filesSet1 || !filesSet2) {
    return res.status(400).send('Two sets of files are required.');
  }

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
    const xml1 = await parseXML(filesSet1[0].path);
    const xml2 = await parseXML(filesSet2[0].path);

    const perm1 = parsePermissions(xml1);
    const perm2 = parsePermissions(xml2);

    console.log('Permissions Set 1:', perm1); // Log permissions set 1
    console.log('Permissions Set 2:', perm2); // Log permissions set 2

    const changes = comparePermissions(perm1, perm2, filesSet1[0].originalname, filesSet2[0].originalname);

    console.log('Changes:', changes); // Log the changes

    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(changes);
    console.log('Worksheet Data:', worksheet); // Log the worksheet data
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Changes');
    const filePath = path.join(__dirname, 'changes.xlsx');
    xlsx.writeFile(workbook, filePath);

    res.json({ changes, downloadUrl: `http://localhost:5000/download` });

    app.get('/download', (req, res) => {
      res.download(filePath, 'changes.xlsx', (err) => {
        if (err) console.error(err);
        fs.unlinkSync(filesSet1[0].path);
        fs.unlinkSync(filesSet2[0].path);
        fs.unlinkSync(filePath);
      });
    });
  } catch (error) {
    console.error('Error processing files:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
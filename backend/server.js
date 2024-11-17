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

  console.log('Parsed Permissions:', JSON.stringify(permissions, null, 2)); // Log the parsed permissions
  return permissions;
};

const comparePermissions = (perm1, perm2, fileName1, fileName2) => {
  const changes = [];

  const compareArrays = (arr1, arr2, key, permissionType) => {
    const map1 = new Map(arr1.map(item => [item[key], item]));
    const map2 = new Map(arr2.map(item => [item[key], item]));

    map1.forEach((value, key) => {
      if (!map2.has(key)) {
        changes.push({ file: fileName1, type: 'Removed', key, value, permissionType });
      } else if (JSON.stringify(value) !== JSON.stringify(map2.get(key))) {
        changes.push({ file: fileName1, type: 'Modified', key, oldValue: value, newValue: map2.get(key), permissionType });
      }
    });

    map2.forEach((value, key) => {
      if (!map1.has(key)) {
        changes.push({ file: fileName2, type: 'Added', key, value, permissionType });
      }
    });
  };

  compareArrays(perm1.applicationVisibilities, perm2.applicationVisibilities, 'application', 'ApplicationVisibility');
  compareArrays(perm1.userPermissions, perm2.userPermissions, 'name', 'UserPermission');
  compareArrays(perm1.objectPermissions, perm2.objectPermissions, 'object', 'ObjectPermission');
  compareArrays(perm1.fieldPermissions, perm2.fieldPermissions, 'field', 'FieldPermission');
  compareArrays(perm1.pageAccesses, perm2.pageAccesses, 'apexPage', 'PageAccess');
  compareArrays(perm1.classAccesses, perm2.classAccesses, 'apexClass', 'ClassAccess');
  compareArrays(perm1.tabSettings, perm2.tabSettings, 'tab', 'TabSetting');
  compareArrays(perm1.recordTypeVisibilities, perm2.recordTypeVisibilities, 'recordType', 'RecordTypeVisibility');

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

    console.log('Permissions Set 1:', JSON.stringify(perm1, null, 2)); // Log permissions set 1
    console.log('Permissions Set 2:', JSON.stringify(perm2, null, 2)); // Log permissions set 2

    const changes = comparePermissions(perm1, perm2, filesSet1[0].originalname, filesSet2[0].originalname);

    console.log('Changes:', JSON.stringify(changes, null, 2)); // Log the changes

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
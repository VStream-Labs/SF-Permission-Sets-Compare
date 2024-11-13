import React, { useState } from 'react';
import { Table } from 'react-bootstrap';
import { Treebeard } from 'react-treebeard';

const MainContent = ({ data, downloadUrl }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'field', direction: 'ascending' });
  const [treeData, setTreeData] = useState({});
  const [cursor, setCursor] = useState(false);

  const getChangeColor = (change) => {
    switch (change) {
      case 'Unchanged':
        return 'green';
      case 'Changed':
        return 'red';
      case 'Created':
        return 'yellow';
      default:
        return 'black';
    }
  };

  const sortedData = React.useMemo(() => {
    let sortableData = [...data];
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? '▲' : '▼';
    }
    return '↕';
  };

  const handleToggle = (node, toggled) => {
    if (cursor) {
      cursor.active = false;
    }
    node.active = true;
    if (node.children) {
      node.toggled = toggled;
    }
    setCursor(node);
    setTreeData(Object.assign({}, treeData));
  };

  const buildTreeData = (changes) => {
    const tree = {
      name: 'Changes',
      toggled: true,
      children: Object.entries(changes).map(([field, { change, file, exactChange }]) => ({
        name: field,
        children: [
          { name: `Change: ${change}`, children: exactChange ? [{ name: exactChange }] : [] },
          { name: `File: ${file}` },
        ],
      })),
    };
    setTreeData(tree);
  };

  React.useEffect(() => {
    buildTreeData(data);
  }, [data]);

  return (
    <div className="main-content">
      {downloadUrl && (
        <a href={downloadUrl} download="changes.xlsx" className="btn btn-success mb-3">
          Download Result
        </a>
      )}
      {data && data.length > 0 && (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th onClick={() => requestSort('field')}>
                PermissionType {getSortIcon('field')}
              </th>
              <th onClick={() => requestSort('change')}>
                Modification Status {getSortIcon('change')}
              </th>
              <th onClick={() => requestSort('file')}>
                File {getSortIcon('file')}
              </th>
              <th>Exact Change</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr key={index}>
                <td>{row.field}</td>
                <td style={{ color: getChangeColor(row.change) }}>{row.change}</td>
                <td>{row.file}</td>
                <td>
                  <Treebeard
                    data={treeData}
                    onToggle={handleToggle}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default MainContent;
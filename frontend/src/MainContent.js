import React, { useState, useMemo } from 'react';
import { Table } from 'react-bootstrap';

const MainContent = ({ data, downloadUrl }) => {
  const [sortConfig, setSortConfig] = useState(null);

  const sortedData = useMemo(() => {
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
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (!sortConfig) {
      return null;
    }
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? '▲' : '▼';
    }
    return null;
  };

  const getChangeColor = (change) => {
    switch (change) {
      case 'Added':
        return 'green';
      case 'Modified':
        return 'orange';
      case 'Deleted':
        return 'red';
      default:
        return 'black';
    }
  };

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
              <th onClick={() => requestSort('path')}>
                PermissionType {getSortIcon('path')}
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
                <td>{row.path}</td>
                <td style={{ color: getChangeColor(row.change) }}>{row.change}</td>
                <td>{row.file}</td>
                <td>{row.exactChange}</td> {/* Display Exact Change column */}
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default MainContent;
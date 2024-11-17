import React, { useState, useMemo } from 'react';
import { Table } from 'react-bootstrap';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

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

  const renderExactChange = (exactChange) => {
    if (typeof exactChange === 'object' && exactChange !== null) {
      return (
        <table>
          <tbody>
            {Object.entries(exactChange).map(([key, value]) => (
              <tr key={key}>
                <td><strong>{key}</strong></td>
                <td>{value.toString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    return exactChange ? JSON.stringify(exactChange) : 'N/A';
  };

  const renderValueAsTable = (value) => {
    if (typeof value === 'object' && value !== null) {
      return (
        <table>
          <tbody>
            {Object.entries(value).map(([key, val]) => (
              <tr key={key}>
                <td><strong>{key}</strong></td>
                <td>{val.toString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    return value ? JSON.stringify(value) : 'N/A';
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["PermissionType", "Path", "Modification Status", "TRV Value", "PassPort Value"];
    const tableRows = [];

    sortedData.forEach(row => {
      const rowData = [
        row.permissionType,
        row.path,
        row.change,
        JSON.stringify(row.trvValue),
        JSON.stringify(row.passPortValue)
      ];
      tableRows.push(rowData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 7, cellPadding: 1 },
      headStyles: { fillColor: [22, 160, 133] },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 45 },
        2: { cellWidth: 35 },
        3: { cellWidth: 35 },
        4: { cellWidth: 35 }
      },
      margin: { top: 20, left: 5, right: 5 },
      theme: 'grid'
    });

    doc.save('table.pdf');
  };

  return (
    <div className="main-content">
      {downloadUrl && (
        <a href={downloadUrl} download="changes.xlsx" className="btn btn-success mb-3">
          Download Result
        </a>
      )}
      <button onClick={exportToPDF} className="btn btn-primary mb-3">
        Export to PDF
      </button>
      {data && data.length > 0 && (
        <Table striped bordered hover id="data-table">
          <thead>
            <tr>
              <th onClick={() => requestSort('permissionType')}>
                PermissionType {getSortIcon('permissionType')}
              </th>
              <th onClick={() => requestSort('path')}>
                Path {getSortIcon('path')}
              </th>
              <th onClick={() => requestSort('change')}>
                Modification Status {getSortIcon('change')}
              </th>
              <th>TRV Value</th>
              <th>PassPort Value</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr key={index}>
                <td>{row.permissionType}</td>
                <td>{row.path}</td>
                <td style={{ color: getChangeColor(row.change) }}>{row.change}</td>
                <td>{renderValueAsTable(row.trvValue)}</td>
                <td>{renderValueAsTable(row.passPortValue)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default MainContent;
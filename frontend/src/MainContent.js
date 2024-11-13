import React from 'react';
import { Table } from 'react-bootstrap';

const MainContent = ({ data, downloadUrl }) => {
  console.log('Received Data:', data); // Log the received data

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
              <th>Field</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                <td>{row.field}</td>
                <td>{row.change}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default MainContent;
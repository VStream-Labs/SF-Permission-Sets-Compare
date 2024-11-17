import React from 'react';
import { Form, Button } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';

const SidePanel = ({ handleFileChange, handleCompare, toggleSidePanel }) => {
  return (
    <div className="side-panel">
      <div className="close-icon" onClick={toggleSidePanel}>
        <FaTimes />
      </div>
      <Form>
        <Form.Group>
          <Form.Label>Upload Permission Set Files (Set 1)</Form.Label>
          <Form.Control type="file" multiple onChange={(e) => handleFileChange(e, 'set1')} />
        </Form.Group>
        <Form.Group>
          <Form.Label>Upload Permission Set Files (Set 2)</Form.Label>
          <Form.Control type="file" multiple onChange={(e) => handleFileChange(e, 'set2')} />
        </Form.Group>
        <Button variant="primary" onClick={handleCompare}>
          Compare
        </Button>
      </Form>
    </div>
  );
};

export default SidePanel;
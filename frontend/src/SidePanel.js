import React from 'react';
import { Form, Button } from 'react-bootstrap';

const SidePanel = ({ handleFileChange, handleCompare }) => {
  return (
    <div className="side-panel">
      <Form>
        <Form.Group>
          <Form.Label>Upload Permission Set Files</Form.Label>
          <Form.Control type="file" multiple onChange={handleFileChange} />
        </Form.Group>
        <Button variant="primary" onClick={handleCompare}>
          Compare
        </Button>
      </Form>
    </div>
  );
};

export default SidePanel;
import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
  const [files, setFiles] = useState([]);
  const [downloadUrl, setDownloadUrl] = useState('');

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleCompare = async () => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const response = await axios.post('http://localhost:5000/compare', formData, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setDownloadUrl(url);
    } catch (error) {
      console.error('Error comparing files:', error);
    }
  };

  return (
    <div>
      <h1>Compare Permission Sets</h1>
      <input type="file" multiple onChange={handleFileChange} />
      <button onClick={handleCompare}>Compare</button>
      {downloadUrl && (
        <a href={downloadUrl} download="changes.xlsx">
          Download Result
        </a>
      )}
    </div>
  );
};

export default App;
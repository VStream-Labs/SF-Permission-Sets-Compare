import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavBar from './NavBar';
import SidePanel from './SidePanel';
import MainContent from './MainContent';
import './App.css';

const App = () => {
  const [files, setFiles] = useState([]);
  const [data, setData] = useState([]);
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
      const response = await axios.post('http://localhost:5000/compare', formData);
      console.log('Response Data:', response.data); // Log the response data

      const changesArray = response.data.changes.map((change) => ({
        path: change.path,
        change: change.change,
        file: change.file,
      }));
      console.log('Transformed Data:', changesArray); // Log the transformed data

      setDownloadUrl(response.data.downloadUrl);
      setData(changesArray);
    } catch (error) {
      console.error('Error comparing files:', error);
    }
  };

  return (
    <div className="App">
      <NavBar />
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-3">
            <SidePanel handleFileChange={handleFileChange} handleCompare={handleCompare} />
          </div>
          <div className="col-md-9">
            <MainContent data={data} downloadUrl={downloadUrl} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavBar from './NavBar';
import SidePanel from './SidePanel';
import MainContent from './MainContent';
import './App.css';

const App = () => {
  const [filesSet1, setFilesSet1] = useState([]);
  const [filesSet2, setFilesSet2] = useState([]);
  const [data, setData] = useState([]);
  const [downloadUrl, setDownloadUrl] = useState('');

  const handleFileChange = (e, set) => {
    if (set === 'set1') {
      setFilesSet1(e.target.files);
    } else if (set === 'set2') {
      setFilesSet2(e.target.files);
    }
  };

  const handleCompare = async () => {
    const formData = new FormData();
    for (let i = 0; i < filesSet1.length; i++) {
      formData.append('filesSet1', filesSet1[i]);
    }
    for (let i = 0; i < filesSet2.length; i++) {
      formData.append('filesSet2', filesSet2[i]);
    }

    try {
      const response = await axios.post('http://localhost:5000/compare', formData);
      console.log('Response Data:', response.data); // Log the response data

      const changesArray = Object.entries(response.data.changes).map(([field, { change, file }]) => ({
        field,
        change,
        file,
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
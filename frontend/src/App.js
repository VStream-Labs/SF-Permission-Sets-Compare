import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavBar from './NavBar';
import SidePanel from './SidePanel';
import MainContent from './MainContent';
import { FaBars, FaTimes } from 'react-icons/fa';
import './App.css';

const App = () => {
  const [filesSet1, setFilesSet1] = useState([]);
  const [filesSet2, setFilesSet2] = useState([]);
  const [data, setData] = useState([]);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [sidePanelVisible, setSidePanelVisible] = useState(false); // Side panel closed by default

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

      const changesArray = response.data.changes.map((change) => ({
        permissionType: change.permissionType || 'N/A', // Ensure permissionType is set
        path: change.key || 'N/A', // Ensure path is set
        change: change.type || 'N/A', // Ensure change is set
        trvValue: change.oldValue || 'N/A',
        passPortValue: change.newValue || 'N/A',
      }));
      console.log('Transformed Data:', changesArray); // Log the transformed data

      setDownloadUrl(response.data.downloadUrl);
      setData(changesArray);
    } catch (error) {
      console.error('Error comparing files:', error);
    }
  };

  const toggleSidePanel = () => {
    setSidePanelVisible(!sidePanelVisible);
  };

  return (
    <div className="App">
      <NavBar toggleSidePanel={toggleSidePanel} sidePanelVisible={sidePanelVisible} />
      <div className="container-fluid">
        <div className="row">
          {sidePanelVisible && (
            <div className="col-md-3">
              <SidePanel
                handleFileChange={handleFileChange}
                handleCompare={handleCompare}
                toggleSidePanel={toggleSidePanel}
              />
            </div>
          )}
          <div className={`col-md-${sidePanelVisible ? '9' : '12'}`}>
            <MainContent data={data} downloadUrl={downloadUrl} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
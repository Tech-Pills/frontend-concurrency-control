import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

import { useSequentialUpload } from "./useCases/useSequentialUpload";
import { useBatchUpload } from "./useCases/useAsyncBatchUpload";
import { useState, useEffect } from "react";

interface UploadResult {
  id: number;
  algorithm: 'Sequential' | 'Batch (Async)';
  runTime: number;
  percentageFaster: string | null;
  timestamp: string;
}

function App() {
  const [strategy, setStrategy] = useState<'sequential' | 'batch'>('sequential');
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  
  const sequential = useSequentialUpload();
  const batch = useBatchUpload();
  
  const current = strategy === 'sequential' ? sequential : batch;

  useEffect(() => {
    if (sequential.runTime) {
      const runTimeMs = parseFloat(sequential.runTime);
      const lastResult = uploadResults[uploadResults.length - 1];
      const percentageFaster = lastResult 
        ? ((lastResult.runTime - runTimeMs) / lastResult.runTime * 100).toFixed(1) + '%'
        : null;

      setUploadResults(prev => [...prev, {
        id: prev.length + 1,
        algorithm: 'Sequential',
        runTime: runTimeMs,
        percentageFaster,
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  }, [sequential.runTime]);

  useEffect(() => {
    if (batch.runTime) {
      const runTimeMs = parseFloat(batch.runTime);
      const lastResult = uploadResults[uploadResults.length - 1];
      const percentageFaster = lastResult 
        ? ((lastResult.runTime - runTimeMs) / lastResult.runTime * 100).toFixed(1) + '%'
        : null;

      setUploadResults(prev => [...prev, {
        id: prev.length + 1,
        algorithm: 'Batch (Async)',
        runTime: runTimeMs,
        percentageFaster,
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  }, [batch.runTime]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList && fileList.length > 0) {
      const selectedFiles = Array.from(fileList);
      sequential.setFiles(selectedFiles);
      batch.setFiles(selectedFiles);
    }
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
        <a href="https://aws.amazon.com/s3/" target="_blank">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/b/bc/Amazon-S3-Logo.svg"
            className="logo aws"
            alt="AWS S3 logo"
          />
        </a>
      </div>
      <h1>Frontend Concurrency Control</h1>

      <div className="card">
        <input
          id="file-upload"
          type="file"
          multiple
          onChange={handleFileChange}
        />

        {current.files.length > 0 && (
          <div>
            <div>
              <label>
                <input
                  type="radio"
                  value="sequential"
                  checked={strategy === 'sequential'}
                  onChange={(e) => setStrategy(e.target.value as 'sequential' | 'batch')}
                />
                Sequential Upload
              </label>
              <label style={{ marginLeft: '1rem' }}>
                <input
                  type="radio"
                  value="batch"
                  checked={strategy === 'batch'}
                  onChange={(e) => setStrategy(e.target.value as 'sequential' | 'batch')}
                />
                Batch Upload (Async)
              </label>
            </div>
            
            {uploadResults.length > 0 && (
              <div style={{ margin: '1rem 0' }}>
                <h4>Upload Performance Results:</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem' }}>
                  <thead>
                    <tr>
                      <th>Run #</th>
                      <th>Algorithm</th>
                      <th>Time (ms)</th>
                      <th>vs Previous</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadResults.map((result) => (
                      <tr key={result.id}>
                        <td>{result.id}</td>
                        <td>{result.algorithm}</td>
                        <td>{result.runTime.toFixed(2)}</td>
                        <td style={{
                          color: result.percentageFaster ? (result.percentageFaster.startsWith('-') ? 'red' : 'green') : 'gray'
                        }}>
                          {result.percentageFaster ? 
                            (result.percentageFaster.startsWith('-') ? 
                              `${result.percentageFaster.substring(1)} slower` : 
                              `${result.percentageFaster} faster`
                            ) : 
                            'First run'
                          }
                        </td>
                        <td>{result.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <button
              type="button"
              onClick={strategy === 'sequential' ? sequential.handleSequentialUpload : batch.handleAsyncBatchUpload}
              disabled={current.isUploading}
            >
              {current.isUploading ? "Uploading..." : `Upload ${strategy === 'sequential' ? 'Sequentially' : 'in Batches'}`}
            </button>
            
            <button 
              type="button" 
              onClick={() => {
                sequential.resetUploads();
                batch.resetUploads();
                setUploadResults([]);
              }}
            >
              Reset All
            </button>
          </div>
        )}
      </div>

      {current.files.length > 0 && (
        <div className="card">
          <h3>Selected Files ({current.files.length}):</h3>
          {current.files.map((f, index) => (
            <p key={index}>{f.name}</p>
          ))}
        </div>
      )}
    </>
  );
}

export default App;

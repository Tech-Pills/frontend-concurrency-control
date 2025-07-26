import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

import { useSequentialUpload } from "./useCases/useSequentialUpload";

function App() {
  const { files, setFiles, handleSequentialUpload, resetUploads } =
    useSequentialUpload();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList && fileList.length > 0) {
      const selectedFiles = Array.from(fileList);
      setFiles(selectedFiles);
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

        {files.length > 0 && (
          <div>
            <button
              type="button"
              onClick={handleSequentialUpload}
            >
              Upload Sequentially
            </button>
            <button type="button" onClick={resetUploads}>
              Reset
            </button>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="card">
          <h3>Selected Files ({files.length}):</h3>
          {files.map((f, index) => (
            <p key={index}>{f.name}</p>
          ))}
        </div>
      )}
    </>
  );
}

export default App;

import React, { useState } from 'react';
import './App.css';
import FileUploader from './components/FileUploader';
import FileInterpreter from './components/FileInterpreter';
import ResultView from './components/ResultView';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [interpretedData, setInterpretedData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    setInterpretedData(null);
  };

  const handleInterpretation = (data: any) => {
    setInterpretedData(data);
    setIsLoading(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AutoCAD 도면 HWP 해석기</h1>
        <p>AutoCAD 도면을 HWP로 변환하고 해석하는 애플리케이션</p>
      </header>
      <main className="App-main">
        <FileUploader onFileUpload={handleFileUpload} />
        {file && (
          <FileInterpreter 
            file={file} 
            onInterpretationComplete={handleInterpretation}
            setIsLoading={setIsLoading}
          />
        )}
        {isLoading && <div className="loader">해석 중...</div>}
        {interpretedData && <ResultView data={interpretedData} />}
      </main>
      <footer className="App-footer">
        <p>© 2025 AutoCAD-HWP 인터프리터</p>
      </footer>
    </div>
  );
}

export default App;

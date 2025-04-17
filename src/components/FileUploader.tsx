import React, { useState, useRef } from 'react';
import '../styles/FileUploader.css';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload }) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      validateAndUploadFile(e.target.files[0]);
    }
  };

  const validateAndUploadFile = (file: File) => {
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.dwg') || fileName.endsWith('.hwp')) {
      onFileUpload(file);
    } else {
      alert('지원되지 않는 파일 형식입니다. .dwg 또는 .hwp 파일만 업로드해주세요.');
    }
  };

  const onButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className="file-uploader-container">
      <h2>파일 업로드</h2>
      <div 
        className={`file-uploader ${dragActive ? "drag-active" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          ref={inputRef}
          type="file" 
          className="input-file-upload"
          onChange={handleChange}
          accept=".dwg,.hwp"
        />
        <div className="file-upload-label">
          <p>AutoCAD(.dwg) 또는 HWP 파일을 여기에 드래그 앤 드롭하세요</p>
          <p>또는</p>
          <button className="upload-button" onClick={onButtonClick}>
            파일 선택
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploader; 
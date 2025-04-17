import React, { useEffect } from 'react';
import '../styles/FileInterpreter.css';
import { InterpreterService } from '../utils/interpreterService';

interface FileInterpreterProps {
  file: File;
  onInterpretationComplete: (data: any) => void;
  setIsLoading: (isLoading: boolean) => void;
}

const FileInterpreter: React.FC<FileInterpreterProps> = ({ 
  file, 
  onInterpretationComplete,
  setIsLoading 
}) => {
  useEffect(() => {
    const interpreterService = new InterpreterService();
    
    const interpretFile = async () => {
      setIsLoading(true);
      
      try {
        const result = await interpreterService.interpretFile(file);
        onInterpretationComplete(result);
      } catch (error) {
        console.error('파일 해석 중 오류가 발생했습니다:', error);
        setIsLoading(false);
        alert('파일 해석 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    };

    interpretFile();
  }, [file, onInterpretationComplete, setIsLoading]);

  return (
    <div className="file-interpreter-container">
      <h2>파일 해석 중</h2>
      <p>파일명: {file.name}</p>
      <p>파일 크기: {(file.size / 1024).toFixed(2)} KB</p>
    </div>
  );
};

export default FileInterpreter; 
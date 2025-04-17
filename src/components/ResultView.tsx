import React from 'react';
import '../styles/ResultView.css';
import { saveAs } from 'file-saver';

// 타입 정의
interface InterpretationResult {
  fileType: 'AutoCAD' | 'HWP';
  fileName: string;
  fileSize: number;
  interpretation?: string;
}

interface AutoCADData extends InterpretationResult {
  fileType: 'AutoCAD';
  analysis: {
    totalElements: number;
    layers: string[];
    dimensions: {
      width: number;
      height: number;
    };
  };
  elements: Array<{
    type: string;
    layer: string;
    coordinates?: [number, number][];
    center?: [number, number];
    radius?: number;
    content?: string;
    position?: [number, number];
  }>;
}

interface HWPData extends InterpretationResult {
  fileType: 'HWP';
  analysis: {
    pageCount: number;
    charCount: number;
    imageCount: number;
  };
  content: {
    title: string;
    sections: Array<{
      type: 'text' | 'table' | 'image';
      content?: string;
      rows?: number;
      columns?: number;
      description?: string;
    }>;
  };
}

// InterpreterService 클래스 정의
class InterpreterService {
  async exportToPDF(data: InterpretationResult): Promise<Blob> {
    // PDF 생성 로직 (실제 구현체는 여기에 들어갈 것)
    return new Blob(['PDF 내용'], { type: 'application/pdf' });
  }

  async exportToReport(data: InterpretationResult): Promise<Blob> {
    // 보고서 생성 로직 (실제 구현체는 여기에 들어갈 것)
    return new Blob(['보고서 내용'], { type: 'text/plain' });
  }
}

interface ResultViewProps {
  data: InterpretationResult;
}

// 타입 가드 함수들
const isAutoCADData = (data: InterpretationResult): data is AutoCADData => {
  return data.fileType === 'AutoCAD';
};

const isHWPData = (data: InterpretationResult): data is HWPData => {
  return data.fileType === 'HWP';
};

const ResultView: React.FC<ResultViewProps> = ({ data }) => {
  const isAutoCAD = isAutoCADData(data);
  const interpreterService = new InterpreterService();
  
  const handleExportToPDF = async () => {
    try {
      const pdfBlob = await interpreterService.exportToPDF(data);
      saveAs(pdfBlob, `${data.fileName.split('.')[0]}_report.pdf`);
    } catch (error) {
      console.error('PDF 내보내기 중 오류가 발생했습니다:', error);
      alert('PDF 내보내기에 실패했습니다.');
    }
  };
  
  const handleGenerateReport = async () => {
    try {
      const reportBlob = await interpreterService.exportToReport(data);
      
      // 생성된 보고서가 비어있는지 확인
      if (reportBlob.size === 0) {
        throw new Error('생성된 보고서가 비어 있습니다.');
      }
      
      saveAs(reportBlob, `${data.fileName.split('.')[0]}_report.txt`);
    } catch (error) {
      console.error('보고서 생성 중 오류가 발생했습니다:', error);
      alert('보고서 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };
  
  // 일반인을 위한 해석 렌더링
  const renderInterpretation = () => {
    if (!data.interpretation) return null;
    
    return (
      <div className="interpretation">
        <h4>일반인을 위한 해석</h4>
        <div className="interpretation-content">
          {data.interpretation}
        </div>
      </div>
    );
  };
  
  const renderAutoCADData = () => {
    if (!isAutoCADData(data)) return null;
    
    return (
      <div className="autocad-data">
        <h3>AutoCAD 도면 분석 결과</h3>
        
        <div className="file-info">
          <p><strong>파일명:</strong> {data.fileName}</p>
          <p><strong>파일 크기:</strong> {(data.fileSize / 1024).toFixed(2)} KB</p>
        </div>
        
        <div className="elements-info">
          <h4>도면 요소</h4>
          <p><strong>총 요소 수:</strong> {data.analysis.totalElements}</p>
          <p><strong>레이어:</strong> {data.analysis.layers.join(', ')}</p>
          <p><strong>크기:</strong> {data.analysis.dimensions.width} x {data.analysis.dimensions.height}</p>
        </div>
        
        {renderInterpretation()}
        
        <div className="elements-list">
          <h4>요소 목록</h4>
          <ul>
            {data.elements.map((element, index) => (
              <li key={index}>
                <strong>{element.type}</strong>: 
                {element.type === 'line' && element.coordinates && ` 선 (${element.coordinates[0].join(',')} - ${element.coordinates[1].join(',')})`}
                {element.type === 'circle' && element.center && element.radius && ` 원 (중심: ${element.center.join(',')}, 반지름: ${element.radius})`}
                {element.type === 'text' && element.content && element.position && ` 텍스트 "${element.content}" (위치: ${element.position.join(',')})`}
                {` (레이어: ${element.layer})`}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="actions">
          <button className="action-button" onClick={handleExportToPDF}>PDF로 내보내기</button>
          <button className="action-button" onClick={handleGenerateReport}>보고서 생성</button>
        </div>
      </div>
    );
  };
  
  const renderHWPData = () => {
    if (!isHWPData(data)) return null;
    
    return (
      <div className="hwp-data">
        <h3>HWP 문서 분석 결과</h3>
        
        <div className="file-info">
          <p><strong>파일명:</strong> {data.fileName}</p>
          <p><strong>파일 크기:</strong> {(data.fileSize / 1024).toFixed(2)} KB</p>
        </div>
        
        <div className="content-info">
          <h4>문서 내용</h4>
          <p><strong>제목:</strong> {data.content.title}</p>
          <p><strong>페이지 수:</strong> {data.analysis.pageCount}</p>
          <p><strong>글자 수:</strong> {data.analysis.charCount}</p>
          <p><strong>이미지 수:</strong> {data.analysis.imageCount}</p>
        </div>
        
        {renderInterpretation()}
        
        <div className="content-sections">
          <h4>섹션 목록</h4>
          <ul>
            {data.content.sections.map((section, index) => (
              <li key={index}>
                <strong>{section.type === 'text' ? '텍스트' : section.type === 'table' ? '표' : '이미지'}</strong>: 
                {section.type === 'text' && section.content && ` ${section.content}`}
                {section.type === 'table' && section.rows && section.columns && ` ${section.rows}x${section.columns} 표`}
                {section.type === 'image' && section.description && ` ${section.description}`}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="actions">
          <button className="action-button" onClick={handleExportToPDF}>PDF로 내보내기</button>
          <button className="action-button" onClick={handleGenerateReport}>보고서 생성</button>
        </div>
      </div>
    );
  };

  return (
    <div className="result-view-container">
      <h2>해석 결과</h2>
      {isAutoCAD ? renderAutoCADData() : renderHWPData()}
    </div>
  );
};

export default ResultView; 
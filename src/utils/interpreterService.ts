/**
 * AutoCAD 및 HWP 파일 해석 서비스
 */
import { getFileExtension } from './fileUtils';

/**
 * AutoCAD 파일 해석 인터페이스
 */
export interface AutoCADData {
  fileType: 'AutoCAD';
  fileName: string;
  fileSize: number;
  elements: AutoCADElement[];
  analysis: {
    totalElements: number;
    layers: string[];
    dimensions: {
      width: number;
      height: number;
    };
  };
  interpretation?: string; // 일반인을 위한 해석
}

/**
 * AutoCAD 요소 인터페이스
 */
export type AutoCADElement = 
  | { type: 'line'; coordinates: [number, number][]; layer: string }
  | { type: 'circle'; center: [number, number]; radius: number; layer: string }
  | { type: 'text'; content: string; position: [number, number]; layer: string };

/**
 * HWP 파일 해석 인터페이스
 */
export interface HWPData {
  fileType: 'HWP';
  fileName: string;
  fileSize: number;
  content: {
    title: string;
    sections: HWPSection[];
  };
  analysis: {
    pageCount: number;
    charCount: number;
    imageCount: number;
  };
  interpretation?: string; // 일반인을 위한 해석
}

/**
 * HWP 섹션 인터페이스
 */
export type HWPSection = 
  | { type: 'text'; content: string }
  | { type: 'table'; rows: number; columns: number; data: any[] }
  | { type: 'image'; description: string };

/**
 * 파일 해석 결과 타입
 */
export type InterpretationResult = AutoCADData | HWPData;

/**
 * 파일 해석 서비스
 */
export class InterpreterService {
  /**
   * 파일 해석 메서드
   * @param file 해석할 파일
   * @returns Promise<InterpretationResult>
   */
  public async interpretFile(file: File): Promise<InterpretationResult> {
    const fileExtension = getFileExtension(file.name);
    
    if (fileExtension === 'dwg') {
      return this.interpretAutoCADFile(file);
    } else if (fileExtension === 'hwp') {
      return this.interpretHWPFile(file);
    } else {
      throw new Error('지원되지 않는 파일 형식입니다.');
    }
  }
  
  /**
   * AutoCAD 파일 해석
   * @param file AutoCAD 파일
   * @returns Promise<AutoCADData>
   */
  private async interpretAutoCADFile(file: File): Promise<AutoCADData> {
    // 실제 구현에서는 CAD 파일 해석 라이브러리 사용
    // 현재는 예시 데이터 반환
    
    return new Promise((resolve) => {
      // 해석 시간 시뮬레이션
      setTimeout(() => {
        // 예시 데이터
        const elements = [
          { type: 'line', coordinates: [[0, 0], [100, 100]], layer: 'Layer1' },
          { type: 'circle', center: [50, 50], radius: 30, layer: 'Layer2' },
          { type: 'text', content: '도면 제목', position: [20, 80], layer: 'Title' },
          { type: 'line', coordinates: [[0, 100], [100, 0]], layer: 'Layer1' },
          { type: 'circle', center: [25, 75], radius: 15, layer: 'Layer2' }
        ] as AutoCADElement[];
        
        // 일반인을 위한 해석 생성
        const interpretation = this.generateAutoCADInterpretation(elements);
        
        const dummyData: AutoCADData = {
          fileType: 'AutoCAD',
          fileName: file.name,
          fileSize: file.size,
          elements: elements,
          analysis: {
            totalElements: elements.length,
            layers: ['Layer1', 'Layer2', 'Title'],
            dimensions: { width: 100, height: 100 }
          },
          interpretation: interpretation
        };
        
        resolve(dummyData);
      }, 2000);
    });
  }
  
  /**
   * 일반인을 위한 AutoCAD 도면 해석 생성
   * @param elements AutoCAD 요소 배열
   * @returns 이해하기 쉬운 해석 텍스트
   */
  private generateAutoCADInterpretation(elements: AutoCADElement[]): string {
    // 요소 타입별 개수 계산
    const elementTypes = elements.reduce((acc, curr) => {
      acc[curr.type] = (acc[curr.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // 레이어별 요소 개수 - 레이어별로 요소를 그룹화하여 분석에 활용
    const layerGroups = elements.reduce((acc, curr) => {
      if (!acc[curr.layer]) {
        acc[curr.layer] = [];
      }
      acc[curr.layer].push(curr);
      return acc;
    }, {} as Record<string, AutoCADElement[]>);
    
    // 텍스트 요소 추출
    const textElements = elements.filter(e => e.type === 'text') as {
      type: 'text';
      content: string;
      position: [number, number];
      layer: string;
    }[];
    
    // 선 요소 분석 - 수직/수평 선 구분 및 길이 계산
    const lineElements = elements.filter(e => e.type === 'line') as {
      type: 'line';
      coordinates: [number, number][];
      layer: string;
    }[];
    
    // 수직/수평선 분류 및 길이 계산
    const horizontalLines: {line: typeof lineElements[0], length: number}[] = [];
    const verticalLines: {line: typeof lineElements[0], length: number}[] = [];
    let maxHorizontalLength = 0;
    let maxVerticalLength = 0;
    
    lineElements.forEach(line => {
      const [[x1, y1], [x2, y2]] = line.coordinates;
      const isHorizontal = Math.abs(y2 - y1) < 0.1; // 거의 수평인 선
      const isVertical = Math.abs(x2 - x1) < 0.1; // 거의 수직인 선
      
      if (isHorizontal) {
        const length = Math.abs(x2 - x1);
        horizontalLines.push({line, length});
        maxHorizontalLength = Math.max(maxHorizontalLength, length);
      } else if (isVertical) {
        const length = Math.abs(y2 - y1);
        verticalLines.push({line, length});
        maxVerticalLength = Math.max(maxVerticalLength, length);
      }
    });
    
    // 원 요소 분석
    const circleElements = elements.filter(e => e.type === 'circle') as {
      type: 'circle';
      center: [number, number];
      radius: number;
      layer: string;
    }[];
    
    // 가장 큰 원과 작은 원 찾기
    let minRadius = Infinity, maxRadius = 0;
    if (circleElements.length > 0) {
      minRadius = Math.min(...circleElements.map(c => c.radius));
      maxRadius = Math.max(...circleElements.map(c => c.radius));
    }
    
    // 근접한 요소 그룹화하여 구조 파악
    const structures = this.identifyStructures(elements);
    
    // 해석 시작 - 도면의 전체적인 특성 설명
    let interpretation = '이 도면은 ';
    
    // 도면 종류 추정
    let buildingType = '알 수 없는 형태의';
    
    if (textElements.some(t => 
        t.content.toLowerCase().includes('plan') || 
        t.content.includes('평면도') || 
        t.content.includes('설계도'))) {
      buildingType = '건축물의 평면';
    } else if (textElements.some(t => 
        t.content.toLowerCase().includes('elevation') || 
        t.content.includes('입면도'))) {
      buildingType = '건축물의 입면';
    } else if (textElements.some(t => 
        t.content.toLowerCase().includes('section') || 
        t.content.includes('단면도'))) {
      buildingType = '건축물의 단면';
    } else if (horizontalLines.length > 10 && verticalLines.length > 10) {
      // 수평선과 수직선이 많으면 건축 평면도일 가능성이 높음
      buildingType = '직각 구조의 건축물 평면';
    } else if (circleElements.length > (lineElements.length / 2)) {
      // 원이 선보다 많으면 기계 도면일 가능성이 높음
      buildingType = '기계 부품 또는 설비';
    }
    
    interpretation += `${buildingType} 도면으로, `;
    
    // 크기 추정 (단위 가정: 미터)
    interpretation += `약 ${maxHorizontalLength.toFixed(1)} x ${maxVerticalLength.toFixed(1)} 단위(일반적으로 미터)의 크기를 가지고 있습니다. `;
    
    // 도면 구성 요소 설명
    interpretation += `이 도면은 총 ${elements.length}개의 요소로 구성되어 있으며, `;
    
    const elementDescription = [];
    if (elementTypes.line) elementDescription.push(`${elementTypes.line}개의 선`);
    if (elementTypes.circle) elementDescription.push(`${elementTypes.circle}개의 원형 요소`);
    if (elementTypes.text) elementDescription.push(`${elementTypes.text}개의 텍스트`);
    
    interpretation += elementDescription.join(', ') + '를 포함하고 있습니다. ';
    
    // 레이어 정보 설명
    const layerCount = Object.keys(layerGroups).length;
    interpretation += `도면은 ${layerCount}개의 레이어로 구성되어 있으며, `;
    
    // 주요 레이어 정보 (상위 3개)
    const mainLayers = Object.entries(layerGroups)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 3)
      .map(([name, elements]) => `'${name}'(${elements.length}개 요소)`);
    
    if (mainLayers.length > 0) {
      interpretation += `주요 레이어는 ${mainLayers.join(', ')}입니다. `;
    }
    
    // 구조적 특징 설명
    if (structures.rooms.length > 0) {
      interpretation += `\n\n이 도면에서는 약 ${structures.rooms.length}개의 방(또는 구획된 공간)이 확인됩니다. `;
      
      // 방 크기 정보 제공
      if (structures.rooms.length > 0) {
        const roomSizes = structures.rooms.map(room => ({
          width: room.width.toFixed(1),
          height: room.height.toFixed(1),
          area: (room.width * room.height).toFixed(1)
        }));
        
        // 가장 큰 방과 작은 방 정보
        roomSizes.sort((a, b) => parseFloat(b.area) - parseFloat(a.area));
        
        interpretation += `가장 큰 공간은 ${roomSizes[0].width} x ${roomSizes[0].height} 단위(약 ${roomSizes[0].area} 제곱단위)이며, `;
        
        if (roomSizes.length > 1) {
          interpretation += `가장 작은 공간은 ${roomSizes[roomSizes.length-1].width} x ${roomSizes[roomSizes.length-1].height} 단위(약 ${roomSizes[roomSizes.length-1].area} 제곱단위)입니다. `;
        }
      }
    }
    
    // 도면 내 텍스트 정보 추가
    if (textElements.length > 0) {
      interpretation += `\n\n도면에 포함된 주요 텍스트 정보: `;
      const importantTexts = textElements
        .filter(t => t.content.trim().length > 1) // 의미 있는 텍스트만 필터링
        .map(t => `"${t.content}"`)
        .slice(0, 5) // 최대 5개까지만 표시
        .join(', ');
      
      interpretation += importantTexts + `. `;
      
      // 치수 텍스트 추출 시도
      const dimensionTexts = textElements.filter(t => 
        /\d+(\.\d+)?(\s*[xX×]\s*\d+(\.\d+)?)?/.test(t.content) || // 숫자x숫자 형태
        /\d+(\.\d+)?\s*(mm|cm|m|인치|ft)/.test(t.content) // 단위가 포함된 숫자
      );
      
      if (dimensionTexts.length > 0) {
        interpretation += `\n\n도면에서 발견된 치수 정보: ${dimensionTexts.map(t => `"${t.content}"`).join(', ')}. `;
      }
    }
    
    // 도면의 용도 추정
    interpretation += `\n\n이 도면의 추정 용도: `;
    
    if (textElements.some(t => t.content.toLowerCase().includes('floor plan') || t.content.includes('평면도'))) {
      interpretation += '이 도면은 건물의 평면도로, 방의 배치와 크기를 보여줍니다. ';
    } else if (textElements.some(t => t.content.toLowerCase().includes('elevation') || t.content.includes('입면'))) {
      interpretation += '이 도면은 건물의 입면도로, 건물의 외관과 높이를 보여줍니다. ';
    } else if (circleElements.length > lineElements.length / 2) {
      interpretation += '이 도면은 기계 부품 또는 공학적 설계도로, 원형 구성요소가 많은 것이 특징입니다. ';
    } else if (horizontalLines.length > 5 && verticalLines.length > 5 && structures.rooms.length > 2) {
      interpretation += '이 도면은 건축물의 평면도로, 여러 방과 공간이 구획되어 있습니다. ';
      
      // 평면도의 경우 추가 해석
      const roomCount = structures.rooms.length;
      const hasLargeRoom = structures.rooms.some(r => r.width * r.height > 20); // 20 제곱단위 이상을 큰 방으로 가정
      
      if (roomCount >= 4) {
        interpretation += '다수의 방이 있는 것으로 보아 주거용 건물이나 사무실 공간으로 추정됩니다. ';
      } else if (roomCount <= 3 && hasLargeRoom) {
        interpretation += '몇 개의 방과 큰 공간이 있는 것으로 보아 상업 공간이나 스튜디오 형태의 주거 공간으로 추정됩니다. ';
      }
    } else {
      interpretation += '이 도면은 구체적인 구조물이나 시스템의 설계도로 보입니다. 정확한 용도는 전문가의 확인이 필요합니다. ';
    }
    
    // 마무리 문구
    interpretation += `\n\n주의: 이 해석은 자동화된 분석 결과이며, 정확한 도면 해석을 위해서는 전문가의 검토가 필요합니다.`;
    
    return interpretation;
  }
  
  /**
   * 도면 요소를 분석하여 구조적 특징 식별
   * @param elements AutoCAD 요소 배열
   * @returns 식별된 구조적 특징
   */
  private identifyStructures(elements: AutoCADElement[]): {
    rooms: Array<{x: number, y: number, width: number, height: number}>;
    corridors: Array<{x1: number, y1: number, x2: number, y2: number, width: number}>;
  } {
    // 선 요소만 추출
    const lineElements = elements.filter(e => e.type === 'line') as {
      type: 'line';
      coordinates: [number, number][];
      layer: string;
    }[];
    
    // 수직선과 수평선 분류
    const horizontalLines: {x1: number, y1: number, x2: number, y2: number}[] = [];
    const verticalLines: {x1: number, y1: number, x2: number, y2: number}[] = [];
    
    lineElements.forEach(line => {
      const [[x1, y1], [x2, y2]] = line.coordinates;
      
      // 수평선 (y좌표가 거의 같은 선)
      if (Math.abs(y2 - y1) < 0.1) {
        horizontalLines.push({
          x1: Math.min(x1, x2),
          x2: Math.max(x1, x2),
          y1, 
          y2
        });
      } 
      // 수직선 (x좌표가 거의 같은 선)
      else if (Math.abs(x2 - x1) < 0.1) {
        verticalLines.push({
          x1,
          x2,
          y1: Math.min(y1, y2),
          y2: Math.max(y1, y2)
        });
      }
    });
    
    // 방(사각형) 감지 - 수직선과 수평선의 교차점을 이용
    const rooms: Array<{x: number, y: number, width: number, height: number}> = [];
    
    // 간단한 방 감지 알고리즘 (모든 조합을 확인하는 대신 근사치 방법 사용)
    for (let h1 = 0; h1 < horizontalLines.length; h1++) {
      for (let h2 = h1 + 1; h2 < horizontalLines.length; h2++) {
        // 두 수평선이 거의 평행하고 y좌표가 다른 경우
        if (Math.abs(horizontalLines[h1].y1 - horizontalLines[h2].y1) > 1) {
          for (let v1 = 0; v1 < verticalLines.length; v1++) {
            for (let v2 = v1 + 1; v2 < verticalLines.length; v2++) {
              // 두 수직선이 거의 평행하고 x좌표가 다른 경우
              if (Math.abs(verticalLines[v1].x1 - verticalLines[v2].x1) > 1) {
                // 네 선이 사각형을 형성하는지 확인
                const h1Line = horizontalLines[h1];
                const h2Line = horizontalLines[h2];
                const v1Line = verticalLines[v1];
                const v2Line = verticalLines[v2];
                
                // 교차점 확인 (완벽한 사각형 대신 근사치 확인)
                if (
                  this.linesOverlap(h1Line.x1, h1Line.x2, v1Line.x1, v1Line.x1) &&
                  this.linesOverlap(h1Line.x1, h1Line.x2, v2Line.x1, v2Line.x1) &&
                  this.linesOverlap(h2Line.x1, h2Line.x2, v1Line.x1, v1Line.x1) &&
                  this.linesOverlap(h2Line.x1, h2Line.x2, v2Line.x1, v2Line.x1) &&
                  this.linesOverlap(v1Line.y1, v1Line.y2, h1Line.y1, h1Line.y1) &&
                  this.linesOverlap(v1Line.y1, v1Line.y2, h2Line.y1, h2Line.y1) &&
                  this.linesOverlap(v2Line.y1, v2Line.y2, h1Line.y1, h1Line.y1) &&
                  this.linesOverlap(v2Line.y1, v2Line.y2, h2Line.y1, h2Line.y1)
                ) {
                  // 방 정보 추가
                  const x = Math.min(v1Line.x1, v2Line.x1);
                  const y = Math.min(h1Line.y1, h2Line.y1);
                  const width = Math.abs(v1Line.x1 - v2Line.x1);
                  const height = Math.abs(h1Line.y1 - h2Line.y1);
                  
                  // 최소 크기 이상인 경우만 방으로 간주
                  if (width > 1 && height > 1) {
                    // 중복 방 제거
                    const isDuplicate = rooms.some(room => 
                      Math.abs(room.x - x) < 0.5 && 
                      Math.abs(room.y - y) < 0.5 &&
                      Math.abs(room.width - width) < 0.5 &&
                      Math.abs(room.height - height) < 0.5
                    );
                    
                    if (!isDuplicate) {
                      rooms.push({x, y, width, height});
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    
    // 복도 감지 (긴 직사각형 형태)
    const corridors: Array<{x1: number, y1: number, x2: number, y2: number, width: number}> = [];
    rooms.forEach(room => {
      // 폭이 좁고 길이가 긴 방은 복도로 간주
      if ((room.width > room.height * 3 && room.height < 3) || 
          (room.height > room.width * 3 && room.width < 3)) {
        if (room.width > room.height) {
          corridors.push({
            x1: room.x,
            y1: room.y + room.height/2,
            x2: room.x + room.width,
            y2: room.y + room.height/2,
            width: room.height
          });
        } else {
          corridors.push({
            x1: room.x + room.width/2,
            y1: room.y,
            x2: room.x + room.width/2,
            y2: room.y + room.height,
            width: room.width
          });
        }
      }
    });
    
    return {
      rooms,
      corridors
    };
  }
  
  /**
   * 두 선분이 겹치는지 확인하는 유틸리티 함수
   */
  private linesOverlap(a1: number, a2: number, b1: number, b2: number): boolean {
    // 오차 범위
    const tolerance = 0.5;
    
    // a1과 a2 사이에 b1이나 b2가 있거나,
    // b1과 b2 사이에 a1이나 a2가 있으면 겹침
    return (
      (b1 >= a1 - tolerance && b1 <= a2 + tolerance) ||
      (b2 >= a1 - tolerance && b2 <= a2 + tolerance) ||
      (a1 >= b1 - tolerance && a1 <= b2 + tolerance) ||
      (a2 >= b1 - tolerance && a2 <= b2 + tolerance)
    );
  }
  
  /**
   * HWP 파일 해석
   * @param file HWP 파일
   * @returns Promise<HWPData>
   */
  private async interpretHWPFile(file: File): Promise<HWPData> {
    // 실제 구현에서는 HWP 파일 해석 라이브러리 사용
    // 현재는 예시 데이터 반환
    
    return new Promise((resolve) => {
      // 해석 시간 시뮬레이션
      setTimeout(() => {
        // 예시 섹션 데이터
        const sections = [
          { type: 'text', content: '한글 문서 텍스트 내용' },
          { type: 'table', rows: 3, columns: 4, data: [] },
          { type: 'image', description: '문서에 포함된 이미지' },
          { type: 'text', content: '추가 텍스트 내용입니다. 이 문서는 예시 데이터입니다.' }
        ] as HWPSection[];
        
        // 일반인을 위한 해석 생성
        const interpretation = this.generateHWPInterpretation(sections, '문서 제목');
        
        const dummyData: HWPData = {
          fileType: 'HWP',
          fileName: file.name,
          fileSize: file.size,
          content: {
            title: '문서 제목',
            sections: sections
          },
          analysis: {
            pageCount: 5,
            charCount: 2500,
            imageCount: 2
          },
          interpretation: interpretation
        };
        
        resolve(dummyData);
      }, 2000);
    });
  }
  
  /**
   * 일반인을 위한 HWP 문서 해석 생성
   * @param sections HWP 섹션 배열
   * @param title 문서 제목
   * @returns 이해하기 쉬운 해석 텍스트
   */
  private generateHWPInterpretation(sections: HWPSection[], title: string): string {
    // 섹션 타입별 개수 계산
    const sectionTypes = sections.reduce((acc, curr) => {
      acc[curr.type] = (acc[curr.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // 텍스트 섹션 내용 추출
    const textContents = sections
      .filter(s => s.type === 'text')
      .map(s => (s as {type: 'text', content: string}).content)
      .join(' ');
    
    let interpretation = `"${title}" 문서는 `;
    
    // 문서 구성 설명
    interpretation += `${sections.length}개의 섹션으로 구성되어 있으며, `;
    
    // 섹션 타입별 개수 설명
    const typeDescriptions = [];
    if (sectionTypes.text) typeDescriptions.push(`${sectionTypes.text}개의 텍스트 섹션`);
    if (sectionTypes.table) typeDescriptions.push(`${sectionTypes.table}개의 표`);
    if (sectionTypes.image) typeDescriptions.push(`${sectionTypes.image}개의 이미지`);
    
    interpretation += typeDescriptions.join(', ') + '을 포함하고 있습니다. ';
    
    // 주요 내용 요약 (간단하게)
    if (textContents.length > 0) {
      // 텍스트 길이에 따라 요약 방식 조정
      if (textContents.length < 200) {
        interpretation += `문서의 주요 내용은 "${textContents}"입니다. `;
      } else {
        const summary = textContents.substring(0, 100) + '...';
        interpretation += `문서의 주요 내용은 "${summary}" 등입니다. `;
      }
    }
    
    interpretation += '이 문서의 해석 결과는 간략한 요약이며, 전체 내용을 대체하지 않습니다.';
    
    return interpretation;
  }
  
  /**
   * 해석 결과를 PDF로 내보내기
   * @param data 해석 결과 데이터
   * @returns Promise<Blob> PDF 파일 Blob
   */
  public async exportToPDF(data: InterpretationResult): Promise<Blob> {
    try {
      // PDF 문서 생성 (실제로는 PDF 라이브러리를 사용해야 함)
      // HTML 형식으로 구성
      const isAutoCAD = data.fileType === 'AutoCAD';
      
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${data.fileName} - 해석 보고서</title>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
            h2 { color: #3498db; margin-top: 20px; }
            h3 { color: #2c3e50; margin-top: 15px; }
            .section { margin: 15px 0; padding: 15px; background-color: #f8f9fa; border-radius: 8px; }
            .info-item { margin: 8px 0; }
            .item-list { list-style-type: none; padding-left: 0; }
            .item-list li { margin: 10px 0; padding: 10px; background-color: #f0f0f0; border-left: 3px solid #3498db; }
            .interpretation { margin-top: 25px; padding: 15px; background-color: #e8f4fc; border-radius: 5px; border-left: 5px solid #3498db; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            table, th, td { border: 1px solid #ddd; }
            th, td { padding: 10px; text-align: left; }
            th { background-color: #f2f2f2; }
            .footer { margin-top: 30px; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h1>${data.fileName} - 해석 보고서</h1>
          <div class="section">
            <div class="info-item"><strong>파일명:</strong> ${data.fileName}</div>
            <div class="info-item"><strong>파일 크기:</strong> ${(data.fileSize / 1024).toFixed(2)} KB</div>
            <div class="info-item"><strong>파일 유형:</strong> ${data.fileType}</div>
            <div class="info-item"><strong>생성 날짜:</strong> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
          </div>
      `;
      
      if (isAutoCAD && 'elements' in data) {
        // AutoCAD 데이터 추가
        htmlContent += `
          <h2>AutoCAD 도면 분석 결과</h2>
          <div class="section">
            <div class="info-item"><strong>총 요소 수:</strong> ${data.analysis.totalElements}</div>
            <div class="info-item"><strong>레이어:</strong> ${data.analysis.layers.join(', ')}</div>
            <div class="info-item"><strong>크기:</strong> ${data.analysis.dimensions.width} x ${data.analysis.dimensions.height}</div>
          </div>
          
          <h2>요소 분석</h2>
          <table>
            <tr>
              <th>요소 유형</th>
              <th>개수</th>
              <th>주요 특징</th>
            </tr>
            <tr>
              <td>선 (Line)</td>
              <td>${data.elements.filter(e => e.type === 'line').length}</td>
              <td>구조적 프레임, 벽체, 경계선 등을 표현</td>
            </tr>
            <tr>
              <td>원 (Circle)</td>
              <td>${data.elements.filter(e => e.type === 'circle').length}</td>
              <td>기둥, 원형 구조물, 장치 등을 표현</td>
            </tr>
            <tr>
              <td>텍스트 (Text)</td>
              <td>${data.elements.filter(e => e.type === 'text').length}</td>
              <td>라벨, 치수, 주석 정보를 표현</td>
            </tr>
          </table>
          
          <h2>요소 목록</h2>
          <ul class="item-list">
        `;
        
        // 요소 목록 추가 (최대 15개까지만)
        const maxElements = Math.min(data.elements.length, 15);
        for (let i = 0; i < maxElements; i++) {
          const element = data.elements[i];
          let details = '';
          
          if (element.type === 'line') {
            details = `선 (${element.coordinates[0].join(',')} - ${element.coordinates[1].join(',')})`;
          } else if (element.type === 'circle') {
            details = `원 (중심: ${element.center.join(',')}, 반지름: ${element.radius})`;
          } else if (element.type === 'text') {
            details = `텍스트 "${element.content}" (위치: ${element.position.join(',')})`;
          }
          
          htmlContent += `
            <li><strong>${element.type}</strong>: ${details} (레이어: ${element.layer})</li>
          `;
        }
        
        if (data.elements.length > maxElements) {
          htmlContent += `<li>... 외 ${data.elements.length - maxElements}개 요소</li>`;
        }
        
        htmlContent += `</ul>`;
      } else if (!isAutoCAD && 'content' in data) {
        // HWP 데이터 추가
        htmlContent += `
          <h2>HWP 문서 분석 결과</h2>
          <div class="section">
            <div class="info-item"><strong>제목:</strong> ${data.content.title}</div>
            <div class="info-item"><strong>페이지 수:</strong> ${data.analysis.pageCount}</div>
            <div class="info-item"><strong>글자 수:</strong> ${data.analysis.charCount}</div>
            <div class="info-item"><strong>이미지 수:</strong> ${data.analysis.imageCount}</div>
          </div>
          
          <h2>문서 구성 분석</h2>
          <table>
            <tr>
              <th>섹션 유형</th>
              <th>개수</th>
              <th>주요 특징</th>
            </tr>
            <tr>
              <td>텍스트 (Text)</td>
              <td>${data.content.sections.filter(s => s.type === 'text').length}</td>
              <td>문서의 본문 내용</td>
            </tr>
            <tr>
              <td>표 (Table)</td>
              <td>${data.content.sections.filter(s => s.type === 'table').length}</td>
              <td>구조화된 데이터 표현</td>
            </tr>
            <tr>
              <td>이미지 (Image)</td>
              <td>${data.content.sections.filter(s => s.type === 'image').length}</td>
              <td>그림, 도표, 사진 등</td>
            </tr>
          </table>
          
          <h2>섹션 목록</h2>
          <ul class="item-list">
        `;
        
        // 섹션 목록 추가 (최대 10개까지만)
        const maxSections = Math.min(data.content.sections.length, 10);
        for (let i = 0; i < maxSections; i++) {
          const section = data.content.sections[i];
          let details = '';
          
          if (section.type === 'text') {
            details = section.content;
            // 긴 텍스트는 잘라내기
            if (details.length > 100) {
              details = details.substring(0, 100) + '...';
            }
          } else if (section.type === 'table') {
            details = `${section.rows}x${section.columns} 표`;
          } else if (section.type === 'image') {
            details = section.description;
          }
          
          htmlContent += `
            <li><strong>${section.type === 'text' ? '텍스트' : section.type === 'table' ? '표' : '이미지'}</strong>: ${details}</li>
          `;
        }
        
        if (data.content.sections.length > maxSections) {
          htmlContent += `<li>... 외 ${data.content.sections.length - maxSections}개 섹션</li>`;
        }
        
        htmlContent += `</ul>`;
      }
      
      // 해석 내용 추가
      if (data.interpretation) {
        htmlContent += `
          <h2>일반인을 위한 해석</h2>
          <div class="interpretation">
            ${data.interpretation.split('\n').map(line => `<p>${line}</p>`).join('')}
          </div>
        `;
      }
      
      // HTML 문서 마무리
      htmlContent += `
          <div class="footer">
            <p>생성 시간: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
            <p>본 보고서는 자동 생성되었으며, 전문가의 검토가 필요합니다.</p>
          </div>
        </body>
        </html>
      `;
      
      // 실제 프로덕션 환경에서는 PDF 변환 라이브러리 사용 필요
      // 현재는 HTML을 텍스트로 변환하여 반환
      return new Blob([htmlContent], { type: 'application/pdf' });
    } catch (error) {
      console.error('PDF 생성 중 오류 발생:', error);
      throw new Error('PDF 생성에 실패했습니다.');
    }
  }
  
  /**
   * 해석 결과를 보고서로 내보내기
   * @param data 해석 결과 데이터
   * @returns Promise<Blob> 보고서 파일 Blob
   */
  public async exportToReport(data: InterpretationResult): Promise<Blob> {
    try {
      // 보고서 내용 구성
      const isAutoCAD = data.fileType === 'AutoCAD';
      
      let reportContent = `==========================================
${data.fileName} - 해석 보고서
==========================================
생성 날짜: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}

[기본 정보]
파일명: ${data.fileName}
파일 크기: ${(data.fileSize / 1024).toFixed(2)} KB
파일 유형: ${data.fileType}

`;
      
      if (isAutoCAD && 'elements' in data) {
        // AutoCAD 정보
        reportContent += `[AutoCAD 도면 분석 결과]
총 요소 수: ${data.analysis.totalElements}
레이어: ${data.analysis.layers.join(', ')}
크기: ${data.analysis.dimensions.width} x ${data.analysis.dimensions.height}

[요소 유형별 통계]
선(Line): ${data.elements.filter(e => e.type === 'line').length}개
원(Circle): ${data.elements.filter(e => e.type === 'circle').length}개
텍스트(Text): ${data.elements.filter(e => e.type === 'text').length}개

[요소 목록]
`;
        // 요소 목록 (최대 20개까지만)
        const maxElements = Math.min(data.elements.length, 20);
        for (let i = 0; i < maxElements; i++) {
          const element = data.elements[i];
          let details = '';
          
          if (element.type === 'line') {
            details = `선 (${element.coordinates[0].join(',')} - ${element.coordinates[1].join(',')})`;
          } else if (element.type === 'circle') {
            details = `원 (중심: ${element.center.join(',')}, 반지름: ${element.radius})`;
          } else if (element.type === 'text') {
            details = `텍스트 "${element.content}" (위치: ${element.position.join(',')})`;
          }
          
          reportContent += `${i + 1}. ${element.type}: ${details} (레이어: ${element.layer})\n`;
        }
        
        if (data.elements.length > maxElements) {
          reportContent += `... 외 ${data.elements.length - maxElements}개 요소\n`;
        }
        
        // 레이어별 분석
        reportContent += `\n[레이어별 분석]\n`;
        const layerMap: Record<string, { count: number, types: Record<string, number> }> = {};
        
        data.elements.forEach(element => {
          if (!layerMap[element.layer]) {
            layerMap[element.layer] = { count: 0, types: {} };
          }
          
          layerMap[element.layer].count++;
          layerMap[element.layer].types[element.type] = (layerMap[element.layer].types[element.type] || 0) + 1;
        });
        
        Object.entries(layerMap).forEach(([layer, info]) => {
          reportContent += `${layer}: 총 ${info.count}개 요소 (`;
          const typeInfo = Object.entries(info.types).map(([type, count]) => `${type}: ${count}개`).join(', ');
          reportContent += `${typeInfo})\n`;
        });
      } else if (!isAutoCAD && 'content' in data) {
        // HWP 정보
        reportContent += `[HWP 문서 분석 결과]
제목: ${data.content.title}
페이지 수: ${data.analysis.pageCount}
글자 수: ${data.analysis.charCount}
이미지 수: ${data.analysis.imageCount}

[섹션 유형별 통계]
텍스트(Text): ${data.content.sections.filter(s => s.type === 'text').length}개
표(Table): ${data.content.sections.filter(s => s.type === 'table').length}개
이미지(Image): ${data.content.sections.filter(s => s.type === 'image').length}개

[섹션 목록]
`;
        
        // 섹션 목록 (최대 15개까지만)
        const maxSections = Math.min(data.content.sections.length, 15);
        for (let i = 0; i < maxSections; i++) {
          const section = data.content.sections[i];
          let details = '';
          
          if (section.type === 'text') {
            details = section.content;
            // 긴 텍스트는 잘라내기
            if (details.length > 80) {
              details = details.substring(0, 80) + '...';
            }
          } else if (section.type === 'table') {
            details = `${section.rows}x${section.columns} 표`;
          } else if (section.type === 'image') {
            details = section.description;
          }
          
          const sectionType = section.type === 'text' ? '텍스트' : section.type === 'table' ? '표' : '이미지';
          reportContent += `${i + 1}. ${sectionType}: ${details}\n`;
        }
        
        if (data.content.sections.length > maxSections) {
          reportContent += `... 외 ${data.content.sections.length - maxSections}개 섹션\n`;
        }
      }
      
      // 해석 추가
      if (data.interpretation) {
        reportContent += `\n==========================================
[일반인을 위한 해석]
==========================================
${data.interpretation}
`;
      }
      
      // 마무리 문구
      reportContent += `\n==========================================
이 보고서는 자동 생성되었으며, 전문가의 검토가 필요합니다.
생성 시간: ${new Date().toLocaleString()}
==========================================\n`;
      
      return new Blob([reportContent], { type: 'text/plain' });
    } catch (error) {
      console.error('보고서 생성 중 오류 발생:', error);
      throw new Error('보고서 생성에 실패했습니다.');
    }
  }
} 
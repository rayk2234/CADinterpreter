/**
 * 파일 처리를 위한 유틸리티 함수들
 */

/**
 * 파일 확장자 추출 함수
 * @param fileName 파일 이름
 * @returns 파일 확장자 (소문자)
 */
export const getFileExtension = (fileName: string): string => {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
};

/**
 * 파일 크기 포맷팅 함수
 * @param bytes 파일 크기 (바이트)
 * @returns 포맷팅된 파일 크기 문자열
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 파일을 ArrayBuffer로 읽는 함수
 * @param file File 객체
 * @returns Promise<ArrayBuffer>
 */
export const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve(reader.result as ArrayBuffer);
    };
    
    reader.onerror = () => {
      reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * 파일을 텍스트로 읽는 함수
 * @param file File 객체
 * @returns Promise<string>
 */
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve(reader.result as string);
    };
    
    reader.onerror = () => {
      reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * 파일을 Data URL로 읽는 함수
 * @param file File 객체
 * @returns Promise<string>
 */
export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve(reader.result as string);
    };
    
    reader.onerror = () => {
      reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * 파일 타입 검증 함수
 * @param file File 객체
 * @param allowedTypes 허용된 파일 타입 배열
 * @returns boolean
 */
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  const extension = getFileExtension(file.name);
  return allowedTypes.includes(extension);
};

/**
 * 파일 크기 검증 함수
 * @param file File 객체
 * @param maxSizeInBytes 최대 허용 크기 (바이트)
 * @returns boolean
 */
export const validateFileSize = (file: File, maxSizeInBytes: number): boolean => {
  return file.size <= maxSizeInBytes;
}; 
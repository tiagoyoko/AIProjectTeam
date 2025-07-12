import { User, API_ENDPOINTS } from '@aiprojectteam/shared';

console.log('API Server starting...');
console.log('Available endpoints:', API_ENDPOINTS);

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export const createResponse = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data
});

export const createErrorResponse = (error: string): ApiResponse => ({
  success: false,
  error
}); 
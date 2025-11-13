/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Stars API types
 */
export interface StarsAddRequest {
  userId: string;
  amount: number;
}

export interface StarsAddResponse {
  success: boolean;
  balance: number;
  message: string;
}

export interface StarsWithdrawRequest {
  userId: string;
  amount: number;
}

export interface StarsWithdrawResponse {
  success: boolean;
  balance: number;
  withdrawn: number;
  commission: number;
  message: string;
}

export interface StarsBalanceResponse {
  success: boolean;
  balance: number;
}

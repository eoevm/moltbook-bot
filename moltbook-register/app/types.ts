export interface MoltbookAgent {
  api_key: string;
  claim_url: string;
  verification_code: string;
}

export interface RegisterResponse {
  agent?: MoltbookAgent;
  important?: string;
  success?: boolean;
  error?: string;
  message?: string;
}

export interface BulkResult {
  id: number;
  name: string;
  status: "pending" | "success" | "error";
  agent?: MoltbookAgent;
  error?: string;
}

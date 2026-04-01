export type LeadStatus = 
  | 'DISCOVERED' 
  | 'HARDENED' 
  | 'INTEL_READY' 
  | 'SYNCED' 
  | 'FLAGGED' 
  | 'CRITICAL_DUPLICATE';

export interface PortalLead {
  id: string;
  status: LeadStatus;
  crm_sync_approved: boolean;
  engine_error: string | null;
  email: string | null;
  linkedin_url: string | null;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  
  contact_info: {
    phone: string | null;
    email_status: 'verifiable' | 'catch-all' | 'unverified' | 'failed';
    verification_report: any;
  };
  
  intelligence: {
    tavily_raw: any;
    gemini_analysis: string | null;
    icp_score: number;
    last_researched_at: string | null;
  };
  
  action_data: {
    email_draft: string | null;
    external_crm_id: string | null;
    manyreach_campaign: string | null;
    sync_status: 'PENDING' | 'SYNCED' | 'FAILED';
    sync_error: string | null;
  };
  
  created_at: string;
  updated_at: string;
}

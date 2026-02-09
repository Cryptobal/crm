export interface CrmLead {
  id: string;
  status: string;
  source?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  companyName?: string | null;
  notes?: string | null;
  createdAt: string;
}

export type CrmAccountType = "prospect" | "client";

export interface CrmAccount {
  id: string;
  name: string;
  rut?: string | null;
  industry?: string | null;
  size?: string | null;
  segment?: string | null;
  type: CrmAccountType;
  status: string;
  createdAt: string;
}

export interface CrmPipelineStage {
  id: string;
  name: string;
  order: number;
  color?: string | null;
  isClosedWon?: boolean;
  isClosedLost?: boolean;
}

export interface CrmDeal {
  id: string;
  title: string;
  amount: string;
  status: string;
  probability: number;
  expectedCloseDate?: string | null;
  createdAt: string;
  account: CrmAccount;
  stage: CrmPipelineStage;
  primaryContact?: {
    id: string;
    name: string;
    email?: string | null;
  } | null;
  quotes?: {
    id: string;
    quoteId: string;
  }[];
}

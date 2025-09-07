// Core types for Angkor Compliance Platform

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  factoryId?: string;
  permissions: Permission[];
  attributes: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 
  | 'super-admin'
  | 'factory-admin'
  | 'hr-staff'
  | 'grievance-committee'
  | 'auditor'
  | 'analytics-user'
  | 'worker';

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface Factory {
  id: string;
  name: string;
  code: string;
  address: string;
  country: string;
  industry: string;
  size: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  title: string;
  type: DocumentType;
  category: string;
  content: string;
  metadata: Record<string, any>;
  factoryId: string;
  uploadedBy: string;
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type DocumentType = 
  | 'report'
  | 'permit'
  | 'policy'
  | 'sop'
  | 'procedure'
  | 'certificate'
  | 'training'
  | 'audit-evidence';

export interface ComplianceStandard {
  id: string;
  name: string;
  code: string;
  version: string;
  description: string;
  requirements: ComplianceRequirement[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceRequirement {
  id: string;
  standardId: string;
  code: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  controls: ComplianceControl[];
  isActive: boolean;
}

export interface ComplianceControl {
  id: string;
  requirementId: string;
  title: string;
  description: string;
  type: 'preventive' | 'detective' | 'corrective';
  frequency: 'continuous' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  evidence: Evidence[];
  isActive: boolean;
}

export interface Evidence {
  id: string;
  controlId: string;
  documentId: string;
  type: 'document' | 'photo' | 'video' | 'audio' | 'data';
  description: string;
  collectedBy: string;
  collectedAt: Date;
  isValid: boolean;
  metadata: Record<string, any>;
}

export interface Audit {
  id: string;
  factoryId: string;
  standardId: string;
  type: 'internal' | 'external' | 'certification';
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  scheduledDate: Date;
  actualDate?: Date;
  auditorId: string;
  findings: AuditFinding[];
  score?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditFinding {
  id: string;
  auditId: string;
  requirementId: string;
  type: 'non-conformity' | 'observation' | 'opportunity';
  severity: 'minor' | 'major' | 'critical';
  description: string;
  evidence: Evidence[];
  correctiveActions: CorrectiveAction[];
  status: 'open' | 'in-progress' | 'closed' | 'verified';
  createdAt: Date;
  updatedAt: Date;
}

export interface CorrectiveAction {
  id: string;
  findingId: string;
  title: string;
  description: string;
  owner: string;
  dueDate: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  evidence: Evidence[];
  verificationDate?: Date;
  verifiedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Grievance {
  id: string;
  factoryId: string;
  workerId: string;
  type: 'harassment' | 'wage' | 'safety' | 'discrimination' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'submitted' | 'assigned' | 'investigating' | 'resolved' | 'closed';
  description: string;
  isAnonymous: boolean;
  assignedTo?: string;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Training {
  id: string;
  factoryId: string;
  title: string;
  description: string;
  type: 'safety' | 'compliance' | 'skills' | 'orientation';
  duration: number; // in minutes
  materials: Document[];
  attendees: TrainingAttendee[];
  scheduledDate: Date;
  completedDate?: Date;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainingAttendee {
  id: string;
  trainingId: string;
  workerId: string;
  attendanceStatus: 'present' | 'absent' | 'late';
  score?: number;
  certificateIssued: boolean;
  completedAt?: Date;
}

export interface Permit {
  id: string;
  factoryId: string;
  type: string;
  number: string;
  issuingAuthority: string;
  issueDate: Date;
  expiryDate: Date;
  status: 'valid' | 'expired' | 'expiring-soon' | 'renewal-pending';
  documents: Document[];
  renewalReminders: RenewalReminder[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RenewalReminder {
  id: string;
  permitId: string;
  reminderDate: Date;
  status: 'pending' | 'sent' | 'acknowledged';
  sentTo: string[];
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  factoryId?: string;
  role: UserRole;
}

export interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Dashboard types
export interface DashboardStats {
  totalFactories: number;
  totalWorkers: number;
  complianceRate: number;
  openGrievances: number;
  upcomingAudits: number;
  expiringPermits: number;
  recentActivities: Activity[];
}

export interface Activity {
  id: string;
  type: 'audit' | 'grievance' | 'training' | 'permit' | 'document';
  title: string;
  description: string;
  factoryId: string;
  userId: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
}

// Search and filter types
export interface SearchFilters {
  query?: string;
  factoryId?: string;
  role?: UserRole;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Multi-tenant types
export interface Tenant {
  id: string;
  name: string;
  domain: string;
  settings: TenantSettings;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantSettings {
  theme: string;
  language: 'en' | 'km';
  timezone: string;
  features: string[];
  limits: {
    maxFactories: number;
    maxUsers: number;
    maxStorage: number;
  };
}

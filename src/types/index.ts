export type UserRole =
  | 'super_admin'
  | 'chairman'
  | 'accountant'
  | 'branch_manager'
  | 'field_officer'
  | 'crm_officer'
  | 'data_entry'
  | 'auditor'
  | 'member';

export interface User {
  id: string;
  name: string;
  nameBn: string;
  username: string;
  role: UserRole;
  email?: string;
  phone: string;
  branchId?: string;
  memberId?: string; // For member role
  officerId?: string; // For officer role
  avatarUrl?: string;
}

export interface OrganizationProfile {
  name: string;
  nameBn: string;
  registrationNo: string;
  founderChairman: string;
  generalSecretary?: string;
  officeAddress: string;
  phone: string;
  email?: string;
  website: string;
  establishedDate?: string;
  motto?: string;
  currency?: string;
  fiscalYearStart?: string;
  // Financial Policy parameters
  minSavingsDeposit?: number;
  dpsProfitRate?: number;
  fdrProfitRate?: number;
  loanServiceChargeRate?: number;
  loanProcessingFeePercent?: number;
  shareFaceValue?: number;
  latePenaltyFee?: number;
  gracePeriodDays?: number;
  // Automation and Alerts
  dpsMaturityAlertDays?: number;
  dueReminderDays?: number;
  dailyCutoffTime?: string;
  smsNotificationsEnabled?: boolean;
  digitalPassbookEnabled?: boolean;
  receiptFooterText?: string;
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  nameBn: string;
  address: string;
  managerName: string;
  phone: string;
  active: boolean;
  createdAt: string;
}

export interface Officer {
  id: string;
  employeeId: string;
  name: string;
  nameBn: string;
  designation: string;
  branchId: string;
  area: string;
  mobile: string;
  joiningDate: string;
  status: 'active' | 'inactive';
  active?: boolean;
}

export type MemberStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface Nominee {
  id: string;
  memberId: string;
  name: string;
  relation: string;
  nid: string;
  mobile: string;
  address: string;
  photoUrl?: string;
  documentUrl?: string;
  sharePercentage: number;
}

export interface Guarantor {
  id: string;
  loanId?: string;
  memberId?: string; // If guarantor is a member
  name: string;
  relationship: string;
  nid: string;
  mobile: string;
  address: string;
  profession?: string;
  photoUrl?: string;
  nidPhotoUrl?: string;
}

export interface Member {
  id: string;
  memberId: string; // e.g. MS-2026-0001
  accountNumber: string; // e.g. AC-10001
  membershipNumber: string; // e.g. M-1001
  name: string;
  nameBn: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  nid: string;
  birthRegistration?: string;
  mobile: string;
  altMobile?: string;
  email?: string;
  presentAddress: string;
  permanentAddress: string;
  profession: string;
  monthlyIncome: number;
  joiningDate: string;
  branchId: string;
  area: string;
  fieldOfficerId?: string;
  crmOfficerId?: string;
  status: MemberStatus;
  photoUrl?: string;
  signatureUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = 'cash' | 'bank' | 'bkash' | 'nagad' | 'other';

export interface SavingsAccount {
  id: string;
  accountNumber: string;
  memberId: string;
  openingDate: string;
  openingBalance: number;
  status: 'active' | 'frozen' | 'closed';
  createdAt: string;
}

export interface SavingsTransaction {
  id: string;
  transactionId: string;
  accountId: string;
  memberId: string;
  date: string;
  type: 'deposit' | 'withdrawal' | 'adjustment' | 'interest';
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNo?: string;
  bankAccountId?: string;
  officerId: string;
  remarks?: string;
  createdAt: string;
}

export interface ShareAccount {
  id: string;
  accountNumber: string;
  memberId: string;
  numberOfShares: number;
  shareValue: number; // e.g. 100 BDT per share
  openingDate: string;
  status: 'active' | 'closed';
}

export interface ShareTransaction {
  id: string;
  transactionId: string;
  accountId: string;
  memberId: string;
  date: string;
  type: 'buy' | 'transfer' | 'refund';
  numberOfShares: number;
  shareValue: number;
  amount: number;
  paymentMethod: PaymentMethod;
  officerId: string;
  remarks?: string;
  createdAt: string;
}

export type DPSStatus = 'active' | 'due' | 'partial' | 'overdue' | 'matured' | 'closed' | 'cancelled';

export interface DPSAccount {
  id: string;
  dpsNumber: string;
  memberId: string;
  monthlyDeposit: number;
  termMonths: number;
  startDate: string;
  maturityDate: string;
  expectedMaturityAmount: number;
  interestRate: number;
  status: DPSStatus;
  createdAt: string;
}

export interface DPSTransaction {
  id: string;
  transactionId: string;
  dpsId: string;
  memberId: string;
  date: string;
  installmentNo: number;
  amount: number;
  fineAmount?: number;
  paymentMethod: PaymentMethod;
  referenceNo?: string;
  officerId: string;
  remarks?: string;
  createdAt: string;
}

export interface FDRAccount {
  id: string;
  fdrNumber: string;
  memberId: string;
  depositAmount: number;
  termMonths: number;
  profitRate: number; // percentage
  startDate: string;
  maturityDate: string;
  maturityAmount: number;
  status: 'active' | 'matured' | 'renewed' | 'closed';
  payoutFrequency: 'monthly' | 'quarterly' | 'at_maturity';
  renewalHistory?: string[];
  createdAt: string;
}

export interface FDRTransaction {
  id: string;
  transactionId: string;
  fdrId: string;
  memberId: string;
  date: string;
  type: 'deposit' | 'profit_payout' | 'principal_withdrawal';
  amount: number;
  paymentMethod: PaymentMethod;
  officerId: string;
  remarks?: string;
  createdAt: string;
}

export type LoanApplicationStatus =
  | 'draft'
  | 'applied'
  | 'under_review'
  | 'verified'
  | 'approved'
  | 'rejected'
  | 'disbursed'
  | 'active'
  | 'completed'
  | 'overdue'
  | 'closed';

export interface LoanApplication {
  id: string;
  applicationNumber: string;
  memberId: string;
  product: string; // e.g. 'ক্ষুদ্র ব্যবসা ঋণ', 'দৈনিক ঋণ', 'কৃষি ঋণ', 'জরুরি ঋণ'
  requestedAmount: number;
  purpose: string;
  applicationDate: string;
  officerId: string;
  status: LoanApplicationStatus;
  guarantors: Guarantor[];
  verifiedBy?: string;
  approvedBy?: string;
  approvalDate?: string;
  remarks?: string;
  createdAt: string;
}

export interface LoanInstallmentScheduleItem {
  installmentNo: number;
  dueDate: string;
  principal: number;
  profitCharge: number;
  totalDue: number;
  amount?: number;
  paid: number;
  remaining: number;
  paymentDate?: string;
  status: 'upcoming' | 'due' | 'paid' | 'partial' | 'overdue';
}

export interface LoanAccount {
  id: string;
  loanNumber: string;
  applicationId: string;
  memberId: string;
  product: string;
  principal: number;
  sanctionedAmount?: number;
  purpose?: string;
  serviceChargeRate: number; // e.g. 10% or 12%
  serviceChargeAmount: number;
  processingFee: number;
  otherCharges: number;
  totalPayable: number;
  installmentAmount: number;
  numberOfInstallments: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  officerId: string;
  branchId: string;
  status: LoanApplicationStatus;
  schedule: LoanInstallmentScheduleItem[];
  createdAt: string;
}

export interface LoanPayment {
  id: string;
  transactionId: string;
  loanId: string;
  memberId: string;
  date: string;
  paymentDate?: string;
  installmentNo?: number;
  principalPaid: number;
  serviceChargePaid: number;
  finePaid?: number;
  totalPaid: number;
  paymentMethod: PaymentMethod;
  referenceNo?: string;
  officerId: string;
  remarks?: string;
  createdAt: string;
}

export interface CollectionRecord {
  id: string;
  receiptNumber: string;
  date: string;
  memberId: string;
  officerId: string;
  branchId: string;
  savingsAmount: number;
  dpsAmount: number;
  loanEmiAmount: number;
  shareAmount: number;
  fdrAmount: number;
  otherAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  referenceNo?: string;
  notes?: string;
  createdAt: string;
}

export interface CashTransaction {
  id: string;
  transactionId: string;
  date: string;
  type: 'cash_in' | 'cash_out';
  category:
    | 'savings_deposit'
    | 'savings_withdrawal'
    | 'dps_deposit'
    | 'loan_collection'
    | 'loan_disbursement'
    | 'share_deposit'
    | 'fdr_deposit'
    | 'fdr_payout'
    | 'expense'
    | 'income'
    | 'bank_deposit'
    | 'bank_withdrawal'
    | 'fund_transfer'
    | 'correction'
    | 'other';
  amount: number;
  description: string;
  referenceId?: string; // id of related record
  memberId?: string;
  officerId: string;
  approvedBy?: string;
  createdAt: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  branchName: string;
  accountNumber: string;
  accountType: 'current' | 'savings' | 'snd';
  openingBalance: number;
  routingNumber?: string;
  active: boolean;
}

export interface BankTransaction {
  id: string;
  transactionId: string;
  bankAccountId: string;
  date: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'charge' | 'interest';
  amount: number;
  description: string;
  referenceNo?: string;
  officerId: string;
  reconciled: boolean;
  reconciledDate?: string;
  createdAt: string;
}

export interface BankReconciliation {
  id: string;
  bankAccountId: string;
  statementDate: string;
  systemBalance: number;
  bankStatementBalance: number;
  difference: number;
  matchedCount: number;
  unmatchedCount: number;
  status: 'matched' | 'unmatched' | 'pending';
  notes?: string;
  reconciledBy: string;
  reconciledDate?: string;
  ledgerBalance?: number;
  createdAt: string;
}

export type Expense = ExpenseRecord;
export type Income = IncomeRecord;
export type Fund = FundAccount;
export type AppDocument = DocumentItem;
export type Complaint = ComplaintTicket;
export type Notice = NoticeItem;

export interface ExpenseRecord {
  id: string;
  expenseId: string;
  date: string;
  category:
    | 'salary'
    | 'rent'
    | 'electricity'
    | 'internet'
    | 'transport'
    | 'marketing'
    | 'software'
    | 'office'
    | 'maintenance'
    | 'welfare'
    | 'entertainment'
    | 'other';
  amount: number;
  paymentMethod: PaymentMethod;
  bankAccountId?: string;
  description: string;
  approvedBy: string;
  enteredBy: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface IncomeRecord {
  id: string;
  incomeId: string;
  date: string;
  source:
    | 'admission_fee'
    | 'form_sale'
    | 'loan_processing_fee'
    | 'passbook_fee'
    | 'bank_profit'
    | 'fine_penalty'
    | 'investment_profit'
    | 'other';
  amount: number;
  paymentMethod: PaymentMethod;
  bankAccountId?: string;
  description: string;
  enteredBy: string;
  createdAt: string;
}

export interface FundAccount {
  id: string;
  fundName: string;
  fundNameBn: string;
  code: string;
  openingBalance: number;
  description: string;
}

export interface FundTransaction {
  id: string;
  fundId: string;
  date: string;
  type: 'inflow' | 'outflow';
  amount: number;
  description: string;
  referenceNo?: string;
  officerId: string;
  createdAt: string;
}

export type DocumentType =
  | 'member_photo'
  | 'nid_front'
  | 'nid_back'
  | 'birth_certificate'
  | 'nominee_photo'
  | 'nominee_nid'
  | 'guarantor_photo'
  | 'guarantor_nid'
  | 'bank_cheque'
  | 'signature'
  | 'loan_application'
  | 'loan_agreement'
  | 'dps_form'
  | 'fdr_form'
  | 'other';

export type DocumentStatus = 'missing' | 'uploaded' | 'pending_verification' | 'verified' | 'rejected' | 'expired';

export interface DocumentItem {
  id: string;
  memberId: string;
  type: DocumentType;
  title: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  status: DocumentStatus;
  uploadedAt?: string;
  uploadedBy?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  remarks?: string;
}

export interface CRMActivity {
  id: string;
  memberId: string;
  type: 'call' | 'visit' | 'sms' | 'meeting' | 'follow_up' | 'complaint' | 'note';
  category: 'loan_recovery' | 'dps_reminder' | 'savings_inquiry' | 'general' | 'complaint';
  date: string;
  notes: string;
  outcome?: string;
  nextFollowUpDate?: string;
  officerId: string;
  createdAt: string;
}

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ComplaintStatus = 'new' | 'assigned' | 'in_progress' | 'pending' | 'resolved' | 'closed';

export interface ComplaintTicket {
  id: string;
  ticketId: string; // e.g. TKT-1001
  memberId: string;
  subject: string;
  description: string;
  date: string;
  priority: ComplaintPriority;
  assignedOfficerId: string;
  status: ComplaintStatus;
  response?: string;
  resolution?: string;
  resolvedAt?: string;
  rating?: number;
  createdAt: string;
}

export interface NoticeItem {
  id: string;
  title: string;
  description: string;
  category: 'general' | 'agm' | 'holiday' | 'loan_scheme' | 'policy' | 'emergency';
  targetAudience: 'all' | 'members' | 'officers' | 'management';
  attachmentUrl?: string;
  publishDate: string;
  expiryDate?: string;
  status: 'published' | 'draft' | 'archived';
  createdBy: string;
  createdAt: string;
}

export interface DailyClosingRecord {
  id: string;
  date: string;
  openingCash: number;
  cashIn: number;
  cashOut: number;
  collectionAmount: number;
  withdrawalAmount: number;
  loanDisbursementAmount: number;
  expenseAmount: number;
  expectedClosingCash: number;
  actualClosingCash: number;
  difference: number;
  status: 'balanced' | 'surplus' | 'shortage';
  closedBy: string;
  approvedBy?: string;
  remarks?: string;
  createdAt: string;
}

export interface MonthlyClosingRecord {
  id: string;
  month: string; // e.g. '2026-09'
  openingCash: number;
  totalSavingsDeposit: number;
  totalSavingsWithdraw: number;
  totalDPSDeposit: number;
  totalFDRDeposit: number;
  totalLoanDisbursed: number;
  totalLoanCollected: number;
  totalIncome: number;
  totalExpense: number;
  cashClosing: number;
  bankClosing: number;
  closedBy: string;
  createdAt: string;
}

export interface CorrectionRequest {
  id: string;
  requestId: string;
  transactionId: string;
  module: 'savings' | 'dps' | 'loan' | 'share' | 'fdr' | 'cash' | 'bank' | 'expense';
  originalAmount: number;
  proposedAmount: number;
  reason: string;
  requestedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  reversalTransactionId?: string;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: string;
  recordId: string;
  details: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
}

export interface AlertNotification {
  id: string;
  type: 'dps_due' | 'dps_maturity' | 'loan_due' | 'loan_overdue' | 'fdr_maturity' | 'missing_document' | 'cash_difference' | 'complaint_pending';
  severity: 'info' | 'warning' | 'danger';
  title: string;
  message: string;
  date: string;
  linkModule?: string;
  linkId?: string;
  read: boolean;
}

export interface RuleVersion {
  id: string;
  productType: 'savings' | 'dps' | 'fdr' | 'loan';
  ruleName: string;
  ruleValue: string;
  effectiveDate: string;
  endDate?: string;
  version: number;
  approvedBy: string;
  createdAt: string;
}

export interface SamitiState {
  organization: OrganizationProfile;
  branches: Branch[];
  officers: Officer[];
  users: User[];
  members: Member[];
  nominees: Nominee[];
  guarantors: Guarantor[];
  savingsAccounts: SavingsAccount[];
  savingsTransactions: SavingsTransaction[];
  shareAccounts: ShareAccount[];
  shareTransactions: ShareTransaction[];
  dpsAccounts: DPSAccount[];
  dpsTransactions: DPSTransaction[];
  fdrAccounts: FDRAccount[];
  fdrTransactions: FDRTransaction[];
  loanApplications: LoanApplication[];
  loanAccounts: LoanAccount[];
  loanPayments: LoanPayment[];
  collections: CollectionRecord[];
  cashTransactions: CashTransaction[];
  bankAccounts: BankAccount[];
  bankTransactions: BankTransaction[];
  bankReconciliations: BankReconciliation[];
  expenses: ExpenseRecord[];
  incomes: IncomeRecord[];
  funds: FundAccount[];
  fundTransactions: FundTransaction[];
  documents: DocumentItem[];
  crmActivities: CRMActivity[];
  complaints: ComplaintTicket[];
  notices: NoticeItem[];
  dailyClosings: DailyClosingRecord[];
  monthlyClosings: MonthlyClosingRecord[];
  corrections: CorrectionRequest[];
  auditLogs: AuditLogItem[];
  ruleVersions: RuleVersion[];
}

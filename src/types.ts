export interface DocumentItem {
  id: string;
  name: string;
  url: string;
  category: string;
  fileType: 'Spreadsheet' | 'PDF Document' | 'Word Document' | 'Presentation' | 'Online Form' | 'Link / Archive' | string;
  iconClass: string;
  typeClass: string;
}

export interface CategoryInfo {
  name: string;
  count: number;
}

export type ViewMode = 'list' | 'grid' | 'compact';
export type SortOption = 'default' | 'az' | 'za' | 'category' | 'type';
export type ActiveTab = 'directory' | 'draft' | 'viewer' | 'favorites';

export interface DraftToken {
  id: string;
  label: string;
  value: string;
  category: 'header' | 'date' | 'meta' | 'body' | 'signature' | 'docRef';
  description?: string;
  icon?: string;
}

export interface AttachedImage {
  id: string;
  name: string;
  url: string;
  width: number; // percentage or px
  caption?: string;
  position: 'center' | 'left' | 'right';
}

export type ThaiExportFont = 'thsarabun' | 'angsana' | 'cordia' | 'browallia' | 'tahoma' | 'sarabun' | 'prompt';

export interface DigitalSignature {
  id: string;
  signatureDataUrl?: string; // Draw canvas / uploaded image data URL (Base64)
  signerName: string;
  signerPosition: string;
  signType: 'draw' | 'type' | 'upload';
  signStyleFont?: string; // e.g. 'Charmonman', 'Caveat', 'Dancing Script', 'TH Sarabun New'
  signedAt: string; // ISO or formatted date
  signedAtThai: string; // e.g. '8 มีนาคม 2568 เวลา 14:30 น.'
  certificateId: string; // e.g. 'TH-DS-2025-894291'
  checksumHash: string; // SHA256 simulation hash
  role: 'primary' | 'contractor' | 'witness1' | 'witness2' | 'approver';
  roleLabel: string; // e.g. 'ผู้มีอำนาจลงนาม / ผู้ให้สัญญา', 'ผู้รับสัญญา / ผู้ขออนุมัติ', 'พยาน 1', 'พยาน 2'
  organization?: string;
  isValidated: boolean;
  showStampBadge: boolean;
}

export interface DraftDocument {
  id: string;
  title: string;
  docType: 'official_memo' | 'external_letter' | 'official_order' | 'announcement' | 'certificate' | 'custom';
  docTypeTitle: string; // e.g. 'บันทึกข้อความ', 'หนังสือภายนอก', 'คำสั่ง', 'ประกาศ'
  docNumber: string;
  department: string;
  departmentSub?: string;
  phone?: string;
  email?: string;
  date: string;
  subject: string;
  to: string;
  reference?: string; // อ้างถึง
  attachments?: string; // สิ่งที่ส่งมาด้วย
  hasReference: boolean;
  hasAttachments: boolean;
  content: string;
  closingPhrase: string; // e.g. 'จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติ'
  signName: string;
  signPosition: string;
  signActing?: string; // e.g. 'รักษาการในตำแหน่งผู้อำนวยการ'
  hasActingPosition: boolean;
  // Digital Signature System
  digitalSignatures?: DigitalSignature[];
  isDigitallySigned?: boolean;
  exportFont?: ThaiExportFont; // Selected standard Thai font for Word export & display
  // Endorsement / Routing slip section
  hasRoutingSlip: boolean;
  routingComment?: string;
  routingSignName?: string;
  routingDate?: string;
  // Logo & Emblem settings
  showGaruda: boolean;
  logoType: 'garuda' | 'ministry' | 'circle_seal' | 'custom_image' | 'none';
  logoCustomUrl?: string; // Base64 or image URL
  logoCustomName?: string;
  garudaSize: 'sm' | 'md' | 'lg' | 'xl' | 'custom'; // 1.5cm, 3.0cm, 4.0cm, 5.0cm, custom
  logoCustomSizePx?: number; // 40px to 180px
  garudaPosition: 'center' | 'left' | 'right';
  // Attached Images in Document
  attachedImages: AttachedImage[];
  // Paper & Dimensions settings
  paperSize: 'a4' | 'letter' | 'legal' | 'a5' | 'a3' | 'custom';
  paperOrientation: 'portrait' | 'landscape';
  paperMargin: 'standard_thai' | 'narrow' | 'normal' | 'wide' | 'custom';
  customWidthMm?: number;
  customHeightMm?: number;
  customMarginTopCm?: number;
  customMarginBottomCm?: number;
  customMarginLeftCm?: number;
  customMarginRightCm?: number;
  showPageRuler: boolean;
  showPageBorders: boolean;
  // Visual & Typographic settings
  showWatermark: boolean;
  watermarkText: string;
  fontSize: 'sm' | 'base' | 'lg'; // 14pt, 16pt, 18pt
  lineSpacing: 'tight' | 'normal' | 'relaxed' | 'loose';
  textAlign: 'justify' | 'left';
  useThaiNumerals: boolean;
  sourceDocId?: string;
  sourceDocName?: string;
  sourceDocUrl?: string;
  sourceFileType?: string;
}

export interface DocViewerState {
  isOpen: boolean;
  document: DocumentItem | null;
  mode: 'doc' | 'pdf' | 'embed';
}

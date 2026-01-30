// src/types/ui.ts - UI components and preferences
import type { 
  Role, 
  Language, 
  QuestionType, 
  QuestionCategory, 
  Difficulty, 
  Tags 
} from './common';

// =====================
// LOADING AND ERROR STATES
// =====================

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  lastUpdated?: string;
}

export interface AsyncState<T> extends LoadingState {
  data: T | null;
}

export interface ApiState<T> extends AsyncState<T> {
  isRefetching?: boolean;
  retryCount?: number;
  maxRetries?: number;
}

// =====================
// FORM STATES
// =====================

export interface FormState<T> {
  data: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
  hasChanges?: boolean;
  submitCount?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings?: Record<string, string>;
  fieldErrors?: Record<string, string[]>; // Multiple errors per field
}

export interface FormFieldState {
  value: any;
  error?: string;
  touched: boolean;
  dirty: boolean;
  focused: boolean;
}

// =====================
// UI PREFERENCES
// =====================

export type ThemeMode = 'light' | 'dark' | 'system';
export type FontSize = 'small' | 'medium' | 'large' | 'extra-large';
export type ColorBlindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
export type CodeTheme = 'vs-light' | 'vs-dark' | 'github-light' | 'github-dark' | 'monokai';

export interface UIPreferences {
  theme: ThemeMode;
  reducedMotion: boolean;
  fontSize: FontSize;
  colorBlindMode: ColorBlindMode;
  showLineNumbers: boolean;
  autoSave: boolean;
  autoSaveInterval: number; // Seconds
  confirmNavigation: boolean;
  codeTheme: CodeTheme;
  compactMode: boolean;
  showTooltips: boolean;
  keyboardNavigation: boolean;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  reduceAnimations: boolean;
  screenReaderOptimized: boolean;
  focusIndicators: boolean;
  keyboardNavOnly: boolean;
}

// =====================
// COMPONENT PROPS
// =====================

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  id?: string;
  'data-testid'?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: string | React.ReactNode;
  rightIcon?: string | React.ReactNode;
  onClick?: (event: React.MouseEvent) => void;
  type?: 'button' | 'submit' | 'reset';
  form?: string;
  tooltip?: string;
}

export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'url' | 'tel' | 'search';
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  error?: string;
  success?: string;
  helperText?: string;
  label?: string;
  leftIcon?: string | React.ReactNode;
  rightIcon?: string | React.ReactNode;
  onChange?: (value: string, event?: React.ChangeEvent) => void;
  onBlur?: (event?: React.FocusEvent) => void;
  onFocus?: (event?: React.FocusEvent) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

export interface TextAreaProps extends Omit<InputProps, 'type' | 'leftIcon' | 'rightIcon'> {
  rows?: number;
  cols?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  autoResize?: boolean;
}

export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
  description?: string;
  icon?: string | React.ReactNode;
  group?: string;
}

export interface SelectProps<T = string> extends BaseComponentProps {
  options: SelectOption<T>[];
  value?: T | T[];
  defaultValue?: T | T[];
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  label?: string;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
  maxHeight?: string;
  noOptionsMessage?: string;
  loadingMessage?: string;
  formatOptionLabel?: (option: SelectOption<T>) => React.ReactNode;
  onChange?: (value: T | T[] | null) => void;
  onInputChange?: (inputValue: string) => void;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
}

// =====================
// LANGUAGE/TECH OPTIONS (Application-specific)
// =====================

export interface LanguageOption {
  value: Language;
  label: string;
  icon: string;
  color: string;
  category: 'frontend' | 'backend' | 'mobile' | 'database' | 'general';
  description?: string;
  popularity?: number; // For sorting
}

export interface QuestionTypeOption {
  value: QuestionType;
  label: string;
  description: string;
  icon: string;
  autoGradeable: boolean;
  complexity: 'Simple' | 'Medium' | 'Advanced';
  features: string[];
  estimatedTime: number; // Minutes to complete
  supportedLanguages: Language[];
}

export interface CategoryOption {
  value: QuestionCategory;
  label: string;
  description: string;
  icon: string;
  supportedTypes: QuestionType[];
}

export interface DifficultyOption {
  value: Difficulty;
  label: string;
  color: string;
  description: string;
  pointMultiplier?: number;
}

export interface TagOption {
  value: Tags;
  label: string;
  category: string;
  color: string;
  relatedTags?: Tags[];
}

// =====================
// TABLE AND LIST COMPONENTS
// =====================

export interface TableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  align?: 'left' | 'center' | 'right';
  sticky?: boolean;
  render?: (value: any, item: T, index: number) => React.ReactNode;
  className?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  emptyIcon?: string | React.ReactNode;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  selectable?: boolean;
  selectedRows?: T[];
  stickyHeader?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  onSort?: (column: string, order: 'asc' | 'desc') => void;
  onRowClick?: (item: T, index: number) => void;
  onRowSelect?: (selectedItems: T[]) => void;
  pagination?: PaginationProps;
  actions?: TableAction<T>[];
  bulkActions?: BulkAction<T>[];
}

export interface TableAction<T> {
  key: string;
  label: string;
  icon?: string | React.ReactNode;
  variant?: ButtonProps['variant'];
  disabled?: (item: T) => boolean;
  hidden?: (item: T) => boolean;
  onClick: (item: T) => void;
}

export interface BulkAction<T> {
  key: string;
  label: string;
  icon?: string | React.ReactNode;
  variant?: ButtonProps['variant'];
  confirmMessage?: string;
  onClick: (selectedItems: T[]) => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

// =====================
// MODAL AND OVERLAY
// =====================

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  closable?: boolean;
  maskClosable?: boolean;
  keyboard?: boolean;
  centered?: boolean;
  destroyOnClose?: boolean;
  footer?: React.ReactNode;
  headerActions?: React.ReactNode;
  zIndex?: number;
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  confirmButtonProps?: Partial<ButtonProps>;
  cancelButtonProps?: Partial<ButtonProps>;
  loading?: boolean;
  icon?: string | React.ReactNode;
}

export interface DrawerProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  placement?: 'left' | 'right' | 'top' | 'bottom';
  width?: string | number;
  height?: string | number;
  maskClosable?: boolean;
  destroyOnClose?: boolean;
  footer?: React.ReactNode;
}

// =====================
// NAVIGATION
// =====================

export interface NavigationItem {
  key: string;
  label: string;
  path?: string;
  icon?: string | React.ReactNode;
  children?: NavigationItem[];
  requiresRole?: Role | Role[];
  requiresPermission?: string | string[];
  badge?: string | number;
  disabled?: boolean;
  external?: boolean;
  divider?: boolean;
  onClick?: () => void;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: string | React.ReactNode;
  current?: boolean;
  onClick?: () => void;
}

export interface TabItem {
  key: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
  icon?: string | React.ReactNode;
  badge?: string | number;
  closable?: boolean;
}

// =====================
// NOTIFICATIONS
// =====================

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  description?: string;
  duration?: number; // 0 = persistent
  persistent?: boolean;
  closable?: boolean;
  icon?: string | React.ReactNode;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: ButtonProps['variant'];
  }>;
  onClose?: () => void;
  placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'top' | 'bottom';
}

export interface Toast extends Omit<Notification, 'placement'> {
  position?: 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

// =====================
// FILTER COMPONENTS
// =====================

export interface FilterOption<T = any> {
  label: string;
  value: T;
  count?: number;
  disabled?: boolean;
  description?: string;
}

export interface FilterGroup<T = any> {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'range' | 'date' | 'daterange' | 'search' | 'boolean' | 'number';
  options?: FilterOption<T>[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: T;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  collapsible?: boolean;
  collapsed?: boolean;
}

export interface FilterState {
  [key: string]: any;
}

export interface ActiveFilter {
  key: string;
  label: string;
  value: any;
  displayValue: string;
  removable?: boolean;
}

// =====================
// CODE EDITOR
// =====================

export interface CodeEditorProps {
  value: string;
  language: Language;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  readOnly?: boolean;
  theme?: CodeTheme;
  showLineNumbers?: boolean;
  showMinimap?: boolean;
  wordWrap?: boolean;
  fontSize?: number;
  tabSize?: number;
  height?: string;
  width?: string;
  placeholder?: string;
  error?: string;
  className?: string;
  autoFormat?: boolean;
  highlightActiveLine?: boolean;
  showInvisibles?: boolean;
  enableLinting?: boolean;
  enableAutocomplete?: boolean;
}

export interface CodeDiffProps {
  original: string;
  modified: string;
  language: Language;
  theme?: CodeTheme;
  readOnly?: boolean;
  showLineNumbers?: boolean;
  height?: string;
  className?: string;
}

// =====================
// STATISTICS DISPLAY
// =====================

export interface StatCard {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
    label?: string;
    period?: string;
  };
  icon?: string | React.ReactNode;
  color?: string;
  description?: string;
  loading?: boolean;
  onClick?: () => void;
  format?: 'number' | 'percentage' | 'currency' | 'duration';
  precision?: number;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
    pointRadius?: number;
  }>;
}

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: {
    legend?: {
      display?: boolean;
      position?: 'top' | 'bottom' | 'left' | 'right';
    };
    tooltip?: {
      enabled?: boolean;
    };
  };
  scales?: {
    x?: {
      display?: boolean;
      title?: {
        display?: boolean;
        text?: string;
      };
    };
    y?: {
      display?: boolean;
      title?: {
        display?: boolean;
        text?: string;
      };
      beginAtZero?: boolean;
    };
  };
}

// =====================
// SEARCH AND FILTERS
// =====================

export interface SearchState {
  query: string;
  filters: FilterState;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

export interface SearchProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  onClear?: () => void;
  loading?: boolean;
  error?: string;
  suggestions?: string[];
  showSuggestions?: boolean;
  maxSuggestions?: number;
  size?: InputProps['size'];
  disabled?: boolean;
  autoFocus?: boolean;
  debounceMs?: number;
}

export interface SearchResult<T> {
  items: T[];
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string;
  aggregations?: Record<string, any>;
}

// =====================
// WIZARD/STEPPER
// =====================

export interface UIWizardStep {
  id: string;
  title: string;
  description?: string;
  isRequired: boolean;
  isComplete?: boolean;
  isSkippable?: boolean;
  component: React.ComponentType<any>;
  icon?: string | React.ReactNode;
}

export interface UIWizardState {
  currentStep: number;
  totalSteps: number;
  isLoading: boolean;
  error: string | null;
  canProgress: boolean;
  canGoBack: boolean;
  completedSteps: number[];
  skippedSteps: number[];
  data: any;
}

export interface StepperProps {
  steps: UIWizardStep[];
  currentStep: number;
  completedSteps?: number[];
  orientation?: 'horizontal' | 'vertical';
  showStepNumbers?: boolean;
  clickable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onStepClick?: (step: number) => void;
  className?: string;
}

// =====================
// DRAG AND DROP
// =====================

export interface DragItem {
  id: string;
  type: string;
  data: any;
}

export interface DropZoneProps {
  onDrop: (item: DragItem, position?: { x: number; y: number }) => void;
  accept: string | string[];
  disabled?: boolean;
  className?: string;
  activeClassName?: string;
  children: React.ReactNode;
}

// =====================
// FILE UPLOAD
// =====================

export interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // bytes
  maxFiles?: number;
  onUpload: (files: File[]) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  loading?: boolean;
  dragAndDrop?: boolean;
  preview?: boolean;
  className?: string;
}

export interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

// =====================
// LAYOUT COMPONENTS
// =====================

export interface SidebarProps extends BaseComponentProps {
  collapsed?: boolean;
  collapsible?: boolean;
  width?: string;
  collapsedWidth?: string;
  placement?: 'left' | 'right';
  onCollapse?: (collapsed: boolean) => void;
}

export interface HeaderProps extends BaseComponentProps {
  fixed?: boolean;
  height?: string;
  zIndex?: number;
}

export interface ContentProps extends BaseComponentProps {
  padding?: boolean | string;
  maxWidth?: string;
  centered?: boolean;
}

// =====================
// UTILITY TYPES
// =====================

export interface Responsive<T> {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  xxl?: T;
}

export interface Spacing {
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
  x?: string | number; // horizontal
  y?: string | number; // vertical
  all?: string | number;
}

// =====================
// THEME AND STYLING
// =====================

export interface ColorPalette {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  neutral: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
}

export interface BreakpointConfig {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
}

// =====================
// ERROR BOUNDARY
// =====================

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  resetKeys?: string[];
}

// =====================
// VIRTUAL LIST
// =====================

export interface VirtualListProps<T> {
  items: T[];
  itemHeight: number | ((index: number) => number);
  height: number;
  overscan?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  onScroll?: (scrollTop: number) => void;
  className?: string;
}

// src/types/ui.ts - Add these types to the existing UI types file

// =====================
// DASHBOARD COMPONENTS (Add to existing ui.ts)
// =====================

export interface DashboardStats {
  totalUsers: number;
  independentStudents: number;
  orgAffiliatedUsers: number;
  globalQuestions: number;
  orgSpecificQuestions: number;
  totalQuestions: number;
  activeTests: number;
  totalTests: number;
  activeSessions: number;
  completedSessions: number; // Add this line
  organizationsCount: number;
}

export interface DashboardFeature {
  title: string;
  description: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  stats: string;
  access: Role[];
}

export interface DashboardStatCardProps extends BaseComponentProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  onClick?: () => void; // Add this line
}

export interface DashboardFeatureCardProps extends BaseComponentProps {
  feature: DashboardFeature;
  onClick: (path: string) => void;
}

export interface QuickActionsProps extends BaseComponentProps {
  onAction: (action: QuickActionType) => void;
  userRole: Role;
  isSuperOrgAdmin: boolean;
}

export type QuickActionType = 
  | 'addUser'
  | 'createQuestion' 
  | 'createTest'
  | 'addOrganization'
  | 'createCodeChallenge'    // New
  | 'createTrack'            // New
  | 'viewSubmissions'        // New
  | 'manageAnalytics';       // New
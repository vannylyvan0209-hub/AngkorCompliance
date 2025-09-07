import React, { useState } from 'react';
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Copy, 
  Download, 
  Share, 
  Archive,
  Flag,
  User,
  Settings
} from 'lucide-react';

export interface ActionItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (record: any) => void;
  disabled?: (record: any) => boolean;
  hidden?: (record: any) => boolean;
  danger?: boolean;
  divider?: boolean;
}

export interface TableActionsProps {
  record: any;
  actions: ActionItem[];
  trigger?: 'click' | 'hover';
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  className?: string;
}

export const TableActions: React.FC<TableActionsProps> = ({
  record,
  actions,
  trigger = 'click',
  placement = 'bottom-end',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const visibleActions = actions.filter(action => 
    !action.hidden?.(record)
  );

  if (visibleActions.length === 0) {
    return null;
  }

  const handleActionClick = (action: ActionItem) => {
    if (!action.disabled?.(record)) {
      action.onClick(record);
      setIsOpen(false);
    }
  };

  const getPlacementClasses = () => {
    switch (placement) {
      case 'bottom-start':
        return 'top-full left-0 mt-1';
      case 'bottom-end':
        return 'top-full right-0 mt-1';
      case 'top-start':
        return 'bottom-full left-0 mb-1';
      case 'top-end':
        return 'bottom-full right-0 mb-1';
      default:
        return 'top-full right-0 mt-1';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => trigger === 'click' && setIsOpen(!isOpen)}
        onMouseEnter={() => trigger === 'hover' && setIsOpen(true)}
        onMouseLeave={() => trigger === 'hover' && setIsOpen(false)}
        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
        title="Actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {/* Actions Menu */}
      {isOpen && (
        <div
          className={`absolute ${getPlacementClasses()} w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50`}
          onMouseEnter={() => trigger === 'hover' && setIsOpen(true)}
          onMouseLeave={() => trigger === 'hover' && setIsOpen(false)}
        >
          <div className="py-1">
            {visibleActions.map((action, index) => (
              <React.Fragment key={action.key}>
                {action.divider && index > 0 && (
                  <div className="border-t border-gray-100 my-1" />
                )}
                
                <button
                  onClick={() => handleActionClick(action)}
                  disabled={action.disabled?.(record)}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                    action.disabled?.(record)
                      ? 'text-gray-400 cursor-not-allowed'
                      : action.danger
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {action.icon && (
                    <div className="flex-shrink-0">
                      {action.icon}
                    </div>
                  )}
                  <span className="flex-1 text-left">{action.label}</span>
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Predefined action sets for common use cases
export const createViewAction = (onView: (record: any) => void): ActionItem => ({
  key: 'view',
  label: 'View Details',
  icon: <Eye className="h-4 w-4" />,
  onClick: onView
});

export const createEditAction = (onEdit: (record: any) => void): ActionItem => ({
  key: 'edit',
  label: 'Edit',
  icon: <Edit className="h-4 w-4" />,
  onClick: onEdit
});

export const createDeleteAction = (onDelete: (record: any) => void): ActionItem => ({
  key: 'delete',
  label: 'Delete',
  icon: <Trash2 className="h-4 w-4" />,
  onClick: onDelete,
  danger: true
});

export const createCopyAction = (onCopy: (record: any) => void): ActionItem => ({
  key: 'copy',
  label: 'Copy',
  icon: <Copy className="h-4 w-4" />,
  onClick: onCopy
});

export const createDownloadAction = (onDownload: (record: any) => void): ActionItem => ({
  key: 'download',
  label: 'Download',
  icon: <Download className="h-4 w-4" />,
  onClick: onDownload
});

export const createShareAction = (onShare: (record: any) => void): ActionItem => ({
  key: 'share',
  label: 'Share',
  icon: <Share className="h-4 w-4" />,
  onClick: onShare
});

export const createArchiveAction = (onArchive: (record: any) => void): ActionItem => ({
  key: 'archive',
  label: 'Archive',
  icon: <Archive className="h-4 w-4" />,
  onClick: onArchive
});

export const createFlagAction = (onFlag: (record: any) => void): ActionItem => ({
  key: 'flag',
  label: 'Flag',
  icon: <Flag className="h-4 w-4" />,
  onClick: onFlag
});

export const createUserAction = (onUser: (record: any) => void): ActionItem => ({
  key: 'user',
  label: 'View User',
  icon: <User className="h-4 w-4" />,
  onClick: onUser
});

export const createSettingsAction = (onSettings: (record: any) => void): ActionItem => ({
  key: 'settings',
  label: 'Settings',
  icon: <Settings className="h-4 w-4" />,
  onClick: onSettings
});

// Common action combinations
export const createCRUDActions = (config: {
  onView?: (record: any) => void;
  onEdit?: (record: any) => void;
  onDelete?: (record: any) => void;
  onCopy?: (record: any) => void;
}): ActionItem[] => {
  const actions: ActionItem[] = [];

  if (config.onView) {
    actions.push(createViewAction(config.onView));
  }

  if (config.onEdit) {
    actions.push(createEditAction(config.onEdit));
  }

  if (config.onCopy) {
    actions.push(createCopyAction(config.onCopy));
  }

  if (config.onDelete) {
    actions.push(createDeleteAction(config.onDelete));
  }

  return actions;
};

export const createDocumentActions = (config: {
  onView?: (record: any) => void;
  onEdit?: (record: any) => void;
  onDownload?: (record: any) => void;
  onShare?: (record: any) => void;
  onDelete?: (record: any) => void;
}): ActionItem[] => {
  const actions: ActionItem[] = [];

  if (config.onView) {
    actions.push(createViewAction(config.onView));
  }

  if (config.onEdit) {
    actions.push(createEditAction(config.onEdit));
  }

  if (config.onDownload) {
    actions.push(createDownloadAction(config.onDownload));
  }

  if (config.onShare) {
    actions.push(createShareAction(config.onShare));
  }

  if (config.onDelete) {
    actions.push(createDeleteAction(config.onDelete));
  }

  return actions;
};

export const createUserActions = (config: {
  onView?: (record: any) => void;
  onEdit?: (record: any) => void;
  onUser?: (record: any) => void;
  onFlag?: (record: any) => void;
  onDelete?: (record: any) => void;
}): ActionItem[] => {
  const actions: ActionItem[] = [];

  if (config.onView) {
    actions.push(createViewAction(config.onView));
  }

  if (config.onEdit) {
    actions.push(createEditAction(config.onEdit));
  }

  if (config.onUser) {
    actions.push(createUserAction(config.onUser));
  }

  if (config.onFlag) {
    actions.push(createFlagAction(config.onFlag));
  }

  if (config.onDelete) {
    actions.push(createDeleteAction(config.onDelete));
  }

  return actions;
};

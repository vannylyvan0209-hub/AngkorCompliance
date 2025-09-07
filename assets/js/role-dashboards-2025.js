/**
 * Angkor Compliance Platform - Role-Specific Dashboards JavaScript 2025
 * 
 * Modern role-specific dashboard layouts using bento grid system,
 * accessibility support, and responsive design.
 */

class RoleDashboardManager {
    constructor() {
        this.dashboards = new Map();
        this.config = {
            enableDragAndDrop: true,
            enableResize: true,
            enableCollapse: true,
            enableFullscreen: true,
            enableExport: true,
            enablePrint: true,
            enableRefresh: true,
            enableCustomization: true,
            enableAnalytics: true,
            enableNotifications: true,
            enableKeyboardShortcuts: true,
            enableAccessibility: true,
            animationDuration: 300,
            animationEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            refreshInterval: 30000,
            autoSaveInterval: 60000,
            maxWidgets: 50,
            defaultGridSize: 12,
            storageKey: 'dashboard-layout',
            themeKey: 'dashboard-theme'
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeDashboards();
        this.setupAccessibility();
        this.setupResponsive();
        this.loadDashboardLayouts();
        this.setupAutoRefresh();
        this.setupAutoSave();
    }

    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // Handle before unload
        window.addEventListener('beforeunload', () => {
            this.saveDashboardLayouts();
        });
    }

    initializeDashboards() {
        const dashboardElements = document.querySelectorAll('.dashboard');
        
        dashboardElements.forEach((element, index) => {
            const id = element.id || `dashboard-${index}`;
            this.createDashboard(id, element);
        });
    }

    setupAccessibility() {
        this.dashboards.forEach((dashboard, id) => {
            const { element } = dashboard;
            
            // Add ARIA attributes
            if (!element.getAttribute('role')) {
                element.setAttribute('role', 'main');
            }
            
            if (!element.getAttribute('aria-label')) {
                element.setAttribute('aria-label', 'Dashboard');
            }
            
            // Add semantic roles to dashboard elements
            const header = element.querySelector('.dashboard-header');
            if (header) {
                header.setAttribute('role', 'banner');
            }
            
            const sidebar = element.querySelector('.dashboard-sidebar');
            if (sidebar) {
                sidebar.setAttribute('role', 'navigation');
            }
            
            const content = element.querySelector('.dashboard-content');
            if (content) {
                content.setAttribute('role', 'main');
            }
            
            // Add roles to widgets
            const widgets = element.querySelectorAll('.dashboard-widget');
            widgets.forEach(widget => {
                if (!widget.getAttribute('role')) {
                    widget.setAttribute('role', 'region');
                }
            });
        });
    }

    setupResponsive() {
        // Add responsive classes based on screen size
        const updateResponsiveClasses = () => {
            this.dashboards.forEach((dashboard) => {
                const { element } = dashboard;
                
                if (window.innerWidth < 768) {
                    element.classList.add('dashboard-mobile');
                } else {
                    element.classList.remove('dashboard-mobile');
                }
                
                if (window.innerWidth < 480) {
                    element.classList.add('dashboard-small');
                } else {
                    element.classList.remove('dashboard-small');
                }
            });
        };
        
        updateResponsiveClasses();
        window.addEventListener('resize', updateResponsiveClasses);
    }

    setupAutoRefresh() {
        if (this.config.refreshInterval > 0) {
            setInterval(() => {
                this.refreshAllDashboards();
            }, this.config.refreshInterval);
        }
    }

    setupAutoSave() {
        if (this.config.autoSaveInterval > 0) {
            setInterval(() => {
                this.saveDashboardLayouts();
            }, this.config.autoSaveInterval);
        }
    }

    // Public Methods
    createDashboard(id, element, options = {}) {
        const config = { ...this.config, ...options };
        
        // Store dashboard
        this.dashboards.set(id, {
            id,
            element,
            config,
            widgets: new Map(),
            layout: [],
            currentRole: 'worker',
            isFullscreen: false,
            isCollapsed: false,
            isCustomizing: false,
            isRefreshing: false,
            isSaving: false,
            error: null,
            refreshTimer: null,
            saveTimer: null
        });
        
        // Apply configuration
        this.applyConfiguration(this.dashboards.get(id));
        
        return this.dashboards.get(id);
    }

    setRole(id, role) {
        const dashboard = this.dashboards.get(id);
        if (!dashboard) {
            console.error(`Dashboard with id "${id}" not found`);
            return;
        }
        
        const { element, config } = dashboard;
        
        // Update current role
        dashboard.currentRole = role;
        
        // Update element classes
        element.className = element.className.replace(/dashboard-\w+/g, '');
        element.classList.add(`dashboard-${role}`);
        
        // Load role-specific layout
        this.loadRoleLayout(dashboard, role);
        
        // Update widgets
        this.updateRoleWidgets(dashboard, role);
        
        // Trigger event
        this.triggerEvent(element, 'dashboard:role:change', { 
            dashboard: config, 
            role 
        });
        
        return this;
    }

    addWidget(id, widgetConfig) {
        const dashboard = this.dashboards.get(id);
        if (!dashboard) {
            console.error(`Dashboard with id "${id}" not found`);
            return;
        }
        
        const { element, config } = dashboard;
        
        // Create widget
        const widget = this.createWidget(dashboard, widgetConfig);
        
        // Add to dashboard
        dashboard.widgets.set(widget.id, widget);
        
        // Add to layout
        this.addWidgetToLayout(dashboard, widget);
        
        // Render widget
        this.renderWidget(dashboard, widget);
        
        // Trigger event
        this.triggerEvent(element, 'dashboard:widget:add', { 
            dashboard: config, 
            widget 
        });
        
        return widget;
    }

    removeWidget(id, widgetId) {
        const dashboard = this.dashboards.get(id);
        if (!dashboard) {
            console.error(`Dashboard with id "${id}" not found`);
            return;
        }
        
        const { element, config } = dashboard;
        
        // Remove widget
        const widget = dashboard.widgets.get(widgetId);
        if (widget) {
            dashboard.widgets.delete(widgetId);
            this.removeWidgetFromLayout(dashboard, widget);
            this.destroyWidget(dashboard, widget);
        }
        
        // Trigger event
        this.triggerEvent(element, 'dashboard:widget:remove', { 
            dashboard: config, 
            widgetId 
        });
        
        return this;
    }

    updateWidget(id, widgetId, updates) {
        const dashboard = this.dashboards.get(id);
        if (!dashboard) {
            console.error(`Dashboard with id "${id}" not found`);
            return;
        }
        
        const { element, config } = dashboard;
        
        // Update widget
        const widget = dashboard.widgets.get(widgetId);
        if (widget) {
            Object.assign(widget, updates);
            this.renderWidget(dashboard, widget);
        }
        
        // Trigger event
        this.triggerEvent(element, 'dashboard:widget:update', { 
            dashboard: config, 
            widgetId, 
            updates 
        });
        
        return this;
    }

    refreshDashboard(id) {
        const dashboard = this.dashboards.get(id);
        if (!dashboard) {
            console.error(`Dashboard with id "${id}" not found`);
            return;
        }
        
        const { element, config } = dashboard;
        
        // Set refreshing state
        dashboard.isRefreshing = true;
        element.classList.add('dashboard-loading');
        
        // Refresh all widgets
        dashboard.widgets.forEach((widget) => {
            this.refreshWidget(dashboard, widget);
        });
        
        // Simulate refresh delay
        setTimeout(() => {
            dashboard.isRefreshing = false;
            element.classList.remove('dashboard-loading');
            
            // Trigger event
            this.triggerEvent(element, 'dashboard:refresh', { 
                dashboard: config 
            });
        }, config.animationDuration);
        
        return this;
    }

    refreshAllDashboards() {
        this.dashboards.forEach((dashboard, id) => {
            this.refreshDashboard(id);
        });
        
        return this;
    }

    toggleFullscreen(id) {
        const dashboard = this.dashboards.get(id);
        if (!dashboard) {
            console.error(`Dashboard with id "${id}" not found`);
            return;
        }
        
        const { element, config } = dashboard;
        
        // Toggle fullscreen state
        dashboard.isFullscreen = !dashboard.isFullscreen;
        
        if (dashboard.isFullscreen) {
            element.classList.add('dashboard-fullscreen');
            document.body.classList.add('dashboard-fullscreen-active');
        } else {
            element.classList.remove('dashboard-fullscreen');
            document.body.classList.remove('dashboard-fullscreen-active');
        }
        
        // Trigger event
        this.triggerEvent(element, 'dashboard:fullscreen:toggle', { 
            dashboard: config, 
            isFullscreen: dashboard.isFullscreen 
        });
        
        return this;
    }

    toggleSidebar(id) {
        const dashboard = this.dashboards.get(id);
        if (!dashboard) {
            console.error(`Dashboard with id "${id}" not found`);
            return;
        }
        
        const { element, config } = dashboard;
        
        // Toggle sidebar state
        dashboard.isCollapsed = !dashboard.isCollapsed;
        
        const sidebar = element.querySelector('.dashboard-sidebar');
        if (sidebar) {
            if (dashboard.isCollapsed) {
                sidebar.classList.add('collapsed');
            } else {
                sidebar.classList.remove('collapsed');
            }
        }
        
        // Trigger event
        this.triggerEvent(element, 'dashboard:sidebar:toggle', { 
            dashboard: config, 
            isCollapsed: dashboard.isCollapsed 
        });
        
        return this;
    }

    toggleCustomization(id) {
        const dashboard = this.dashboards.get(id);
        if (!dashboard) {
            console.error(`Dashboard with id "${id}" not found`);
            return;
        }
        
        const { element, config } = dashboard;
        
        // Toggle customization state
        dashboard.isCustomizing = !dashboard.isCustomizing;
        
        if (dashboard.isCustomizing) {
            element.classList.add('dashboard-customizing');
            this.enableCustomization(dashboard);
        } else {
            element.classList.remove('dashboard-customizing');
            this.disableCustomization(dashboard);
        }
        
        // Trigger event
        this.triggerEvent(element, 'dashboard:customization:toggle', { 
            dashboard: config, 
            isCustomizing: dashboard.isCustomizing 
        });
        
        return this;
    }

    exportDashboard(id, format = 'json') {
        const dashboard = this.dashboards.get(id);
        if (!dashboard) {
            console.error(`Dashboard with id "${id}" not found`);
            return;
        }
        
        const { element, config } = dashboard;
        
        // Export dashboard data
        const exportData = this.getDashboardExportData(dashboard);
        let content = '';
        let filename = `dashboard-${id}.${format}`;
        let mimeType = 'application/json';
        
        switch (format) {
            case 'json':
                content = JSON.stringify(exportData, null, 2);
                break;
            case 'csv':
                content = this.exportToCSV(exportData);
                mimeType = 'text/csv';
                break;
            case 'xml':
                content = this.exportToXML(exportData);
                mimeType = 'application/xml';
                break;
            default:
                console.error(`Unsupported export format: ${format}`);
                return;
        }
        
        // Download file
        this.downloadFile(content, filename, mimeType);
        
        // Trigger event
        this.triggerEvent(element, 'dashboard:export', { 
            dashboard: config, 
            format, 
            data: exportData 
        });
        
        return this;
    }

    printDashboard(id) {
        const dashboard = this.dashboards.get(id);
        if (!dashboard) {
            console.error(`Dashboard with id "${id}" not found`);
            return;
        }
        
        const { element, config } = dashboard;
        
        // Add print class
        element.classList.add('dashboard-printing');
        
        // Print
        window.print();
        
        // Remove print class
        setTimeout(() => {
            element.classList.remove('dashboard-printing');
        }, 1000);
        
        // Trigger event
        this.triggerEvent(element, 'dashboard:print', { 
            dashboard: config 
        });
        
        return this;
    }

    saveDashboardLayouts() {
        this.dashboards.forEach((dashboard, id) => {
            this.saveDashboardLayout(dashboard);
        });
        
        return this;
    }

    loadDashboardLayouts() {
        this.dashboards.forEach((dashboard, id) => {
            this.loadDashboardLayout(dashboard);
        });
        
        return this;
    }

    // Private Methods
    applyConfiguration(dashboard) {
        const { element, config } = dashboard;
        
        // Add configuration classes
        if (config.enableDragAndDrop) element.classList.add('dashboard-drag-enabled');
        if (config.enableResize) element.classList.add('dashboard-resize-enabled');
        if (config.enableCollapse) element.classList.add('dashboard-collapse-enabled');
        if (config.enableFullscreen) element.classList.add('dashboard-fullscreen-enabled');
        if (config.enableExport) element.classList.add('dashboard-export-enabled');
        if (config.enablePrint) element.classList.add('dashboard-print-enabled');
        if (config.enableRefresh) element.classList.add('dashboard-refresh-enabled');
        if (config.enableCustomization) element.classList.add('dashboard-customization-enabled');
        if (config.enableAnalytics) element.classList.add('dashboard-analytics-enabled');
        if (config.enableNotifications) element.classList.add('dashboard-notifications-enabled');
        if (config.enableKeyboardShortcuts) element.classList.add('dashboard-keyboard-enabled');
        if (config.enableAccessibility) element.classList.add('dashboard-accessibility-enabled');
        
        // Add event listeners
        this.addEventListeners(dashboard);
        
        // Initialize features
        if (config.enableDragAndDrop) this.initializeDragAndDrop(dashboard);
        if (config.enableResize) this.initializeResize(dashboard);
        if (config.enableCollapse) this.initializeCollapse(dashboard);
        if (config.enableFullscreen) this.initializeFullscreen(dashboard);
        if (config.enableExport) this.initializeExport(dashboard);
        if (config.enablePrint) this.initializePrint(dashboard);
        if (config.enableRefresh) this.initializeRefresh(dashboard);
        if (config.enableCustomization) this.initializeCustomization(dashboard);
        if (config.enableAnalytics) this.initializeAnalytics(dashboard);
        if (config.enableNotifications) this.initializeNotifications(dashboard);
        if (config.enableKeyboardShortcuts) this.initializeKeyboardShortcuts(dashboard);
        if (config.enableAccessibility) this.initializeAccessibility(dashboard);
    }

    addEventListeners(dashboard) {
        const { element, config } = dashboard;
        
        // Header event listeners
        const header = element.querySelector('.dashboard-header');
        if (header) {
            const refreshButton = header.querySelector('.dashboard-refresh');
            if (refreshButton) {
                refreshButton.addEventListener('click', () => {
                    this.refreshDashboard(dashboard.id);
                });
            }
            
            const fullscreenButton = header.querySelector('.dashboard-fullscreen');
            if (fullscreenButton) {
                fullscreenButton.addEventListener('click', () => {
                    this.toggleFullscreen(dashboard.id);
                });
            }
            
            const exportButton = header.querySelector('.dashboard-export');
            if (exportButton) {
                exportButton.addEventListener('click', () => {
                    this.exportDashboard(dashboard.id);
                });
            }
            
            const printButton = header.querySelector('.dashboard-print');
            if (printButton) {
                printButton.addEventListener('click', () => {
                    this.printDashboard(dashboard.id);
                });
            }
            
            const customizationButton = header.querySelector('.dashboard-customization');
            if (customizationButton) {
                customizationButton.addEventListener('click', () => {
                    this.toggleCustomization(dashboard.id);
                });
            }
        }
        
        // Sidebar event listeners
        const sidebar = element.querySelector('.dashboard-sidebar');
        if (sidebar) {
            const toggleButton = sidebar.querySelector('.sidebar-toggle');
            if (toggleButton) {
                toggleButton.addEventListener('click', () => {
                    this.toggleSidebar(dashboard.id);
                });
            }
        }
        
        // Widget event listeners
        const widgets = element.querySelectorAll('.dashboard-widget');
        widgets.forEach(widget => {
            this.addWidgetEventListeners(dashboard, widget);
        });
    }

    addWidgetEventListeners(dashboard, widget) {
        const { config } = dashboard;
        
        // Widget header event listeners
        const header = widget.querySelector('.dashboard-widget-header');
        if (header) {
            const collapseButton = header.querySelector('.widget-collapse');
            if (collapseButton) {
                collapseButton.addEventListener('click', () => {
                    this.toggleWidgetCollapse(dashboard, widget);
                });
            }
            
            const removeButton = header.querySelector('.widget-remove');
            if (removeButton) {
                removeButton.addEventListener('click', () => {
                    this.removeWidget(dashboard.id, widget.id);
                });
            }
            
            const settingsButton = header.querySelector('.widget-settings');
            if (settingsButton) {
                settingsButton.addEventListener('click', () => {
                    this.openWidgetSettings(dashboard, widget);
                });
            }
        }
        
        // Widget content event listeners
        const content = widget.querySelector('.dashboard-widget-content');
        if (content) {
            content.addEventListener('click', () => {
                this.handleWidgetClick(dashboard, widget);
            });
        }
    }

    createWidget(dashboard, widgetConfig) {
        const { config } = dashboard;
        const widgetId = widgetConfig.id || `widget-${Date.now()}`;
        
        // Create widget object
        const widget = {
            id: widgetId,
            type: widgetConfig.type || 'default',
            title: widgetConfig.title || 'Widget',
            content: widgetConfig.content || '',
            size: widgetConfig.size || { width: 1, height: 1 },
            position: widgetConfig.position || { x: 0, y: 0 },
            config: widgetConfig.config || {},
            data: widgetConfig.data || {},
            isCollapsed: false,
            isVisible: true,
            isDraggable: config.enableDragAndDrop,
            isResizable: config.enableResize,
            isCollapsible: config.enableCollapse,
            isRemovable: true,
            isCustomizable: config.enableCustomization,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        
        return widget;
    }

    renderWidget(dashboard, widget) {
        const { element } = dashboard;
        
        // Create widget element
        const widgetElement = document.createElement('div');
        widgetElement.id = widget.id;
        widgetElement.className = `bento-item dashboard-widget dashboard-widget-${widget.type}`;
        widgetElement.setAttribute('data-widget-id', widget.id);
        widgetElement.setAttribute('data-widget-type', widget.type);
        
        // Set widget size
        if (widget.size.width > 1) {
            widgetElement.classList.add(`span-${widget.size.width}`);
        }
        if (widget.size.height > 1) {
            widgetElement.classList.add(`row-span-${widget.size.height}`);
        }
        
        // Create widget HTML
        widgetElement.innerHTML = this.createWidgetHTML(widget);
        
        // Add to dashboard
        const grid = element.querySelector('.bento-grid');
        if (grid) {
            grid.appendChild(widgetElement);
        }
        
        // Add event listeners
        this.addWidgetEventListeners(dashboard, widgetElement);
        
        // Initialize widget features
        this.initializeWidgetFeatures(dashboard, widget, widgetElement);
        
        return widgetElement;
    }

    createWidgetHTML(widget) {
        return `
            <div class="dashboard-widget">
                <div class="dashboard-widget-header">
                    <h3 class="dashboard-widget-title">${widget.title}</h3>
                    <div class="dashboard-widget-actions">
                        ${widget.isCollapsible ? '<button class="widget-collapse" aria-label="Collapse widget">−</button>' : ''}
                        ${widget.isCustomizable ? '<button class="widget-settings" aria-label="Widget settings">⚙</button>' : ''}
                        ${widget.isRemovable ? '<button class="widget-remove" aria-label="Remove widget">×</button>' : ''}
                    </div>
                </div>
                <div class="dashboard-widget-content">
                    ${widget.content}
                </div>
                <div class="dashboard-widget-footer">
                    <div class="widget-meta">
                        <span class="widget-type">${widget.type}</span>
                        <span class="widget-updated">Updated ${this.formatTimestamp(widget.updatedAt)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    initializeWidgetFeatures(dashboard, widget, widgetElement) {
        const { config } = dashboard;
        
        // Initialize drag and drop
        if (config.enableDragAndDrop && widget.isDraggable) {
            this.initializeWidgetDragAndDrop(dashboard, widget, widgetElement);
        }
        
        // Initialize resize
        if (config.enableResize && widget.isResizable) {
            this.initializeWidgetResize(dashboard, widget, widgetElement);
        }
        
        // Initialize collapse
        if (config.enableCollapse && widget.isCollapsible) {
            this.initializeWidgetCollapse(dashboard, widget, widgetElement);
        }
    }

    initializeWidgetDragAndDrop(dashboard, widget, widgetElement) {
        // Implement drag and drop functionality
        widgetElement.draggable = true;
        
        widgetElement.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', widget.id);
            widgetElement.classList.add('dragging');
        });
        
        widgetElement.addEventListener('dragend', () => {
            widgetElement.classList.remove('dragging');
        });
        
        widgetElement.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        
        widgetElement.addEventListener('drop', (e) => {
            e.preventDefault();
            const draggedWidgetId = e.dataTransfer.getData('text/plain');
            this.handleWidgetDrop(dashboard, draggedWidgetId, widget.id);
        });
    }

    initializeWidgetResize(dashboard, widget, widgetElement) {
        // Implement resize functionality
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'widget-resize-handle';
        resizeHandle.innerHTML = '↘';
        widgetElement.appendChild(resizeHandle);
        
        resizeHandle.addEventListener('mousedown', (e) => {
            this.startWidgetResize(dashboard, widget, widgetElement, e);
        });
    }

    initializeWidgetCollapse(dashboard, widget, widgetElement) {
        // Implement collapse functionality
        const content = widgetElement.querySelector('.dashboard-widget-content');
        const collapseButton = widgetElement.querySelector('.widget-collapse');
        
        if (collapseButton && content) {
            collapseButton.addEventListener('click', () => {
                this.toggleWidgetCollapse(dashboard, widget, widgetElement);
            });
        }
    }

    toggleWidgetCollapse(dashboard, widget, widgetElement) {
        const { config } = dashboard;
        
        // Toggle collapse state
        widget.isCollapsed = !widget.isCollapsed;
        
        const content = widgetElement.querySelector('.dashboard-widget-content');
        const collapseButton = widgetElement.querySelector('.widget-collapse');
        
        if (content && collapseButton) {
            if (widget.isCollapsed) {
                content.style.display = 'none';
                collapseButton.textContent = '+';
                collapseButton.setAttribute('aria-label', 'Expand widget');
            } else {
                content.style.display = 'block';
                collapseButton.textContent = '−';
                collapseButton.setAttribute('aria-label', 'Collapse widget');
            }
        }
        
        // Update widget
        widget.updatedAt = Date.now();
        
        // Trigger event
        this.triggerEvent(dashboard.element, 'dashboard:widget:collapse', { 
            dashboard: config, 
            widget, 
            isCollapsed: widget.isCollapsed 
        });
    }

    handleWidgetDrop(dashboard, draggedWidgetId, targetWidgetId) {
        const { config } = dashboard;
        
        // Swap widget positions
        const draggedWidget = dashboard.widgets.get(draggedWidgetId);
        const targetWidget = dashboard.widgets.get(targetWidgetId);
        
        if (draggedWidget && targetWidget) {
            const tempPosition = draggedWidget.position;
            draggedWidget.position = targetWidget.position;
            targetWidget.position = tempPosition;
            
            // Re-render widgets
            this.renderWidget(dashboard, draggedWidget);
            this.renderWidget(dashboard, targetWidget);
        }
        
        // Trigger event
        this.triggerEvent(dashboard.element, 'dashboard:widget:drop', { 
            dashboard: config, 
            draggedWidgetId, 
            targetWidgetId 
        });
    }

    startWidgetResize(dashboard, widget, widgetElement, e) {
        const { config } = dashboard;
        
        // Implement resize functionality
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = widgetElement.offsetWidth;
        const startHeight = widgetElement.offsetHeight;
        
        const handleMouseMove = (e) => {
            const newWidth = startWidth + (e.clientX - startX);
            const newHeight = startHeight + (e.clientY - startY);
            
            widgetElement.style.width = `${newWidth}px`;
            widgetElement.style.height = `${newHeight}px`;
        };
        
        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            
            // Update widget size
            widget.size.width = Math.ceil(widgetElement.offsetWidth / 100);
            widget.size.height = Math.ceil(widgetElement.offsetHeight / 100);
            widget.updatedAt = Date.now();
            
            // Trigger event
            this.triggerEvent(dashboard.element, 'dashboard:widget:resize', { 
                dashboard: config, 
                widget, 
                size: widget.size 
            });
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    handleWidgetClick(dashboard, widget) {
        const { config } = dashboard;
        
        // Trigger event
        this.triggerEvent(dashboard.element, 'dashboard:widget:click', { 
            dashboard: config, 
            widget 
        });
    }

    openWidgetSettings(dashboard, widget) {
        const { config } = dashboard;
        
        // Open widget settings modal
        // Implementation depends on modal system
        
        // Trigger event
        this.triggerEvent(dashboard.element, 'dashboard:widget:settings', { 
            dashboard: config, 
            widget 
        });
    }

    refreshWidget(dashboard, widget) {
        const { config } = dashboard;
        
        // Refresh widget data
        // Implementation depends on widget type
        
        // Update widget
        widget.updatedAt = Date.now();
        
        // Re-render widget
        this.renderWidget(dashboard, widget);
        
        // Trigger event
        this.triggerEvent(dashboard.element, 'dashboard:widget:refresh', { 
            dashboard: config, 
            widget 
        });
    }

    destroyWidget(dashboard, widget) {
        const { element } = dashboard;
        
        // Remove widget element
        const widgetElement = element.querySelector(`[data-widget-id="${widget.id}"]`);
        if (widgetElement) {
            widgetElement.remove();
        }
    }

    addWidgetToLayout(dashboard, widget) {
        // Add widget to layout
        dashboard.layout.push({
            id: widget.id,
            type: widget.type,
            size: widget.size,
            position: widget.position,
            config: widget.config
        });
    }

    removeWidgetFromLayout(dashboard, widget) {
        // Remove widget from layout
        dashboard.layout = dashboard.layout.filter(item => item.id !== widget.id);
    }

    loadRoleLayout(dashboard, role) {
        // Load role-specific layout
        const roleLayout = this.getRoleLayout(role);
        if (roleLayout) {
            dashboard.layout = roleLayout;
            this.renderLayout(dashboard);
        }
    }

    getRoleLayout(role) {
        // Get role-specific layout
        const layouts = {
            worker: [
                { id: 'worker-stats', type: 'stats', size: { width: 2, height: 1 }, position: { x: 0, y: 0 } },
                { id: 'worker-tasks', type: 'list', size: { width: 1, height: 2 }, position: { x: 2, y: 0 } },
                { id: 'worker-progress', type: 'progress', size: { width: 1, height: 1 }, position: { x: 3, y: 0 } }
            ],
            'factory-admin': [
                { id: 'admin-stats', type: 'stats', size: { width: 3, height: 1 }, position: { x: 0, y: 0 } },
                { id: 'admin-chart', type: 'chart', size: { width: 2, height: 2 }, position: { x: 0, y: 1 } },
                { id: 'admin-table', type: 'table', size: { width: 1, height: 2 }, position: { x: 2, y: 1 } }
            ],
            'hr-staff': [
                { id: 'hr-stats', type: 'stats', size: { width: 2, height: 1 }, position: { x: 0, y: 0 } },
                { id: 'hr-calendar', type: 'calendar', size: { width: 2, height: 2 }, position: { x: 2, y: 0 } }
            ],
            'grievance-committee': [
                { id: 'grievance-stats', type: 'stats', size: { width: 2, height: 1 }, position: { x: 0, y: 0 } },
                { id: 'grievance-list', type: 'list', size: { width: 2, height: 2 }, position: { x: 0, y: 1 } }
            ],
            auditor: [
                { id: 'auditor-stats', type: 'stats', size: { width: 3, height: 1 }, position: { x: 0, y: 0 } },
                { id: 'auditor-chart', type: 'chart', size: { width: 2, height: 2 }, position: { x: 0, y: 1 } },
                { id: 'auditor-table', type: 'table', size: { width: 1, height: 2 }, position: { x: 2, y: 1 } }
            ],
            'analytics-user': [
                { id: 'analytics-stats', type: 'stats', size: { width: 4, height: 1 }, position: { x: 0, y: 0 } },
                { id: 'analytics-chart', type: 'chart', size: { width: 2, height: 2 }, position: { x: 0, y: 1 } },
                { id: 'analytics-table', type: 'table', size: { width: 2, height: 2 }, position: { x: 2, y: 1 } }
            ],
            'super-admin': [
                { id: 'admin-stats', type: 'stats', size: { width: 4, height: 1 }, position: { x: 0, y: 0 } },
                { id: 'admin-chart', type: 'chart', size: { width: 2, height: 2 }, position: { x: 0, y: 1 } },
                { id: 'admin-table', type: 'table', size: { width: 2, height: 2 }, position: { x: 2, y: 1 } },
                { id: 'admin-list', type: 'list', size: { width: 4, height: 1 }, position: { x: 0, y: 3 } }
            ]
        };
        
        return layouts[role] || [];
    }

    updateRoleWidgets(dashboard, role) {
        // Update widgets for role
        dashboard.widgets.forEach((widget) => {
            this.updateWidgetForRole(dashboard, widget, role);
        });
    }

    updateWidgetForRole(dashboard, widget, role) {
        // Update widget for role
        // Implementation depends on widget type and role
    }

    renderLayout(dashboard) {
        // Render dashboard layout
        const { element } = dashboard;
        
        // Clear existing widgets
        const grid = element.querySelector('.bento-grid');
        if (grid) {
            grid.innerHTML = '';
        }
        
        // Render layout widgets
        dashboard.layout.forEach((layoutItem) => {
            const widget = dashboard.widgets.get(layoutItem.id);
            if (widget) {
                this.renderWidget(dashboard, widget);
            }
        });
    }

    enableCustomization(dashboard) {
        // Enable dashboard customization
        const { element } = dashboard;
        
        // Add customization controls
        const customizationPanel = document.createElement('div');
        customizationPanel.className = 'dashboard-customization-panel';
        customizationPanel.innerHTML = `
            <div class="customization-header">
                <h3>Customize Dashboard</h3>
                <button class="customization-close">×</button>
            </div>
            <div class="customization-content">
                <div class="widget-palette">
                    <h4>Available Widgets</h4>
                    <div class="widget-items">
                        <div class="widget-item" data-type="stats">Stats</div>
                        <div class="widget-item" data-type="chart">Chart</div>
                        <div class="widget-item" data-type="table">Table</div>
                        <div class="widget-item" data-type="list">List</div>
                        <div class="widget-item" data-type="progress">Progress</div>
                        <div class="widget-item" data-type="calendar">Calendar</div>
                    </div>
                </div>
            </div>
        `;
        
        element.appendChild(customizationPanel);
        
        // Add event listeners
        const closeButton = customizationPanel.querySelector('.customization-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.toggleCustomization(dashboard.id);
            });
        }
        
        const widgetItems = customizationPanel.querySelectorAll('.widget-item');
        widgetItems.forEach(item => {
            item.addEventListener('click', () => {
                const type = item.getAttribute('data-type');
                this.addWidget(dashboard.id, { type, title: `${type} Widget` });
            });
        });
    }

    disableCustomization(dashboard) {
        // Disable dashboard customization
        const { element } = dashboard;
        
        // Remove customization panel
        const customizationPanel = element.querySelector('.dashboard-customization-panel');
        if (customizationPanel) {
            customizationPanel.remove();
        }
    }

    getDashboardExportData(dashboard) {
        // Get dashboard export data
        return {
            id: dashboard.id,
            role: dashboard.currentRole,
            layout: dashboard.layout,
            widgets: Array.from(dashboard.widgets.values()),
            config: dashboard.config,
            exportedAt: Date.now()
        };
    }

    exportToCSV(data) {
        // Export to CSV format
        const headers = ['ID', 'Type', 'Title', 'Size', 'Position'];
        const rows = data.widgets.map(widget => [
            widget.id,
            widget.type,
            widget.title,
            `${widget.size.width}x${widget.size.height}`,
            `${widget.position.x},${widget.position.y}`
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    exportToXML(data) {
        // Export to XML format
        const xml = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<dashboard>',
            `  <id>${data.id}</id>`,
            `  <role>${data.role}</role>`,
            `  <exportedAt>${data.exportedAt}</exportedAt>`,
            '  <widgets>',
            ...data.widgets.map(widget => [
                '    <widget>',
                `      <id>${widget.id}</id>`,
                `      <type>${widget.type}</type>`,
                `      <title>${widget.title}</title>`,
                `      <size width="${widget.size.width}" height="${widget.size.height}" />`,
                `      <position x="${widget.position.x}" y="${widget.position.y}" />`,
                '    </widget>'
            ].join('\n')),
            '  </widgets>',
            '</dashboard>'
        ].join('\n');
        
        return xml;
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    saveDashboardLayout(dashboard) {
        try {
            const layoutData = {
                id: dashboard.id,
                role: dashboard.currentRole,
                layout: dashboard.layout,
                widgets: Array.from(dashboard.widgets.values()),
                savedAt: Date.now()
            };
            
            localStorage.setItem(`${this.config.storageKey}-${dashboard.id}`, JSON.stringify(layoutData));
        } catch (error) {
            console.error('Error saving dashboard layout:', error);
        }
    }

    loadDashboardLayout(dashboard) {
        try {
            const layoutData = localStorage.getItem(`${this.config.storageKey}-${dashboard.id}`);
            if (layoutData) {
                const data = JSON.parse(layoutData);
                dashboard.layout = data.layout || [];
                dashboard.currentRole = data.role || 'worker';
                this.renderLayout(dashboard);
            }
        } catch (error) {
            console.error('Error loading dashboard layout:', error);
        }
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) { // Less than 1 minute
            return 'Just now';
        } else if (diff < 3600000) { // Less than 1 hour
            const minutes = Math.floor(diff / 60000);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diff < 86400000) { // Less than 1 day
            const hours = Math.floor(diff / 3600000);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    // Event Handlers
    handleResize() {
        this.dashboards.forEach((dashboard) => {
            if (dashboard.isFullscreen) {
                this.toggleFullscreen(dashboard.id);
            }
        });
    }

    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'r':
                    e.preventDefault();
                    this.refreshAllDashboards();
                    break;
                case 'f':
                    e.preventDefault();
                    this.toggleFullscreen(this.getFirstDashboardId());
                    break;
                case 's':
                    e.preventDefault();
                    this.toggleSidebar(this.getFirstDashboardId());
                    break;
                case 'c':
                    e.preventDefault();
                    this.toggleCustomization(this.getFirstDashboardId());
                    break;
                case 'p':
                    e.preventDefault();
                    this.printDashboard(this.getFirstDashboardId());
                    break;
                case 'e':
                    e.preventDefault();
                    this.exportDashboard(this.getFirstDashboardId());
                    break;
            }
        }
    }

    handleVisibilityChange() {
        if (document.hidden) {
            this.pauseAutoRefresh();
        } else {
            this.resumeAutoRefresh();
        }
    }

    pauseAutoRefresh() {
        // Pause auto refresh when tab is hidden
    }

    resumeAutoRefresh() {
        // Resume auto refresh when tab is visible
    }

    getFirstDashboardId() {
        const firstDashboard = this.dashboards.values().next().value;
        return firstDashboard ? firstDashboard.id : null;
    }

    // Utility Methods
    triggerEvent(element, eventName, detail) {
        const event = new CustomEvent(eventName, {
            detail,
            bubbles: true,
            cancelable: true
        });
        element.dispatchEvent(event);
    }

    // Configuration
    setConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    getConfig() {
        return { ...this.config };
    }

    // Cleanup
    destroy() {
        this.dashboards.forEach((dashboard, id) => {
            this.destroyDashboard(id);
        });
        this.dashboards.clear();
    }

    destroyDashboard(id) {
        const dashboard = this.dashboards.get(id);
        if (!dashboard) return;
        
        // Clear timers
        if (dashboard.refreshTimer) {
            clearInterval(dashboard.refreshTimer);
        }
        if (dashboard.saveTimer) {
            clearInterval(dashboard.saveTimer);
        }
        
        // Remove event listeners
        const { element } = dashboard;
        element.removeEventListener('resize', this.handleResize);
        element.removeEventListener('keydown', this.handleKeyboardShortcuts);
        element.removeEventListener('visibilitychange', this.handleVisibilityChange);
        
        // Remove from dashboards map
        this.dashboards.delete(id);
        
        return this;
    }
}

// Initialize role dashboard manager
document.addEventListener('DOMContentLoaded', () => {
    window.roleDashboardManager = new RoleDashboardManager();
});

// Global access
window.RoleDashboardManager = RoleDashboardManager;

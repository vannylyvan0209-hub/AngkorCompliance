/**
 * Angkor Compliance Platform - Data Tables System JavaScript 2025
 * 
 * Modern data table system with 2025 design patterns,
 * accessibility support, and responsive design.
 */

class DataTableManager {
    constructor() {
        this.tables = new Map();
        this.config = {
            sortable: true,
            filterable: true,
            paginated: true,
            selectable: false,
            expandable: false,
            searchable: true,
            exportable: false,
            responsive: true,
            accessibility: true,
            animation: true,
            pageSize: 10,
            pageSizes: [5, 10, 25, 50, 100],
            sortDirection: 'asc',
            emptyMessage: 'No data available',
            loadingMessage: 'Loading...',
            errorMessage: 'An error occurred while loading data',
            animationDuration: 300,
            animationEasing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeTables();
        this.setupAccessibility();
        this.setupResponsive();
    }

    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });
    }

    initializeTables() {
        const tableElements = document.querySelectorAll('.data-table');
        
        tableElements.forEach((element, index) => {
            const id = element.id || `data-table-${index}`;
            this.createTable(id, element);
        });
    }

    setupAccessibility() {
        if (!this.config.accessibility) return;
        
        this.tables.forEach((table, id) => {
            const { element } = table;
            
            // Add ARIA attributes
            if (!element.getAttribute('role')) {
                element.setAttribute('role', 'table');
            }
            
            if (!element.getAttribute('aria-label')) {
                element.setAttribute('aria-label', 'Data table');
            }
            
            // Add semantic roles to table elements
            const thead = element.querySelector('thead');
            if (thead) {
                thead.setAttribute('role', 'rowgroup');
            }
            
            const tbody = element.querySelector('tbody');
            if (tbody) {
                tbody.setAttribute('role', 'rowgroup');
            }
            
            const tfoot = element.querySelector('tfoot');
            if (tfoot) {
                tfoot.setAttribute('role', 'rowgroup');
            }
            
            // Add roles to headers and cells
            const headers = element.querySelectorAll('th');
            headers.forEach(header => {
                if (!header.getAttribute('role')) {
                    header.setAttribute('role', 'columnheader');
                }
            });
            
            const cells = element.querySelectorAll('td');
            cells.forEach(cell => {
                if (!cell.getAttribute('role')) {
                    cell.setAttribute('role', 'cell');
                }
            });
            
            const rows = element.querySelectorAll('tr');
            rows.forEach(row => {
                if (!row.getAttribute('role')) {
                    row.setAttribute('role', 'row');
                }
            });
        });
    }

    setupResponsive() {
        if (!this.config.responsive) return;
        
        // Add responsive classes based on screen size
        const updateResponsiveClasses = () => {
            this.tables.forEach((table) => {
                const { element } = table;
                
                if (window.innerWidth < 768) {
                    element.classList.add('data-table-mobile');
                } else {
                    element.classList.remove('data-table-mobile');
                }
                
                if (window.innerWidth < 480) {
                    element.classList.add('data-table-small');
                } else {
                    element.classList.remove('data-table-small');
                }
            });
        };
        
        updateResponsiveClasses();
        window.addEventListener('resize', updateResponsiveClasses);
    }

    // Public Methods
    createTable(id, element, options = {}) {
        const config = { ...this.config, ...options };
        
        // Store table
        this.tables.set(id, {
            id,
            element,
            config,
            data: [],
            filteredData: [],
            sortedData: [],
            currentPage: 1,
            totalPages: 1,
            selectedRows: new Set(),
            sortColumn: null,
            sortDirection: 'asc',
            filters: {},
            searchTerm: '',
            isLoading: false,
            error: null
        });
        
        // Apply configuration
        this.applyConfiguration(this.tables.get(id));
        
        return this.tables.get(id);
    }

    loadData(id, data, options = {}) {
        const table = this.tables.get(id);
        if (!table) {
            console.error(`Table with id "${id}" not found`);
            return;
        }
        
        const { element, config } = table;
        
        // Set loading state
        this.setLoadingState(table, true);
        
        // Simulate loading delay
        setTimeout(() => {
            try {
                // Store data
                table.data = Array.isArray(data) ? data : [];
                table.filteredData = [...table.data];
                table.sortedData = [...table.data];
                table.currentPage = 1;
                table.error = null;
                
                // Render table
                this.renderTable(table);
                
                // Update pagination
                if (config.paginated) {
                    this.updatePagination(table);
                }
                
                // Set loading state
                this.setLoadingState(table, false);
                
                // Trigger event
                this.triggerEvent(element, 'table:data:loaded', { 
                    table: config, 
                    data: table.data 
                });
                
            } catch (error) {
                table.error = error;
                this.setErrorState(table, error.message);
                this.setLoadingState(table, false);
                
                // Trigger event
                this.triggerEvent(element, 'table:data:error', { 
                    table: config, 
                    error: error 
                });
            }
        }, config.animationDuration);
        
        return this;
    }

    sortTable(id, column, direction = 'asc') {
        const table = this.tables.get(id);
        if (!table) {
            console.error(`Table with id "${id}" not found`);
            return;
        }
        
        const { config } = table;
        
        if (!config.sortable) return;
        
        // Update sort state
        table.sortColumn = column;
        table.sortDirection = direction;
        
        // Sort data
        table.sortedData = [...table.filteredData].sort((a, b) => {
            const aVal = this.getCellValue(a, column);
            const bVal = this.getCellValue(b, column);
            
            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });
        
        // Update current page
        table.currentPage = 1;
        
        // Render table
        this.renderTable(table);
        
        // Update pagination
        if (config.paginated) {
            this.updatePagination(table);
        }
        
        // Update sort indicators
        this.updateSortIndicators(table);
        
        // Trigger event
        this.triggerEvent(table.element, 'table:sort', { 
            table: config, 
            column, 
            direction 
        });
        
        return this;
    }

    filterTable(id, filters) {
        const table = this.tables.get(id);
        if (!table) {
            console.error(`Table with id "${id}" not found`);
            return;
        }
        
        const { config } = table;
        
        if (!config.filterable) return;
        
        // Update filters
        table.filters = { ...table.filters, ...filters };
        
        // Filter data
        table.filteredData = table.data.filter(row => {
            return Object.entries(table.filters).every(([column, value]) => {
                if (!value) return true;
                const cellValue = this.getCellValue(row, column);
                return cellValue.toString().toLowerCase().includes(value.toLowerCase());
            });
        });
        
        // Apply search
        if (table.searchTerm) {
            table.filteredData = table.filteredData.filter(row => {
                return Object.values(row).some(value => 
                    value.toString().toLowerCase().includes(table.searchTerm.toLowerCase())
                );
            });
        }
        
        // Update sorted data
        if (table.sortColumn) {
            this.sortTable(id, table.sortColumn, table.sortDirection);
        } else {
            table.sortedData = [...table.filteredData];
        }
        
        // Update current page
        table.currentPage = 1;
        
        // Render table
        this.renderTable(table);
        
        // Update pagination
        if (config.paginated) {
            this.updatePagination(table);
        }
        
        // Trigger event
        this.triggerEvent(table.element, 'table:filter', { 
            table: config, 
            filters: table.filters 
        });
        
        return this;
    }

    searchTable(id, searchTerm) {
        const table = this.tables.get(id);
        if (!table) {
            console.error(`Table with id "${id}" not found`);
            return;
        }
        
        const { config } = table;
        
        if (!config.searchable) return;
        
        // Update search term
        table.searchTerm = searchTerm;
        
        // Apply search
        table.filteredData = table.data.filter(row => {
            if (!searchTerm) return true;
            return Object.values(row).some(value => 
                value.toString().toLowerCase().includes(searchTerm.toLowerCase())
            );
        });
        
        // Apply filters
        if (Object.keys(table.filters).length > 0) {
            table.filteredData = table.filteredData.filter(row => {
                return Object.entries(table.filters).every(([column, value]) => {
                    if (!value) return true;
                    const cellValue = this.getCellValue(row, column);
                    return cellValue.toString().toLowerCase().includes(value.toLowerCase());
                });
            });
        }
        
        // Update sorted data
        if (table.sortColumn) {
            this.sortTable(id, table.sortColumn, table.sortDirection);
        } else {
            table.sortedData = [...table.filteredData];
        }
        
        // Update current page
        table.currentPage = 1;
        
        // Render table
        this.renderTable(table);
        
        // Update pagination
        if (config.paginated) {
            this.updatePagination(table);
        }
        
        // Trigger event
        this.triggerEvent(table.element, 'table:search', { 
            table: config, 
            searchTerm 
        });
        
        return this;
    }

    paginateTable(id, page) {
        const table = this.tables.get(id);
        if (!table) {
            console.error(`Table with id "${id}" not found`);
            return;
        }
        
        const { config } = table;
        
        if (!config.paginated) return;
        
        // Update current page
        table.currentPage = page;
        
        // Render table
        this.renderTable(table);
        
        // Update pagination
        this.updatePagination(table);
        
        // Trigger event
        this.triggerEvent(table.element, 'table:paginate', { 
            table: config, 
            page 
        });
        
        return this;
    }

    selectRow(id, rowIndex, selected = true) {
        const table = this.tables.get(id);
        if (!table) {
            console.error(`Table with id "${id}" not found`);
            return;
        }
        
        const { config } = table;
        
        if (!config.selectable) return;
        
        // Update selection
        if (selected) {
            table.selectedRows.add(rowIndex);
        } else {
            table.selectedRows.delete(rowIndex);
        }
        
        // Update row classes
        this.updateRowSelection(table);
        
        // Trigger event
        this.triggerEvent(table.element, 'table:row:select', { 
            table: config, 
            rowIndex, 
            selected 
        });
        
        return this;
    }

    selectAllRows(id, selected = true) {
        const table = this.tables.get(id);
        if (!table) {
            console.error(`Table with id "${id}" not found`);
            return;
        }
        
        const { config } = table;
        
        if (!config.selectable) return;
        
        // Update selection
        if (selected) {
            table.selectedRows = new Set(table.sortedData.map((_, index) => index));
        } else {
            table.selectedRows.clear();
        }
        
        // Update row classes
        this.updateRowSelection(table);
        
        // Trigger event
        this.triggerEvent(table.element, 'table:select:all', { 
            table: config, 
            selected 
        });
        
        return this;
    }

    expandRow(id, rowIndex, expanded = true) {
        const table = this.tables.get(id);
        if (!table) {
            console.error(`Table with id "${id}" not found`);
            return;
        }
        
        const { config } = table;
        
        if (!config.expandable) return;
        
        // Update expansion
        const row = table.element.querySelector(`tbody tr:nth-child(${rowIndex + 1})`);
        if (row) {
            const expandContent = row.querySelector('.expand-content');
            const expandToggle = row.querySelector('.expand-toggle');
            
            if (expandContent && expandToggle) {
                if (expanded) {
                    expandContent.classList.add('show');
                    expandToggle.classList.add('expanded');
                } else {
                    expandContent.classList.remove('show');
                    expandToggle.classList.remove('expanded');
                }
            }
        }
        
        // Trigger event
        this.triggerEvent(table.element, 'table:row:expand', { 
            table: config, 
            rowIndex, 
            expanded 
        });
        
        return this;
    }

    exportTable(id, format = 'csv') {
        const table = this.tables.get(id);
        if (!table) {
            console.error(`Table with id "${id}" not found`);
            return;
        }
        
        const { config } = table;
        
        if (!config.exportable) return;
        
        // Export data
        const data = table.sortedData;
        let content = '';
        
        switch (format) {
            case 'csv':
                content = this.exportToCSV(data);
                break;
            case 'json':
                content = JSON.stringify(data, null, 2);
                break;
            case 'xml':
                content = this.exportToXML(data);
                break;
            default:
                console.error(`Unsupported export format: ${format}`);
                return;
        }
        
        // Download file
        this.downloadFile(content, `table-${id}.${format}`, `text/${format}`);
        
        // Trigger event
        this.triggerEvent(table.element, 'table:export', { 
            table: config, 
            format, 
            data 
        });
        
        return this;
    }

    // Private Methods
    applyConfiguration(table) {
        const { element, config } = table;
        
        // Add configuration classes
        if (config.sortable) element.classList.add('data-table-sortable');
        if (config.filterable) element.classList.add('data-table-filterable');
        if (config.paginated) element.classList.add('data-table-paginated');
        if (config.selectable) element.classList.add('data-table-selectable');
        if (config.expandable) element.classList.add('data-table-expandable');
        if (config.searchable) element.classList.add('data-table-searchable');
        if (config.exportable) element.classList.add('data-table-exportable');
        
        // Add event listeners
        this.addEventListeners(table);
        
        // Initialize features
        if (config.filterable) this.initializeFilters(table);
        if (config.paginated) this.initializePagination(table);
        if (config.selectable) this.initializeSelection(table);
        if (config.expandable) this.initializeExpansion(table);
        if (config.searchable) this.initializeSearch(table);
        if (config.exportable) this.initializeExport(table);
    }

    addEventListeners(table) {
        const { element, config } = table;
        
        // Sort event listeners
        if (config.sortable) {
            const headers = element.querySelectorAll('th.sortable');
            headers.forEach((header, index) => {
                header.addEventListener('click', () => {
                    this.handleSortClick(table, index);
                });
            });
        }
        
        // Selection event listeners
        if (config.selectable) {
            const rows = element.querySelectorAll('tbody tr');
            rows.forEach((row, index) => {
                row.addEventListener('click', (e) => {
                    if (!e.target.closest('button, input, select, a')) {
                        this.handleRowClick(table, index);
                    }
                });
            });
        }
        
        // Expansion event listeners
        if (config.expandable) {
            const expandToggles = element.querySelectorAll('.expand-toggle');
            expandToggles.forEach((toggle, index) => {
                toggle.addEventListener('click', () => {
                    this.handleExpandClick(table, index);
                });
            });
        }
    }

    renderTable(table) {
        const { element, config, sortedData } = table;
        
        // Get current page data
        const pageData = this.getPageData(table);
        
        // Render tbody
        const tbody = element.querySelector('tbody');
        if (tbody) {
            tbody.innerHTML = '';
            
            if (pageData.length === 0) {
                const emptyRow = document.createElement('tr');
                emptyRow.innerHTML = `<td colspan="100%" class="data-table-empty">${config.emptyMessage}</td>`;
                tbody.appendChild(emptyRow);
            } else {
                pageData.forEach((row, index) => {
                    const tr = this.createTableRow(table, row, index);
                    tbody.appendChild(tr);
                });
            }
        }
    }

    createTableRow(table, rowData, index) {
        const { config } = table;
        const tr = document.createElement('tr');
        
        // Add selection checkbox if selectable
        if (config.selectable) {
            const td = document.createElement('td');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = table.selectedRows.has(index);
            checkbox.addEventListener('change', (e) => {
                this.selectRow(table.id, index, e.target.checked);
            });
            td.appendChild(checkbox);
            tr.appendChild(td);
        }
        
        // Add expand toggle if expandable
        if (config.expandable) {
            const td = document.createElement('td');
            const toggle = document.createElement('button');
            toggle.className = 'expand-toggle';
            toggle.innerHTML = '▶';
            toggle.addEventListener('click', () => {
                this.expandRow(table.id, index);
            });
            td.appendChild(toggle);
            tr.appendChild(td);
        }
        
        // Add data cells
        Object.values(rowData).forEach(value => {
            const td = document.createElement('td');
            td.textContent = value;
            tr.appendChild(td);
        });
        
        // Add expand content if expandable
        if (config.expandable) {
            const td = document.createElement('td');
            td.colSpan = Object.keys(rowData).length + (config.selectable ? 1 : 0);
            td.className = 'expand-content';
            td.innerHTML = '<div>Expandable content here</div>';
            tr.appendChild(td);
        }
        
        return tr;
    }

    getPageData(table) {
        const { config, sortedData, currentPage } = table;
        
        if (!config.paginated) {
            return sortedData;
        }
        
        const startIndex = (currentPage - 1) * config.pageSize;
        const endIndex = startIndex + config.pageSize;
        
        return sortedData.slice(startIndex, endIndex);
    }

    updatePagination(table) {
        const { config, sortedData, currentPage } = table;
        
        if (!config.paginated) return;
        
        const totalPages = Math.ceil(sortedData.length / config.pageSize);
        table.totalPages = totalPages;
        
        const pagination = table.element.querySelector('.table-pagination');
        if (pagination) {
            this.renderPagination(table, pagination);
        }
    }

    renderPagination(table, pagination) {
        const { config, currentPage, totalPages } = table;
        
        // Update pagination info
        const info = pagination.querySelector('.pagination-info');
        if (info) {
            const startIndex = (currentPage - 1) * config.pageSize + 1;
            const endIndex = Math.min(currentPage * config.pageSize, table.sortedData.length);
            info.textContent = `Showing ${startIndex}-${endIndex} of ${table.sortedData.length} entries`;
        }
        
        // Update pagination controls
        const controls = pagination.querySelector('.pagination-controls');
        if (controls) {
            controls.innerHTML = '';
            
            // Previous button
            const prevButton = document.createElement('button');
            prevButton.className = 'pagination-button';
            prevButton.textContent = 'Previous';
            prevButton.disabled = currentPage === 1;
            prevButton.addEventListener('click', () => {
                this.paginateTable(table.id, currentPage - 1);
            });
            controls.appendChild(prevButton);
            
            // Page buttons
            for (let i = 1; i <= totalPages; i++) {
                const pageButton = document.createElement('button');
                pageButton.className = `pagination-button ${i === currentPage ? 'active' : ''}`;
                pageButton.textContent = i;
                pageButton.addEventListener('click', () => {
                    this.paginateTable(table.id, i);
                });
                controls.appendChild(pageButton);
            }
            
            // Next button
            const nextButton = document.createElement('button');
            nextButton.className = 'pagination-button';
            nextButton.textContent = 'Next';
            nextButton.disabled = currentPage === totalPages;
            nextButton.addEventListener('click', () => {
                this.paginateTable(table.id, currentPage + 1);
            });
            controls.appendChild(nextButton);
        }
    }

    updateSortIndicators(table) {
        const { element, sortColumn, sortDirection } = table;
        
        // Remove existing sort indicators
        const headers = element.querySelectorAll('th');
        headers.forEach(header => {
            header.classList.remove('sorted', 'sorted-asc', 'sorted-desc');
        });
        
        // Add sort indicator to current column
        if (sortColumn !== null) {
            const header = headers[sortColumn];
            if (header) {
                header.classList.add('sorted', `sorted-${sortDirection}`);
            }
        }
    }

    updateRowSelection(table) {
        const { element, selectedRows } = table;
        const rows = element.querySelectorAll('tbody tr');
        
        rows.forEach((row, index) => {
            if (selectedRows.has(index)) {
                row.classList.add('selected');
            } else {
                row.classList.remove('selected');
            }
        });
    }

    setLoadingState(table, isLoading) {
        const { element } = table;
        table.isLoading = isLoading;
        
        if (isLoading) {
            element.classList.add('data-table-loading');
        } else {
            element.classList.remove('data-table-loading');
        }
    }

    setErrorState(table, errorMessage) {
        const { element, config } = table;
        
        const tbody = element.querySelector('tbody');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="100%" class="data-table-error">${errorMessage}</td></tr>`;
        }
    }

    getCellValue(row, column) {
        if (typeof row === 'object' && row !== null) {
            return row[column] || '';
        }
        return '';
    }

    // Event Handlers
    handleSortClick(table, columnIndex) {
        const { sortColumn, sortDirection } = table;
        
        let newDirection = 'asc';
        if (sortColumn === columnIndex) {
            newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        }
        
        this.sortTable(table.id, columnIndex, newDirection);
    }

    handleRowClick(table, rowIndex) {
        const { config, selectedRows } = table;
        
        if (!config.selectable) return;
        
        const isSelected = selectedRows.has(rowIndex);
        this.selectRow(table.id, rowIndex, !isSelected);
    }

    handleExpandClick(table, rowIndex) {
        const { config } = table;
        
        if (!config.expandable) return;
        
        const row = table.element.querySelector(`tbody tr:nth-child(${rowIndex + 1})`);
        if (row) {
            const expandContent = row.querySelector('.expand-content');
            const isExpanded = expandContent.classList.contains('show');
            this.expandRow(table.id, rowIndex, !isExpanded);
        }
    }

    handleResize() {
        this.tables.forEach((table) => {
            if (table.config.responsive) {
                this.updateResponsiveLayout(table);
            }
        });
    }

    handleKeyboardNavigation(e) {
        // Handle keyboard navigation for tables
        if (e.target.closest('.data-table')) {
            const table = this.findTableByElement(e.target.closest('.data-table'));
            if (table) {
                this.handleTableKeyboardNavigation(e, table);
            }
        }
    }

    handleTableKeyboardNavigation(e, table) {
        const { config } = table;
        
        switch (e.key) {
            case 'ArrowUp':
            case 'ArrowDown':
                e.preventDefault();
                this.navigateRows(table, e.key === 'ArrowDown' ? 1 : -1);
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (config.selectable) {
                    this.handleRowClick(table, this.getCurrentRowIndex(table));
                }
                break;
        }
    }

    navigateRows(table, direction) {
        const { element } = table;
        const rows = element.querySelectorAll('tbody tr');
        const currentIndex = this.getCurrentRowIndex(table);
        
        if (currentIndex !== -1) {
            const newIndex = Math.max(0, Math.min(rows.length - 1, currentIndex + direction));
            rows[newIndex].focus();
        }
    }

    getCurrentRowIndex(table) {
        const { element } = table;
        const rows = element.querySelectorAll('tbody tr');
        
        for (let i = 0; i < rows.length; i++) {
            if (rows[i] === document.activeElement) {
                return i;
            }
        }
        
        return -1;
    }

    // Utility Methods
    findTableByElement(element) {
        for (const table of this.tables.values()) {
            if (table.element === element) {
                return table;
            }
        }
        return null;
    }

    triggerEvent(element, eventName, detail) {
        const event = new CustomEvent(eventName, {
            detail,
            bubbles: true,
            cancelable: true
        });
        element.dispatchEvent(event);
    }

    exportToCSV(data) {
        if (data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
        ].join('\n');
        
        return csvContent;
    }

    exportToXML(data) {
        if (data.length === 0) return '<?xml version="1.0" encoding="UTF-8"?><data></data>';
        
        const headers = Object.keys(data[0]);
        const xmlContent = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<data>',
            ...data.map(row => [
                '  <row>',
                ...headers.map(header => `    <${header}>${row[header] || ''}</${header}>`),
                '  </row>'
            ].join('\n')),
            '</data>'
        ].join('\n');
        
        return xmlContent;
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

    // Configuration
    setConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    getConfig() {
        return { ...this.config };
    }

    // Cleanup
    destroy() {
        this.tables.forEach((table, id) => {
            this.destroyTable(id);
        });
        this.tables.clear();
    }

    destroyTable(id) {
        const table = this.tables.get(id);
        if (!table) return;
        
        // Remove event listeners
        const { element } = table;
        element.removeEventListener('click', this.handleRowClick);
        element.removeEventListener('keydown', this.handleKeyboardNavigation);
        
        // Remove from tables map
        this.tables.delete(id);
        
        return this;
    }
}

// Initialize data table manager
document.addEventListener('DOMContentLoaded', () => {
    window.dataTableManager = new DataTableManager();
});

// Global access
window.DataTableManager = DataTableManager;

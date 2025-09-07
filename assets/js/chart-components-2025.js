/**
 * Angkor Compliance Platform - Chart Components JavaScript 2025
 * 
 * Modern chart and graph components with 2025 design patterns,
 * accessibility support, and responsive design.
 */

class ChartManager {
    constructor() {
        this.charts = new Map();
        this.config = {
            responsive: true,
            maintainAspectRatio: false,
            animation: true,
            animationDuration: 1000,
            animationEasing: 'easeInOutQuart',
            interaction: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    align: 'center',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12,
                            family: 'Inter, sans-serif'
                        }
                    }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#ffffff',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    intersect: false,
                    mode: 'index'
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#6b7280',
                        font: {
                            size: 11,
                            family: 'Inter, sans-serif'
                        }
                    }
                },
                y: {
                    display: true,
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#6b7280',
                        font: {
                            size: 11,
                            family: 'Inter, sans-serif'
                        }
                    }
                }
            },
            elements: {
                point: {
                    radius: 4,
                    hoverRadius: 6,
                    borderWidth: 2
                },
                line: {
                    borderWidth: 2,
                    tension: 0.4
                },
                bar: {
                    borderRadius: 4,
                    borderSkipped: false
                },
                arc: {
                    borderWidth: 2
                }
            },
            colorPalette: [
                '#3b82f6', // primary-500
                '#8b5cf6', // purple-500
                '#10b981', // emerald-500
                '#f59e0b', // amber-500
                '#ef4444', // red-500
                '#06b6d4', // cyan-500
                '#84cc16', // lime-500
                '#f97316', // orange-500
                '#ec4899', // pink-500
                '#6366f1'  // indigo-500
            ]
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeCharts();
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

    initializeCharts() {
        const chartElements = document.querySelectorAll('.chart');
        
        chartElements.forEach((element, index) => {
            const id = element.id || `chart-${index}`;
            this.createChart(id, element);
        });
    }

    setupAccessibility() {
        this.charts.forEach((chart, id) => {
            const { element } = chart;
            
            // Add ARIA attributes
            if (!element.getAttribute('role')) {
                element.setAttribute('role', 'img');
            }
            
            if (!element.getAttribute('aria-label')) {
                element.setAttribute('aria-label', 'Chart');
            }
        });
    }

    setupResponsive() {
        const updateResponsiveClasses = () => {
            this.charts.forEach((chart) => {
                const { element } = chart;
                
                if (window.innerWidth < 768) {
                    element.classList.add('chart-mobile');
                } else {
                    element.classList.remove('chart-mobile');
                }
                
                if (window.innerWidth < 480) {
                    element.classList.add('chart-small');
                } else {
                    element.classList.remove('chart-small');
                }
            });
        };
        
        updateResponsiveClasses();
        window.addEventListener('resize', updateResponsiveClasses);
    }

    // Public Methods
    createChart(id, element, options = {}) {
        const config = { ...this.config, ...options };
        
        // Store chart
        this.charts.set(id, {
            id,
            element,
            config,
            chart: null,
            data: null,
            type: 'line',
            isLoaded: false,
            isAnimating: false,
            error: null
        });
        
        // Apply configuration
        this.applyConfiguration(this.charts.get(id));
        
        return this.charts.get(id);
    }

    setData(id, data) {
        const chart = this.charts.get(id);
        if (!chart) {
            console.error(`Chart with id "${id}" not found`);
            return;
        }
        
        const { config } = chart;
        
        // Update data
        chart.data = data;
        
        // Render chart
        this.renderChart(chart);
        
        // Trigger event
        this.triggerEvent(chart.element, 'chart:data:change', { 
            chart: config, 
            data 
        });
        
        return this;
    }

    setType(id, type) {
        const chart = this.charts.get(id);
        if (!chart) {
            console.error(`Chart with id "${id}" not found`);
            return;
        }
        
        const { config } = chart;
        
        // Update type
        chart.type = type;
        
        // Render chart
        this.renderChart(chart);
        
        // Trigger event
        this.triggerEvent(chart.element, 'chart:type:change', { 
            chart: config, 
            type 
        });
        
        return this;
    }

    updateData(id, data) {
        const chart = this.charts.get(id);
        if (!chart) {
            console.error(`Chart with id "${id}" not found`);
            return;
        }
        
        const { config } = chart;
        
        // Update data
        chart.data = { ...chart.data, ...data };
        
        // Render chart
        this.renderChart(chart);
        
        // Trigger event
        this.triggerEvent(chart.element, 'chart:data:update', { 
            chart: config, 
            data: chart.data 
        });
        
        return this;
    }

    addDataPoint(id, datasetIndex, dataPoint) {
        const chart = this.charts.get(id);
        if (!chart) {
            console.error(`Chart with id "${id}" not found`);
            return;
        }
        
        const { config } = chart;
        
        // Add data point
        if (chart.data && chart.data.datasets && chart.data.datasets[datasetIndex]) {
            chart.data.datasets[datasetIndex].data.push(dataPoint);
        }
        
        // Render chart
        this.renderChart(chart);
        
        // Trigger event
        this.triggerEvent(chart.element, 'chart:data:add', { 
            chart: config, 
            datasetIndex, 
            dataPoint 
        });
        
        return this;
    }

    removeDataPoint(id, datasetIndex, dataPointIndex) {
        const chart = this.charts.get(id);
        if (!chart) {
            console.error(`Chart with id "${id}" not found`);
            return;
        }
        
        const { config } = chart;
        
        // Remove data point
        if (chart.data && chart.data.datasets && chart.data.datasets[datasetIndex]) {
            chart.data.datasets[datasetIndex].data.splice(dataPointIndex, 1);
        }
        
        // Render chart
        this.renderChart(chart);
        
        // Trigger event
        this.triggerEvent(chart.element, 'chart:data:remove', { 
            chart: config, 
            datasetIndex, 
            dataPointIndex 
        });
        
        return this;
    }

    showDataset(id, datasetIndex) {
        const chart = this.charts.get(id);
        if (!chart) {
            console.error(`Chart with id "${id}" not found`);
            return;
        }
        
        const { config } = chart;
        
        // Show dataset
        if (chart.chart && chart.chart.data && chart.chart.data.datasets && chart.chart.data.datasets[datasetIndex]) {
            chart.chart.data.datasets[datasetIndex].hidden = false;
            chart.chart.update();
        }
        
        // Trigger event
        this.triggerEvent(chart.element, 'chart:dataset:show', { 
            chart: config, 
            datasetIndex 
        });
        
        return this;
    }

    hideDataset(id, datasetIndex) {
        const chart = this.charts.get(id);
        if (!chart) {
            console.error(`Chart with id "${id}" not found`);
            return;
        }
        
        const { config } = chart;
        
        // Hide dataset
        if (chart.chart && chart.chart.data && chart.chart.data.datasets && chart.chart.data.datasets[datasetIndex]) {
            chart.chart.data.datasets[datasetIndex].hidden = true;
            chart.chart.update();
        }
        
        // Trigger event
        this.triggerEvent(chart.element, 'chart:dataset:hide', { 
            chart: config, 
            datasetIndex 
        });
        
        return this;
    }

    toggleDataset(id, datasetIndex) {
        const chart = this.charts.get(id);
        if (!chart) {
            console.error(`Chart with id "${id}" not found`);
            return;
        }
        
        const { config } = chart;
        
        // Toggle dataset
        if (chart.chart && chart.chart.data && chart.chart.data.datasets && chart.chart.data.datasets[datasetIndex]) {
            const isHidden = chart.chart.data.datasets[datasetIndex].hidden;
            chart.chart.data.datasets[datasetIndex].hidden = !isHidden;
            chart.chart.update();
        }
        
        // Trigger event
        this.triggerEvent(chart.element, 'chart:dataset:toggle', { 
            chart: config, 
            datasetIndex 
        });
        
        return this;
    }

    exportChart(id, format = 'png') {
        const chart = this.charts.get(id);
        if (!chart) {
            console.error(`Chart with id "${id}" not found`);
            return;
        }
        
        const { config } = chart;
        
        if (!chart.chart) {
            console.error(`Chart with id "${id}" is not initialized`);
            return;
        }
        
        // Export chart
        const dataURL = chart.chart.toBase64Image(format);
        
        // Trigger event
        this.triggerEvent(chart.element, 'chart:export', { 
            chart: config, 
            format, 
            dataURL 
        });
        
        return dataURL;
    }

    downloadChart(id, filename = 'chart', format = 'png') {
        const chart = this.charts.get(id);
        if (!chart) {
            console.error(`Chart with id "${id}" not found`);
            return;
        }
        
        const { config } = chart;
        
        if (!chart.chart) {
            console.error(`Chart with id "${id}" is not initialized`);
            return;
        }
        
        // Download chart
        const dataURL = chart.chart.toBase64Image(format);
        const link = document.createElement('a');
        link.download = `${filename}.${format}`;
        link.href = dataURL;
        link.click();
        
        // Trigger event
        this.triggerEvent(chart.element, 'chart:download', { 
            chart: config, 
            filename, 
            format 
        });
        
        return this;
    }

    // Private Methods
    applyConfiguration(chart) {
        const { element, config } = chart;
        
        // Add configuration classes
        if (config.responsive) element.classList.add('chart-responsive');
        if (config.animation) element.classList.add('chart-animated');
        if (config.interaction) element.classList.add('chart-interactive');
        
        // Add event listeners
        this.addEventListeners(chart);
        
        // Initialize features
        if (config.responsive) this.initializeResponsive(chart);
        if (config.animation) this.initializeAnimation(chart);
        if (config.interaction) this.initializeInteraction(chart);
        
        // Render chart
        this.renderChart(chart);
    }

    addEventListeners(chart) {
        const { element, config } = chart;
        
        // Action event listeners
        const actions = element.querySelectorAll('.chart-action');
        actions.forEach((action, index) => {
            action.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleAction(chart, action, index);
            });
        });
        
        // Legend event listeners
        const legendItems = element.querySelectorAll('.chart-legend-item');
        legendItems.forEach((item, index) => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleLegendClick(chart, item, index);
            });
        });
    }

    renderChart(chart) {
        const { element, config, data, type } = chart;
        
        // Update content
        this.updateChartContent(chart);
        
        // Update legend
        this.updateChartLegend(chart);
        
        // Update state
        this.updateChartState(chart);
        
        // Initialize chart if not already done
        if (!chart.chart && data) {
            this.initializeChart(chart);
        } else if (chart.chart && data) {
            // Update existing chart
            chart.chart.data = data;
            chart.chart.update();
        }
    }

    updateChartContent(chart) {
        const { element, config, data } = chart;
        
        const content = element.querySelector('.chart-content');
        if (!content) return;
        
        const canvas = content.querySelector('.chart-canvas');
        if (!canvas) return;
        
        // Set canvas size
        canvas.width = content.offsetWidth;
        canvas.height = content.offsetHeight;
    }

    updateChartLegend(chart) {
        const { element, config, data } = chart;
        
        const legend = element.querySelector('.chart-legend');
        if (!legend) return;
        
        if (!data || !data.datasets) {
            legend.innerHTML = '';
            return;
        }
        
        // Update legend HTML
        legend.innerHTML = data.datasets.map((dataset, index) => {
            const color = dataset.backgroundColor || dataset.borderColor || config.colorPalette[index % config.colorPalette.length];
            const label = dataset.label || `Dataset ${index + 1}`;
            const isHidden = dataset.hidden || false;
            
            return `
                <div class="chart-legend-item ${isHidden ? 'disabled' : ''}" data-index="${index}">
                    <div class="chart-legend-color" style="background-color: ${color}"></div>
                    <div class="chart-legend-label">${label}</div>
                </div>
            `;
        }).join('');
        
        // Add event listeners to new legend items
        const legendItems = legend.querySelectorAll('.chart-legend-item');
        legendItems.forEach((item, index) => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleLegendClick(chart, item, index);
            });
        });
    }

    updateChartState(chart) {
        const { element, config, isLoaded, error } = chart;
        
        // Update state classes
        element.classList.remove('chart-loading', 'chart-error', 'chart-loaded');
        
        if (error) {
            element.classList.add('chart-error');
        } else if (isLoaded) {
            element.classList.add('chart-loaded');
        } else {
            element.classList.add('chart-loading');
        }
    }

    initializeChart(chart) {
        const { element, config, data, type } = chart;
        
        const canvas = element.querySelector('.chart-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        try {
            // Create chart
            chart.chart = new Chart(ctx, {
                type: type,
                data: data,
                options: config
            });
            
            // Mark as loaded
            chart.isLoaded = true;
            chart.error = null;
            
            // Render chart
            this.renderChart(chart);
            
            // Trigger event
            this.triggerEvent(chart.element, 'chart:init', { 
                chart: config, 
                type, 
                data 
            });
            
        } catch (error) {
            console.error('Error initializing chart:', error);
            chart.error = error;
            chart.isLoaded = false;
            
            // Render chart
            this.renderChart(chart);
            
            // Trigger event
            this.triggerEvent(chart.element, 'chart:error', { 
                chart: config, 
                error 
            });
        }
    }

    // Event Handlers
    handleAction(chart, action, index) {
        const { config } = chart;
        const actionType = action.getAttribute('data-action');
        
        switch (actionType) {
            case 'export':
                this.exportChart(chart.id);
                break;
            case 'download':
                this.downloadChart(chart.id);
                break;
            case 'refresh':
                this.refreshChart(chart.id);
                break;
            case 'fullscreen':
                this.toggleFullscreen(chart.id);
                break;
        }
    }

    handleLegendClick(chart, item, index) {
        const { config } = chart;
        
        // Toggle dataset
        this.toggleDataset(chart.id, index);
        
        // Update legend item
        if (chart.chart && chart.chart.data && chart.chart.data.datasets && chart.chart.data.datasets[index]) {
            const isHidden = chart.chart.data.datasets[index].hidden;
            item.classList.toggle('disabled', isHidden);
        }
    }

    handleResize() {
        this.charts.forEach((chart) => {
            if (chart.chart) {
                chart.chart.resize();
            }
        });
    }

    handleKeyboardNavigation(e) {
        // Handle global keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'c':
                    e.preventDefault();
                    this.focusFirstChart();
                    break;
            }
        }
    }

    focusFirstChart() {
        const firstChart = this.charts.values().next().value;
        if (firstChart && firstChart.element) {
            firstChart.element.focus();
        }
    }

    refreshChart(id) {
        const chart = this.charts.get(id);
        if (!chart) {
            console.error(`Chart with id "${id}" not found`);
            return;
        }
        
        const { config } = chart;
        
        // Refresh chart
        if (chart.chart) {
            chart.chart.update();
        }
        
        // Trigger event
        this.triggerEvent(chart.element, 'chart:refresh', { 
            chart: config 
        });
        
        return this;
    }

    toggleFullscreen(id) {
        const chart = this.charts.get(id);
        if (!chart) {
            console.error(`Chart with id "${id}" not found`);
            return;
        }
        
        const { config } = chart;
        
        // Toggle fullscreen
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            chart.element.requestFullscreen();
        }
        
        // Trigger event
        this.triggerEvent(chart.element, 'chart:fullscreen:toggle', { 
            chart: config 
        });
        
        return this;
    }

    // Feature Initializers
    initializeResponsive(chart) {
        // Responsive initialization
    }

    initializeAnimation(chart) {
        // Animation initialization
    }

    initializeInteraction(chart) {
        // Interaction initialization
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
        this.charts.forEach((chart, id) => {
            this.destroyChart(id);
        });
        this.charts.clear();
    }

    destroyChart(id) {
        const chart = this.charts.get(id);
        if (!chart) return;
        
        // Destroy chart instance
        if (chart.chart) {
            chart.chart.destroy();
        }
        
        // Remove event listeners
        const { element } = chart;
        element.removeEventListener('click', this.handleAction);
        element.removeEventListener('click', this.handleLegendClick);
        
        // Remove from charts map
        this.charts.delete(id);
        
        return this;
    }
}

// Initialize chart manager
document.addEventListener('DOMContentLoaded', () => {
    window.chartManager = new ChartManager();
});

// Global access
window.ChartManager = ChartManager;

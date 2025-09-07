/**
 * Angkor Compliance Platform - Search Components JavaScript 2025
 * 
 * Modern search components with 2025 design patterns,
 * accessibility support, and responsive design.
 */

class SearchManager {
    constructor() {
        this.searches = new Map();
        this.config = {
            debounceDelay: 300,
            minSearchLength: 2,
            maxResults: 10,
            showSuggestions: true,
            showHistory: true,
            showFilters: true,
            enableKeyboardNavigation: true,
            enableVoiceSearch: false,
            enableAutoComplete: true,
            enableHighlighting: true,
            enableFuzzySearch: false,
            enableSearchAnalytics: true,
            animationDuration: 300,
            animationEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            storageKey: 'search-history',
            maxHistoryItems: 20
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeSearches();
        this.setupAccessibility();
        this.setupResponsive();
        this.loadSearchHistory();
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

        // Handle click outside
        document.addEventListener('click', (e) => {
            this.handleClickOutside(e);
        });
    }

    initializeSearches() {
        const searchElements = document.querySelectorAll('.search-input');
        
        searchElements.forEach((element, index) => {
            const id = element.id || `search-${index}`;
            this.createSearch(id, element);
        });
    }

    setupAccessibility() {
        this.searches.forEach((search, id) => {
            const { element } = search;
            
            // Add ARIA attributes
            if (!element.getAttribute('role')) {
                element.setAttribute('role', 'searchbox');
            }
            
            if (!element.getAttribute('aria-label')) {
                element.setAttribute('aria-label', 'Search');
            }
            
            // Add semantic roles to search elements
            const input = element.querySelector('input');
            if (input) {
                input.setAttribute('aria-autocomplete', 'list');
                input.setAttribute('aria-expanded', 'false');
                input.setAttribute('aria-haspopup', 'listbox');
            }
            
            // Add roles to dropdown elements
            const dropdown = element.querySelector('.search-dropdown');
            if (dropdown) {
                dropdown.setAttribute('role', 'listbox');
            }
            
            const results = element.querySelectorAll('.search-result');
            results.forEach(result => {
                if (!result.getAttribute('role')) {
                    result.setAttribute('role', 'option');
                }
            });
        });
    }

    setupResponsive() {
        // Add responsive classes based on screen size
        const updateResponsiveClasses = () => {
            this.searches.forEach((search) => {
                const { element } = search;
                
                if (window.innerWidth < 768) {
                    element.classList.add('search-mobile');
                } else {
                    element.classList.remove('search-mobile');
                }
                
                if (window.innerWidth < 480) {
                    element.classList.add('search-small');
                } else {
                    element.classList.remove('search-small');
                }
            });
        };
        
        updateResponsiveClasses();
        window.addEventListener('resize', updateResponsiveClasses);
    }

    // Public Methods
    createSearch(id, element, options = {}) {
        const config = { ...this.config, ...options };
        
        // Store search
        this.searches.set(id, {
            id,
            element,
            config,
            input: element.querySelector('input'),
            dropdown: element.querySelector('.search-dropdown'),
            suggestions: element.querySelector('.search-suggestions'),
            history: element.querySelector('.search-history'),
            filters: element.querySelector('.search-filters'),
            overlay: element.querySelector('.search-overlay'),
            modal: element.querySelector('.search-modal'),
            currentValue: '',
            currentResults: [],
            currentSuggestions: [],
            currentHistory: [],
            selectedIndex: -1,
            isOpen: false,
            isLoading: false,
            error: null,
            debounceTimer: null
        });
        
        // Apply configuration
        this.applyConfiguration(this.searches.get(id));
        
        return this.searches.get(id);
    }

    search(id, query, options = {}) {
        const search = this.searches.get(id);
        if (!search) {
            console.error(`Search with id "${id}" not found`);
            return;
        }
        
        const { config } = search;
        
        // Update current value
        search.currentValue = query;
        
        // Clear previous debounce timer
        if (search.debounceTimer) {
            clearTimeout(search.debounceTimer);
        }
        
        // Set loading state
        this.setLoadingState(search, true);
        
        // Debounce search
        search.debounceTimer = setTimeout(() => {
            this.performSearch(search, query, options);
        }, config.debounceDelay);
        
        return this;
    }

    showSuggestions(id, suggestions = []) {
        const search = this.searches.get(id);
        if (!search) {
            console.error(`Search with id "${id}" not found`);
            return;
        }
        
        const { config } = search;
        
        if (!config.showSuggestions) return;
        
        // Update suggestions
        search.currentSuggestions = suggestions;
        
        // Render suggestions
        this.renderSuggestions(search);
        
        // Show suggestions
        this.showDropdown(search, 'suggestions');
        
        // Trigger event
        this.triggerEvent(search.element, 'search:suggestions:show', { 
            search: config, 
            suggestions 
        });
        
        return this;
    }

    showHistory(id) {
        const search = this.searches.get(id);
        if (!search) {
            console.error(`Search with id "${id}" not found`);
            return;
        }
        
        const { config } = search;
        
        if (!config.showHistory) return;
        
        // Load history
        this.loadSearchHistory();
        
        // Render history
        this.renderHistory(search);
        
        // Show history
        this.showDropdown(search, 'history');
        
        // Trigger event
        this.triggerEvent(search.element, 'search:history:show', { 
            search: config 
        });
        
        return this;
    }

    showResults(id, results = []) {
        const search = this.searches.get(id);
        if (!search) {
            console.error(`Search with id "${id}" not found`);
            return;
        }
        
        const { config } = search;
        
        // Update results
        search.currentResults = results;
        
        // Render results
        this.renderResults(search);
        
        // Show results
        this.showDropdown(search, 'results');
        
        // Trigger event
        this.triggerEvent(search.element, 'search:results:show', { 
            search: config, 
            results 
        });
        
        return this;
    }

    hideDropdown(id) {
        const search = this.searches.get(id);
        if (!search) {
            console.error(`Search with id "${id}" not found`);
            return;
        }
        
        // Hide dropdown
        this.hideDropdownElement(search);
        
        // Reset selection
        search.selectedIndex = -1;
        search.isOpen = false;
        
        // Trigger event
        this.triggerEvent(search.element, 'search:dropdown:hide', { 
            search: search.config 
        });
        
        return this;
    }

    showOverlay(id) {
        const search = this.searches.get(id);
        if (!search) {
            console.error(`Search with id "${id}" not found`);
            return;
        }
        
        // Show overlay
        if (search.overlay) {
            search.overlay.classList.add('show');
        }
        
        // Focus search input
        if (search.input) {
            search.input.focus();
        }
        
        // Trigger event
        this.triggerEvent(search.element, 'search:overlay:show', { 
            search: search.config 
        });
        
        return this;
    }

    hideOverlay(id) {
        const search = this.searches.get(id);
        if (!search) {
            console.error(`Search with id "${id}" not found`);
            return;
        }
        
        // Hide overlay
        if (search.overlay) {
            search.overlay.classList.remove('show');
        }
        
        // Hide dropdown
        this.hideDropdown(id);
        
        // Trigger event
        this.triggerEvent(search.element, 'search:overlay:hide', { 
            search: search.config 
        });
        
        return this;
    }

    clearSearch(id) {
        const search = this.searches.get(id);
        if (!search) {
            console.error(`Search with id "${id}" not found`);
            return;
        }
        
        // Clear input
        if (search.input) {
            search.input.value = '';
        }
        
        // Clear current value
        search.currentValue = '';
        
        // Hide dropdown
        this.hideDropdown(id);
        
        // Update clear button visibility
        this.updateClearButton(search);
        
        // Trigger event
        this.triggerEvent(search.element, 'search:clear', { 
            search: search.config 
        });
        
        return this;
    }

    addToHistory(id, query) {
        const search = this.searches.get(id);
        if (!search) {
            console.error(`Search with id "${id}" not found`);
            return;
        }
        
        const { config } = search;
        
        if (!config.showHistory) return;
        
        // Add to history
        this.addSearchToHistory(query);
        
        // Update current history
        search.currentHistory = this.getSearchHistory();
        
        // Trigger event
        this.triggerEvent(search.element, 'search:history:add', { 
            search: config, 
            query 
        });
        
        return this;
    }

    removeFromHistory(id, query) {
        const search = this.searches.get(id);
        if (!search) {
            console.error(`Search with id "${id}" not found`);
            return;
        }
        
        const { config } = search;
        
        if (!config.showHistory) return;
        
        // Remove from history
        this.removeSearchFromHistory(query);
        
        // Update current history
        search.currentHistory = this.getSearchHistory();
        
        // Re-render history
        this.renderHistory(search);
        
        // Trigger event
        this.triggerEvent(search.element, 'search:history:remove', { 
            search: config, 
            query 
        });
        
        return this;
    }

    clearHistory(id) {
        const search = this.searches.get(id);
        if (!search) {
            console.error(`Search with id "${id}" not found`);
            return;
        }
        
        const { config } = search;
        
        if (!config.showHistory) return;
        
        // Clear history
        this.clearSearchHistory();
        
        // Update current history
        search.currentHistory = [];
        
        // Re-render history
        this.renderHistory(search);
        
        // Trigger event
        this.triggerEvent(search.element, 'search:history:clear', { 
            search: config 
        });
        
        return this;
    }

    // Private Methods
    applyConfiguration(search) {
        const { element, config } = search;
        
        // Add configuration classes
        if (config.showSuggestions) element.classList.add('search-suggestions-enabled');
        if (config.showHistory) element.classList.add('search-history-enabled');
        if (config.showFilters) element.classList.add('search-filters-enabled');
        if (config.enableKeyboardNavigation) element.classList.add('search-keyboard-enabled');
        if (config.enableVoiceSearch) element.classList.add('search-voice-enabled');
        if (config.enableAutoComplete) element.classList.add('search-autocomplete-enabled');
        if (config.enableHighlighting) element.classList.add('search-highlighting-enabled');
        if (config.enableFuzzySearch) element.classList.add('search-fuzzy-enabled');
        
        // Add event listeners
        this.addEventListeners(search);
        
        // Initialize features
        if (config.showSuggestions) this.initializeSuggestions(search);
        if (config.showHistory) this.initializeHistory(search);
        if (config.showFilters) this.initializeFilters(search);
        if (config.enableKeyboardNavigation) this.initializeKeyboardNavigation(search);
        if (config.enableVoiceSearch) this.initializeVoiceSearch(search);
        if (config.enableAutoComplete) this.initializeAutoComplete(search);
    }

    addEventListeners(search) {
        const { element, config } = search;
        
        // Input event listeners
        if (search.input) {
            search.input.addEventListener('input', (e) => {
                this.handleInputChange(search, e.target.value);
            });
            
            search.input.addEventListener('focus', () => {
                this.handleInputFocus(search);
            });
            
            search.input.addEventListener('blur', () => {
                this.handleInputBlur(search);
            });
            
            search.input.addEventListener('keydown', (e) => {
                this.handleInputKeydown(search, e);
            });
        }
        
        // Clear button event listeners
        const clearButton = element.querySelector('.search-clear');
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                this.clearSearch(search.id);
            });
        }
        
        // Overlay event listeners
        if (search.overlay) {
            search.overlay.addEventListener('click', (e) => {
                if (e.target === search.overlay) {
                    this.hideOverlay(search.id);
                }
            });
        }
        
        // Modal close event listeners
        const modalClose = element.querySelector('.search-modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => {
                this.hideOverlay(search.id);
            });
        }
    }

    performSearch(search, query, options = {}) {
        const { config } = search;
        
        // Check minimum search length
        if (query.length < config.minSearchLength) {
            this.setLoadingState(search, false);
            this.hideDropdown(search.id);
            return;
        }
        
        // Simulate search delay
        setTimeout(() => {
            try {
                // Perform search (replace with actual search logic)
                const results = this.simulateSearch(query, options);
                
                // Update results
                search.currentResults = results;
                
                // Render results
                this.renderResults(search);
                
                // Show results
                this.showDropdown(search, 'results');
                
                // Add to history
                this.addToHistory(search.id, query);
                
                // Set loading state
                this.setLoadingState(search, false);
                
                // Trigger event
                this.triggerEvent(search.element, 'search:perform', { 
                    search: config, 
                    query, 
                    results 
                });
                
            } catch (error) {
                search.error = error;
                this.setErrorState(search, error.message);
                this.setLoadingState(search, false);
                
                // Trigger event
                this.triggerEvent(search.element, 'search:error', { 
                    search: config, 
                    error: error 
                });
            }
        }, config.animationDuration);
    }

    simulateSearch(query, options = {}) {
        // Simulate search results (replace with actual search logic)
        const mockResults = [
            {
                id: 1,
                title: `Result for "${query}"`,
                description: 'This is a mock search result description.',
                url: '#',
                category: 'General',
                score: 0.95
            },
            {
                id: 2,
                title: `Another result for "${query}"`,
                description: 'Another mock search result description.',
                url: '#',
                category: 'General',
                score: 0.87
            },
            {
                id: 3,
                title: `Third result for "${query}"`,
                description: 'Third mock search result description.',
                url: '#',
                category: 'General',
                score: 0.76
            }
        ];
        
        return mockResults;
    }

    renderResults(search) {
        const { config, currentResults } = search;
        
        if (!search.dropdown) return;
        
        const resultsContainer = search.dropdown.querySelector('.search-results');
        if (!resultsContainer) return;
        
        resultsContainer.innerHTML = '';
        
        if (currentResults.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'search-no-results';
            noResults.textContent = 'No results found';
            resultsContainer.appendChild(noResults);
        } else {
            currentResults.forEach((result, index) => {
                const resultElement = this.createResultElement(search, result, index);
                resultsContainer.appendChild(resultElement);
            });
        }
    }

    createResultElement(search, result, index) {
        const { config } = search;
        const resultElement = document.createElement('div');
        resultElement.className = 'search-result';
        resultElement.setAttribute('data-index', index);
        
        // Add click event
        resultElement.addEventListener('click', () => {
            this.handleResultClick(search, result, index);
        });
        
        // Create title
        const title = document.createElement('div');
        title.className = 'search-result-title';
        title.textContent = result.title;
        resultElement.appendChild(title);
        
        // Create description
        if (result.description) {
            const description = document.createElement('div');
            description.className = 'search-result-description';
            description.textContent = result.description;
            resultElement.appendChild(description);
        }
        
        // Create meta
        if (result.category || result.score) {
            const meta = document.createElement('div');
            meta.className = 'search-result-meta';
            
            if (result.category) {
                meta.textContent = result.category;
            }
            
            if (result.score) {
                meta.textContent += ` • Score: ${Math.round(result.score * 100)}%`;
            }
            
            resultElement.appendChild(meta);
        }
        
        return resultElement;
    }

    renderSuggestions(search) {
        const { config, currentSuggestions } = search;
        
        if (!search.suggestions) return;
        
        search.suggestions.innerHTML = '';
        
        if (currentSuggestions.length === 0) {
            search.suggestions.style.display = 'none';
            return;
        }
        
        search.suggestions.style.display = 'block';
        
        currentSuggestions.forEach((suggestion, index) => {
            const suggestionElement = this.createSuggestionElement(search, suggestion, index);
            search.suggestions.appendChild(suggestionElement);
        });
    }

    createSuggestionElement(search, suggestion, index) {
        const { config } = search;
        const suggestionElement = document.createElement('div');
        suggestionElement.className = 'suggestion-item';
        suggestionElement.setAttribute('data-index', index);
        
        // Add click event
        suggestionElement.addEventListener('click', () => {
            this.handleSuggestionClick(search, suggestion, index);
        });
        
        // Create text
        const text = document.createElement('div');
        text.className = 'suggestion-text';
        text.textContent = suggestion.text || suggestion;
        suggestionElement.appendChild(text);
        
        // Create category
        if (suggestion.category) {
            const category = document.createElement('div');
            category.className = 'suggestion-category';
            category.textContent = suggestion.category;
            suggestionElement.appendChild(category);
        }
        
        return suggestionElement;
    }

    renderHistory(search) {
        const { config, currentHistory } = search;
        
        if (!search.history) return;
        
        const historyContainer = search.history.querySelector('.history-items');
        if (!historyContainer) return;
        
        historyContainer.innerHTML = '';
        
        if (currentHistory.length === 0) {
            const noHistory = document.createElement('div');
            noHistory.className = 'search-no-results';
            noHistory.textContent = 'No search history';
            historyContainer.appendChild(noHistory);
        } else {
            currentHistory.forEach((historyItem, index) => {
                const historyElement = this.createHistoryElement(search, historyItem, index);
                historyContainer.appendChild(historyElement);
            });
        }
    }

    createHistoryElement(search, historyItem, index) {
        const { config } = search;
        const historyElement = document.createElement('div');
        historyElement.className = 'history-item';
        historyElement.setAttribute('data-index', index);
        
        // Add click event
        historyElement.addEventListener('click', () => {
            this.handleHistoryClick(search, historyItem, index);
        });
        
        // Create text
        const text = document.createElement('div');
        text.className = 'history-text';
        text.textContent = historyItem.query;
        historyElement.appendChild(text);
        
        // Create time
        if (historyItem.timestamp) {
            const time = document.createElement('div');
            time.className = 'history-time';
            time.textContent = this.formatTimestamp(historyItem.timestamp);
            historyElement.appendChild(time);
        }
        
        // Create remove button
        const removeButton = document.createElement('button');
        removeButton.className = 'history-remove';
        removeButton.innerHTML = '×';
        removeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeFromHistory(search.id, historyItem.query);
        });
        historyElement.appendChild(removeButton);
        
        return historyElement;
    }

    showDropdown(search, type) {
        const { config } = search;
        
        // Hide all dropdowns
        this.hideAllDropdowns(search);
        
        // Show specific dropdown
        switch (type) {
            case 'results':
                if (search.dropdown) {
                    search.dropdown.classList.add('show');
                }
                break;
            case 'suggestions':
                if (search.suggestions) {
                    search.suggestions.classList.add('show');
                }
                break;
            case 'history':
                if (search.history) {
                    search.history.classList.add('show');
                }
                break;
        }
        
        // Update state
        search.isOpen = true;
        search.selectedIndex = -1;
        
        // Update ARIA attributes
        if (search.input) {
            search.input.setAttribute('aria-expanded', 'true');
        }
    }

    hideDropdownElement(search) {
        // Hide all dropdowns
        this.hideAllDropdowns(search);
        
        // Update state
        search.isOpen = false;
        search.selectedIndex = -1;
        
        // Update ARIA attributes
        if (search.input) {
            search.input.setAttribute('aria-expanded', 'false');
        }
    }

    hideAllDropdowns(search) {
        if (search.dropdown) {
            search.dropdown.classList.remove('show');
        }
        if (search.suggestions) {
            search.suggestions.classList.remove('show');
        }
        if (search.history) {
            search.history.classList.remove('show');
        }
    }

    setLoadingState(search, isLoading) {
        const { element } = search;
        search.isLoading = isLoading;
        
        if (isLoading) {
            element.classList.add('search-loading');
        } else {
            element.classList.remove('search-loading');
        }
    }

    setErrorState(search, errorMessage) {
        const { element } = search;
        
        // Show error message
        const errorElement = element.querySelector('.search-error');
        if (errorElement) {
            errorElement.textContent = errorMessage;
            errorElement.style.display = 'block';
        }
    }

    updateClearButton(search) {
        const { element, currentValue } = search;
        const clearButton = element.querySelector('.search-clear');
        
        if (clearButton) {
            if (currentValue.length > 0) {
                element.classList.add('has-value');
            } else {
                element.classList.remove('has-value');
            }
        }
    }

    // Event Handlers
    handleInputChange(search, value) {
        const { config } = search;
        
        // Update current value
        search.currentValue = value;
        
        // Update clear button visibility
        this.updateClearButton(search);
        
        // Show suggestions if enabled
        if (config.showSuggestions && value.length >= config.minSearchLength) {
            this.showSuggestions(search.id, this.generateSuggestions(value));
        }
        
        // Trigger event
        this.triggerEvent(search.element, 'search:input:change', { 
            search: config, 
            value 
        });
    }

    handleInputFocus(search) {
        const { config } = search;
        
        // Show history if enabled and no current value
        if (config.showHistory && search.currentValue.length === 0) {
            this.showHistory(search.id);
        }
        
        // Trigger event
        this.triggerEvent(search.element, 'search:input:focus', { 
            search: config 
        });
    }

    handleInputBlur(search) {
        const { config } = search;
        
        // Hide dropdown after a short delay
        setTimeout(() => {
            this.hideDropdown(search.id);
        }, 150);
        
        // Trigger event
        this.triggerEvent(search.element, 'search:input:blur', { 
            search: config 
        });
    }

    handleInputKeydown(search, e) {
        const { config } = search;
        
        if (!config.enableKeyboardNavigation) return;
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.navigateDown(search);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.navigateUp(search);
                break;
            case 'Enter':
                e.preventDefault();
                this.selectCurrentItem(search);
                break;
            case 'Escape':
                e.preventDefault();
                this.hideDropdown(search.id);
                break;
        }
    }

    handleResultClick(search, result, index) {
        const { config } = search;
        
        // Add to history
        this.addToHistory(search.id, search.currentValue);
        
        // Hide dropdown
        this.hideDropdown(search.id);
        
        // Trigger event
        this.triggerEvent(search.element, 'search:result:click', { 
            search: config, 
            result, 
            index 
        });
    }

    handleSuggestionClick(search, suggestion, index) {
        const { config } = search;
        
        // Update input value
        if (search.input) {
            search.input.value = suggestion.text || suggestion;
        }
        
        // Update current value
        search.currentValue = suggestion.text || suggestion;
        
        // Update clear button visibility
        this.updateClearButton(search);
        
        // Hide dropdown
        this.hideDropdown(search.id);
        
        // Trigger event
        this.triggerEvent(search.element, 'search:suggestion:click', { 
            search: config, 
            suggestion, 
            index 
        });
    }

    handleHistoryClick(search, historyItem, index) {
        const { config } = search;
        
        // Update input value
        if (search.input) {
            search.input.value = historyItem.query;
        }
        
        // Update current value
        search.currentValue = historyItem.query;
        
        // Update clear button visibility
        this.updateClearButton(search);
        
        // Hide dropdown
        this.hideDropdown(search.id);
        
        // Trigger event
        this.triggerEvent(search.element, 'search:history:click', { 
            search: config, 
            historyItem, 
            index 
        });
    }

    handleResize() {
        this.searches.forEach((search) => {
            if (search.isOpen) {
                this.hideDropdown(search.id);
            }
        });
    }

    handleKeyboardNavigation(e) {
        // Handle global keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'k':
                    e.preventDefault();
                    this.focusFirstSearch();
                    break;
            }
        }
    }

    handleClickOutside(e) {
        this.searches.forEach((search) => {
            if (!search.element.contains(e.target)) {
                this.hideDropdown(search.id);
            }
        });
    }

    navigateDown(search) {
        const { config } = search;
        const maxIndex = this.getMaxIndex(search);
        
        if (search.selectedIndex < maxIndex) {
            search.selectedIndex++;
            this.updateSelection(search);
        }
    }

    navigateUp(search) {
        if (search.selectedIndex > 0) {
            search.selectedIndex--;
            this.updateSelection(search);
        }
    }

    selectCurrentItem(search) {
        const { config } = search;
        
        if (search.selectedIndex >= 0) {
            const item = this.getSelectedItem(search);
            if (item) {
                item.click();
            }
        } else {
            // Perform search with current value
            this.search(search.id, search.currentValue);
        }
    }

    updateSelection(search) {
        const { config } = search;
        
        // Remove previous selection
        const previousSelected = search.element.querySelector('.selected');
        if (previousSelected) {
            previousSelected.classList.remove('selected');
        }
        
        // Add new selection
        const currentSelected = this.getSelectedItem(search);
        if (currentSelected) {
            currentSelected.classList.add('selected');
        }
    }

    getSelectedItem(search) {
        const { config } = search;
        const items = search.element.querySelectorAll('.search-result, .suggestion-item, .history-item');
        return items[search.selectedIndex] || null;
    }

    getMaxIndex(search) {
        const { config } = search;
        const items = search.element.querySelectorAll('.search-result, .suggestion-item, .history-item');
        return items.length - 1;
    }

    focusFirstSearch() {
        const firstSearch = this.searches.values().next().value;
        if (firstSearch && firstSearch.input) {
            firstSearch.input.focus();
        }
    }

    generateSuggestions(query) {
        // Generate mock suggestions (replace with actual suggestion logic)
        const mockSuggestions = [
            { text: `${query} suggestion 1`, category: 'General' },
            { text: `${query} suggestion 2`, category: 'General' },
            { text: `${query} suggestion 3`, category: 'General' }
        ];
        
        return mockSuggestions;
    }

    // History Management
    loadSearchHistory() {
        try {
            const history = localStorage.getItem(this.config.storageKey);
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('Error loading search history:', error);
            return [];
        }
    }

    saveSearchHistory(history) {
        try {
            localStorage.setItem(this.config.storageKey, JSON.stringify(history));
        } catch (error) {
            console.error('Error saving search history:', error);
        }
    }

    getSearchHistory() {
        return this.loadSearchHistory();
    }

    addSearchToHistory(query) {
        const history = this.getSearchHistory();
        const timestamp = Date.now();
        
        // Remove existing entry if it exists
        const filteredHistory = history.filter(item => item.query !== query);
        
        // Add new entry at the beginning
        const newHistory = [{ query, timestamp }, ...filteredHistory];
        
        // Limit history size
        const limitedHistory = newHistory.slice(0, this.config.maxHistoryItems);
        
        this.saveSearchHistory(limitedHistory);
    }

    removeSearchFromHistory(query) {
        const history = this.getSearchHistory();
        const filteredHistory = history.filter(item => item.query !== query);
        this.saveSearchHistory(filteredHistory);
    }

    clearSearchHistory() {
        this.saveSearchHistory([]);
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
        this.searches.forEach((search, id) => {
            this.destroySearch(id);
        });
        this.searches.clear();
    }

    destroySearch(id) {
        const search = this.searches.get(id);
        if (!search) return;
        
        // Clear debounce timer
        if (search.debounceTimer) {
            clearTimeout(search.debounceTimer);
        }
        
        // Remove event listeners
        const { element } = search;
        element.removeEventListener('input', this.handleInputChange);
        element.removeEventListener('focus', this.handleInputFocus);
        element.removeEventListener('blur', this.handleInputBlur);
        element.removeEventListener('keydown', this.handleInputKeydown);
        
        // Remove from searches map
        this.searches.delete(id);
        
        return this;
    }
}

// Initialize search manager
document.addEventListener('DOMContentLoaded', () => {
    window.searchManager = new SearchManager();
});

// Global access
window.SearchManager = SearchManager;

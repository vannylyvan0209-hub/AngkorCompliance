// Bilingual Language System
const translations = {
    en: {
        // Navigation
        'dashboard': 'Dashboard',
        'profile': 'Profile',
        'settings': 'Settings',
        'logout': 'Logout',
        'login': 'Login',
        'register': 'Register',
        'features': 'Features',
        'standards': 'Standards',
        'contact': 'Contact',
        'go_to_dashboard': 'Go to Dashboard',
        
        // Landing Page
        'angkor_compliance': 'Angkor Compliance',
        'hero_title': 'Powering Smart Compliance for Cambodian Factories',
        'hero_subtitle': 'Streamline your compliance management with our bilingual platform. Track permits, manage CAPs, handle grievances, and maintain audit trails - all in Khmer and English.',
        'request_demo': 'Request Demo',
        'learn_more': 'Learn More',
        'factories': 'Factories',
        'permits': 'Permits',
        'compliance_rate': 'Compliance Rate',
        'platform_features': 'Platform Features',
        'features_subtitle': 'Everything you need to manage compliance effectively',
        'permit_tracking': 'Permit Tracking',
        'permit_description': 'Monitor permit expiry dates, receive alerts, and maintain complete documentation history.',
        'cap_management': 'CAP Management',
        'cap_description': 'Create, track, and close Corrective Action Plans with automated workflows and notifications.',
        'grievance_system': 'Grievance System',
        'grievance_description': 'Anonymous QR-based grievance submission with AI-powered classification and tracking.',
        'audit_history': 'Audit History',
        'audit_description': 'Complete audit trail with version control, review logs, and compliance reporting.',
        'bilingual_ui': 'Khmer/English UI',
        'bilingual_description': 'Native Khmer interface with seamless language switching for all users.',
        'ai_assistance': 'AI Assistance',
        'ai_description': 'Coming Soon: AI-powered CAP suggestions, permit extraction, and smart alerts.',
        'compliance_standards': 'Compliance Standards Supported',
        'standards_subtitle': 'Meeting international and local compliance requirements',
        'ilo': 'International Labour Organization',
        'smeta': 'SEDEX Members Ethical Trade Audit',
        'primark': 'Primark Ethical Trade',
        'higg': 'Higg Index',
        'bfc': 'Better Factories Cambodia',
        'molvt': 'Ministry of Labour',
        'moc': 'Ministry of Commerce',
        'moe': 'Ministry of Environment',
        'why_choose': 'Why Choose Angkor Compliance?',
        'why_choose_subtitle': 'Built specifically for Cambodian factories and compliance needs',
        'data_secure': 'Data Secure',
        'data_secure_desc': 'Enterprise-grade security with Firebase infrastructure and encrypted data storage.',
        'khmer_native': 'Khmer-Native UI',
        'khmer_native_desc': 'Designed with Khmer cultural elements and native language support for all users.',
        'multi_factory': 'Multi-Factory Support',
        'multi_factory_desc': 'Manage multiple factories from a single platform with role-based access control.',
        'buyer_ready': 'Buyer Ready',
        'buyer_ready_desc': 'Export compliance reports and audit trails for buyer requirements and certifications.',
        'get_started': 'Get Started Today',
        'contact_subtitle': 'Ready to transform your compliance management? Contact us for a personalized demo.',
        'phone': 'Phone',
        'location': 'Location',
        'phnom_penh': 'Phnom Penh, Cambodia',
        'full_name': 'Full Name',
        'company_name': 'Company Name',
        'select_factory_size': 'Select Factory Size',
        'small_factory': 'Small (50-200 workers)',
        'medium_factory': 'Medium (200-500 workers)',
        'large_factory': 'Large (500+ workers)',
        'message': 'Message',
        'send_request': 'Send Request',
        'demo_request_sent': 'Demo request sent successfully! We\'ll contact you soon.',
        'demo_request_error': 'Error sending demo request. Please try again.',
        'footer_description': 'Empowering Cambodian factories with smart compliance solutions.',
        'quick_links': 'Quick Links',
        'contact_info': 'Contact Info',
        'all_rights_reserved': 'All rights reserved.',
        
        // Authentication
        'email': 'Email',
        'password': 'Password',
        'confirm_password': 'Confirm Password',
        'forgot_password': 'Forgot Password?',
        'remember_me': 'Remember Me',
        'sign_in': 'Sign In',
        'sign_up': 'Sign Up',
        'already_have_account': 'Already have an account?',
        'dont_have_account': "Don't have an account?",
        
        // User Roles
        'super_admin': 'Super Admin',
        'factory_admin': 'Factory Admin',
        'hr_staff': 'HR Staff',
        'auditor': 'Auditor',
        'committee': 'Grievance Committee',
        'worker': 'Worker',
        
        // Dashboard
        'welcome': 'Welcome',
        'total_factories': 'Total Factories',
        'active_users': 'Active Users',
        'pending_permits': 'Pending Permits',
        'active_caps': 'Active CAPs',
        'recent_activities': 'Recent Activities',
        'quick_actions': 'Quick Actions',
        'system_alerts': 'System Alerts',
        
        // Factory Management
        'factories': 'Factories',
        'factory_name': 'Factory Name',
        'factory_location': 'Location',
        'factory_workers': 'Workers',
        'factory_status': 'Status',
        'add_factory': 'Add Factory',
        'edit_factory': 'Edit Factory',
        'delete_factory': 'Delete Factory',
        
        // Documents
        'documents': 'Documents',
        'upload_document': 'Upload Document',
        'document_type': 'Document Type',
        'document_name': 'Document Name',
        'upload_date': 'Upload Date',
        'expiry_date': 'Expiry Date',
        'status': 'Status',
        
        // CAP System
        'corrective_actions': 'Corrective Actions',
        'new_cap': 'New CAP',
        'cap_title': 'CAP Title',
        'cap_description': 'Description',
        'cap_assigned_to': 'Assigned To',
        'cap_deadline': 'Deadline',
        'cap_status': 'Status',
        'cap_priority': 'Priority',
        
        // Notifications
        'notifications': 'Notifications',
        'no_notifications': 'No notifications',
        'mark_all_read': 'Mark All as Read',
        
        // Common
        'save': 'Save',
        'cancel': 'Cancel',
        'edit': 'Edit',
        'delete': 'Delete',
        'view': 'View',
        'add': 'Add',
        'search': 'Search',
        'filter': 'Filter',
        'export': 'Export',
        'import': 'Import',
        'loading': 'Loading...',
        'error': 'Error',
        'success': 'Success',
        'warning': 'Warning',
        'info': 'Information',
        
        // Status
        'active': 'Active',
        'inactive': 'Inactive',
        'pending': 'Pending',
        'completed': 'Completed',
        'overdue': 'Overdue',
        'expired': 'Expired',
        
        // Priority
        'low': 'Low',
        'medium': 'Medium',
        'high': 'High',
        'critical': 'Critical'
    },
    
    km: {
        // Navigation
        'dashboard': 'ផ្ទាំងគ្រប់គ្រង',
        'profile': 'ព័ត៌មានផ្ទាល់ខ្លួន',
        'settings': 'ការកំណត់',
        'logout': 'ចាកចេញ',
        'login': 'ចូល',
        'register': 'ចុះឈ្មោះ',
        'features': 'មុខងារ',
        'standards': 'ស្តង់ដារ',
        'contact': 'ទាក់ទង',
        'go_to_dashboard': 'ទៅផ្ទាំងគ្រប់គ្រង',
        
        // Landing Page
        'angkor_compliance': 'អង្គរការអនុលោមតាម',
        'hero_title': 'ជំរុញការអនុលោមតាមឆ្លាតសម្រាប់រោងចក្រកម្ពុជា',
        'hero_subtitle': 'ធ្វើឱ្យការគ្រប់គ្រងការអនុលោមតាមរបស់អ្នកកាន់តែងាយស្រួលជាមួយវេទិកាពីរភាសារបស់យើង។ តាមដានអាជ្ញាប័ណ្ឌ គ្រប់គ្រងផែនការកែតម្រូវ ដោះស្រាយការទាមទារ និងរក្សាប្រវត្តិការត្រួតពិនិត្យ - ទាំងអស់ជាភាសាខ្មែរ និងអង់គ្លេស។',
        'request_demo': 'ស្នើសុំការបង្ហាញ',
        'learn_more': 'ស្វែងយល់បន្ថែម',
        'factories': 'រោងចក្រ',
        'permits': 'អាជ្ញាប័ណ្ឌ',
        'compliance_rate': 'អត្រាអនុលោមតាម',
        'platform_features': 'មុខងារវេទិកា',
        'features_subtitle': 'អ្វីគ្រប់យ៉ាងដែលអ្នកត្រូវការដើម្បីគ្រប់គ្រងការអនុលោមតាមយ៉ាងមានប្រសិទ្ធភាព',
        'permit_tracking': 'ការតាមដានអាជ្ញាប័ណ្ឌ',
        'permit_description': 'តាមដានកាលបរិច្ឆេទផុតកំណត់អាជ្ញាប័ណ្ឌ ទទួលការជូនដំណឹង និងរក្សាប្រវត្តិឯកសារពេញលេញ។',
        'cap_management': 'ការគ្រប់គ្រងផែនការកែតម្រូវ',
        'cap_description': 'បង្កើត តាមដាន និងបិទផែនការសកម្មភាពកែតម្រូវជាមួយដំណើរការងារដែលបានធ្វើដោយស្វ័យប្រវត្តិ និងការជូនដំណឹង។',
        'grievance_system': 'ប្រព័ន្ធការទាមទារ',
        'grievance_description': 'ការដាក់ស្នើការទាមទារដោយអនាមិកតាមរយៈ QR ជាមួយការចំណាត់ថ្នាក់ដោយ AI និងការតាមដាន។',
        'audit_history': 'ប្រវត្តិការត្រួតពិនិត្យ',
        'audit_description': 'ប្រវត្តិការត្រួតពិនិត្យពេញលេញជាមួយការគ្រប់គ្រងកំណែ កំណត់ហេតុការពិនិត្យ និងរបាយការណ៍ការអនុលោមតាម។',
        'bilingual_ui': 'ចំណុចប្រទាក់ខ្មែរ/អង់គ្លេស',
        'bilingual_description': 'ចំណុចប្រទាក់ខ្មែរដើមជាមួយការផ្លាស់ប្តូរភាសាយ៉ាងងាយស្រួលសម្រាប់អ្នកប្រើប្រាស់ទាំងអស់។',
        'ai_assistance': 'ការជួយដោយ AI',
        'ai_description': 'ឆាប់មក: ការណែនាំផែនការកែតម្រូវដោយ AI ការទាញយកអាជ្ញាប័ណ្ឌ និងការជូនដំណឹងឆ្លាត។',
        'compliance_standards': 'ស្តង់ដារអនុលោមតាមដែលបានគាំទ្រ',
        'standards_subtitle': 'បំពេញតម្រូវការអនុលោមតាមអន្តរជាតិ និងក្នុងស្រុក',
        'ilo': 'អង្គការការងារអន្តរជាតិ',
        'smeta': 'ការត្រួតពិនិត្យពាណិជ្ជកម្មយុត្តិធម៌របស់សមាជិក SEDEX',
        'primark': 'ពាណិជ្ជកម្មយុត្តិធម៌ Primark',
        'higg': 'សន្ទស្សន៍ Higg',
        'bfc': 'រោងចក្រកម្ពុជាកាន់តែល្អ',
        'molvt': 'ក្រសួងការងារ',
        'moc': 'ក្រសួងពាណិជ្ជកម្ម',
        'moe': 'ក្រសួងបរិស្ថាន',
        'why_choose': 'ហេតុអ្វីជ្រើសរើសអង្គរការអនុលោមតាម?',
        'why_choose_subtitle': 'បានបង្កើតជាពិសេសសម្រាប់រោងចក្រកម្ពុជា និងតម្រូវការអនុលោមតាម',
        'data_secure': 'ទិន្នន័យមានសុវត្ថិភាព',
        'data_secure_desc': 'សុវត្ថិភាពថ្នាក់សហគ្រាសជាមួយហេដ្ឋារចនាសម្ព័ន្ធ Firebase និងការរក្សាទុកទិន្នន័យដែលបានអ៊ិនគ្រីប។',
        'khmer_native': 'ចំណុចប្រទាក់ខ្មែរដើម',
        'khmer_native_desc': 'បានរចនាជាមួយធាតុវប្បធម៌ខ្មែរ និងការគាំទ្រភាសាដើមសម្រាប់អ្នកប្រើប្រាស់ទាំងអស់។',
        'multi_factory': 'ការគាំទ្ររោងចក្រច្រើន',
        'multi_factory_desc': 'គ្រប់គ្រងរោងចក្រច្រើនពីវេទិកាតែមួយជាមួយការគ្រប់គ្រងការចូលប្រើផ្អែកលើតួនាទី។',
        'buyer_ready': 'រួចរាល់សម្រាប់អ្នកទិញ',
        'buyer_ready_desc': 'នាំចេញរបាយការណ៍ការអនុលោមតាម និងប្រវត្តិការត្រួតពិនិត្យសម្រាប់តម្រូវការអ្នកទិញ និងការបញ្ជាក់គុណភាព។',
        'get_started': 'ចាប់ផ្តើមថ្ងៃនេះ',
        'contact_subtitle': 'រួចរាល់ដើម្បីបំប្លែងការគ្រប់គ្រងការអនុលោមតាមរបស់អ្នក? ទាក់ទងយើងសម្រាប់ការបង្ហាញផ្ទាល់ខ្លួន។',
        'phone': 'លេខទូរស័ព្ទ',
        'location': 'ទីតាំង',
        'phnom_penh': 'ភ្នំពេញ កម្ពុជា',
        'full_name': 'ឈ្មោះពេញ',
        'company_name': 'ឈ្មោះក្រុមហ៊ុន',
        'select_factory_size': 'ជ្រើសរើសទំហំរោងចក្រ',
        'small_factory': 'តូច (កម្មករ ៥០-២០០ នាក់)',
        'medium_factory': 'មធ្យម (កម្មករ ២០០-៥០០ នាក់)',
        'large_factory': 'ធំ (កម្មករ ៥០០+ នាក់)',
        'message': 'សារ',
        'send_request': 'ផ្ញើសំណើ',
        'demo_request_sent': 'សំណើបង្ហាញបានផ្ញើដោយជោគជ័យ! យើងនឹងទាក់ទងអ្នកឆាប់ៗ។',
        'demo_request_error': 'កំហុសក្នុងការផ្ញើសំណើបង្ហាញ។ សូមព្យាយាមម្តងទៀត។',
        'footer_description': 'ជំរុញរោងចក្រកម្ពុជាជាមួយដំណោះស្រាយការអនុលោមតាមឆ្លាត។',
        'quick_links': 'តំណភ្ជាប់រហ័ស',
        'contact_info': 'ព័ត៌មានទាក់ទង',
        'all_rights_reserved': 'រក្សាសិទ្ធិទាំងអស់។',
        
        // Authentication
        'email': 'អ៊ីមែល',
        'password': 'ពាក្យសម្ងាត់',
        'confirm_password': 'បញ្ជាក់ពាក្យសម្ងាត់',
        'forgot_password': 'ភ្លេចពាក្យសម្ងាត់?',
        'remember_me': 'ចងចាំខ្ញុំ',
        'sign_in': 'ចូល',
        'sign_up': 'ចុះឈ្មោះ',
        'already_have_account': 'មានគណនីរួចហើយ?',
        'dont_have_account': 'មិនមានគណនីទេ?',
        
        // User Roles
        'super_admin': 'អ្នកគ្រប់គ្រងជាន់ខ្ពស់',
        'factory_admin': 'អ្នកគ្រប់គ្រងរោងចក្រ',
        'hr_staff': 'បុគ្គលិកធនធានមនុស្ស',
        'auditor': 'អ្នកត្រួតពិនិត្យ',
        'committee': 'គណៈកម្មការការទាមទារ',
        'worker': 'កម្មករ',
        
        // Dashboard
        'welcome': 'សូមស្វាគមន៍',
        'total_factories': 'រោងចក្រសរុប',
        'active_users': 'អ្នកប្រើប្រាស់សកម្ម',
        'pending_permits': 'អាជ្ញាប័ណ្ណរង់ចាំ',
        'active_caps': 'ផែនការកែតម្រូវសកម្ម',
        'recent_activities': 'សកម្មភាពថ្មីៗ',
        'quick_actions': 'សកម្មភាពរហ័ស',
        'system_alerts': 'ការជូនដំណឹងប្រព័ន្ធ',
        
        // Factory Management
        'factories': 'រោងចក្រ',
        'factory_name': 'ឈ្មោះរោងចក្រ',
        'factory_location': 'ទីតាំង',
        'factory_workers': 'កម្មករ',
        'factory_status': 'ស្ថានភាព',
        'add_factory': 'បន្ថែមរោងចក្រ',
        'edit_factory': 'កែសម្រួលរោងចក្រ',
        'delete_factory': 'លុបរោងចក្រ',
        
        // Documents
        'documents': 'ឯកសារ',
        'upload_document': 'ផ្ទុកឯកសារ',
        'document_type': 'ប្រភេទឯកសារ',
        'document_name': 'ឈ្មោះឯកសារ',
        'upload_date': 'កាលបរិច្ឆេទផ្ទុក',
        'expiry_date': 'កាលបរិច្ឆេទផុតកំណត់',
        'status': 'ស្ថានភាព',
        
        // CAP System
        'corrective_actions': 'សកម្មភាពកែតម្រូវ',
        'new_cap': 'ផែនការកែតម្រូវថ្មី',
        'cap_title': 'ចំណងជើងផែនការ',
        'cap_description': 'ការពិពណ៌នា',
        'cap_assigned_to': 'ផ្តល់ឱ្យ',
        'cap_deadline': 'កាលបរិច្ឆេទកំណត់',
        'cap_status': 'ស្ថានភាព',
        'cap_priority': 'អាទិភាព',
        
        // Notifications
        'notifications': 'ការជូនដំណឹង',
        'no_notifications': 'គ្មានការជូនដំណឹង',
        'mark_all_read': 'សម្គាល់ទាំងអស់ថាបានអាន',
        
        // Common
        'save': 'រក្សាទុក',
        'cancel': 'បោះបង់',
        'edit': 'កែសម្រួល',
        'delete': 'លុប',
        'view': 'មើល',
        'add': 'បន្ថែម',
        'search': 'ស្វែងរក',
        'filter': 'ច្រោះ',
        'export': 'នាំចេញ',
        'import': 'នាំចូល',
        'loading': 'កំពុងផ្ទុក...',
        'error': 'កំហុស',
        'success': 'ជោគជ័យ',
        'warning': 'ការព្រមាន',
        'info': 'ព័ត៌មាន',
        
        // Status
        'active': 'សកម្ម',
        'inactive': 'អសកម្ម',
        'pending': 'រង់ចាំ',
        'completed': 'បានបញ្ចប់',
        'overdue': 'ហួសកំណត់',
        'expired': 'ផុតកំណត់',
        
        // Priority
        'low': 'ទាប',
        'medium': 'មធ្យម',
        'high': 'ខ្ពស់',
        'critical': 'សំខាន់'
    }
};

// Language management
let currentLanguage = localStorage.getItem('language') || 'en';

// Function to change language
function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    updatePageLanguage();
}

// Function to get translation
function t(key) {
    return translations[currentLanguage][key] || translations['en'][key] || key;
}

// Function to update all text on the page
function updatePageLanguage() {
    // Update all elements with data-translate attribute
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        element.textContent = t(key);
    });
    
    // Update placeholders
    const inputs = document.querySelectorAll('[data-translate-placeholder]');
    inputs.forEach(input => {
        const key = input.getAttribute('data-translate-placeholder');
        input.placeholder = t(key);
    });
    
    // Update titles
    const titles = document.querySelectorAll('[data-translate-title]');
    titles.forEach(title => {
        const key = title.getAttribute('data-translate-title');
        title.title = t(key);
    });
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', function() {
    updatePageLanguage();
    
    // Set up language toggle
    const languageToggle = document.getElementById('language-toggle');
    if (languageToggle) {
        languageToggle.addEventListener('click', function() {
            const newLang = currentLanguage === 'en' ? 'km' : 'en';
            changeLanguage(newLang);
            
            // Update toggle button
            const enFlag = languageToggle.querySelector('.en-flag');
            const kmFlag = languageToggle.querySelector('.km-flag');
            const langText = languageToggle.querySelector('.lang-text');
            
            if (newLang === 'km') {
                enFlag.style.display = 'none';
                kmFlag.style.display = 'block';
                langText.textContent = 'អង់គ្លេស';
            } else {
                enFlag.style.display = 'block';
                kmFlag.style.display = 'none';
                langText.textContent = 'English';
            }
        });
    }
});

// Export for use in other files
window.t = t;
window.changeLanguage = changeLanguage;
window.currentLanguage = currentLanguage; 
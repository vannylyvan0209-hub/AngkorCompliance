# 🧭 **PROPER NAVIGATION STRUCTURE BY ROLE**
## Angkor Compliance Platform v2

---

## 🎯 **NAVIGATION OVERVIEW**

The Angkor Compliance Platform v2 uses a **role-based navigation system** where each user role has access to specific screens and modules based on their responsibilities and permissions.

---

## 👑 **SUPER ADMIN NAVIGATION**

### **🏠 Main Navigation**
1. **System Overview** - Multi-factory birds-eye view and system health
2. **Factory Management** - Manage factory registrations and compliance
3. **User Management** - Manage user accounts and permissions
4. **Standards Registry** - Manage compliance standards and requirements
5. **Enterprise Analytics** - Multi-factory analytics and reporting
6. **System Hardening** - Security testing and performance monitoring
7. **Billing & Licensing** - Subscription and payment oversight
8. **System Settings** - Global system configuration
9. **System Diagnostics** - System health and troubleshooting

### **🔧 Tools & Utilities**
- **AI Copilot** - AI-powered assistance and automation
- **Notifications** - System notifications and alerts
- **Profile** - User profile and preferences
- **Help & Support** - Help documentation and support
- **Language Toggle** - Khmer/English switching
- **Logout** - Sign out of the system

---

## 🏭 **FACTORY ADMIN NAVIGATION**

### **🏠 Main Navigation**
1. **Factory Dashboard** - Single factory status and overview
2. **Factory Users** - Manage factory users and roles
3. **Audit Preparation** - Multi-standard audit preparation
4. **CAP Management** - Corrective Action Plans oversight
5. **Document Oversight** - Monitor document processing
6. **Approvals** - Document and request approvals
7. **Grievance Oversight** - Monitor grievance processing
8. **Factory Analytics** - Factory-specific analytics and reports
9. **Tasks & Calendar** - Task management and calendar
10. **Factory Settings** - Factory-specific configuration

### **🔧 Tools & Utilities**
- **AI Copilot** - AI-powered assistance and automation
- **Notifications** - System notifications and alerts
- **Profile** - User profile and preferences
- **Help & Support** - Help documentation and support
- **Language Toggle** - Khmer/English switching
- **Logout** - Sign out of the system

---

## 👥 **HR STAFF NAVIGATION**

### **🏠 Main Navigation**
1. **HR Dashboard** - HR-specific overview and management
2. **Document Management** - Upload and manage compliance documents
3. **Training & Meetings** - Training matrix and meeting management
4. **Permits & Certificates** - Permit registry and expiry tracking
5. **CAP Execution** - Execute and monitor CAPs
6. **HR Analytics** - HR-specific analytics and reporting
7. **HR Tasks** - HR task management and calendar

### **🔧 Tools & Utilities**
- **AI Copilot** - AI-powered assistance and automation
- **Notifications** - System notifications and alerts
- **Profile** - User profile and preferences
- **Help & Support** - Help documentation and support
- **Language Toggle** - Khmer/English switching
- **Logout** - Sign out of the system

---

## ⚖️ **GRIEVANCE COMMITTEE NAVIGATION**

### **🏠 Main Navigation**
1. **Committee Dashboard** - Committee overview and performance
2. **Case Management** - Grievance case intake and processing
3. **Case Intake** - Receive and triage grievances
4. **Investigations** - Manage investigation process
5. **Case Resolution** - Document resolutions and closures
6. **Committee Analytics** - Committee performance and SLA metrics
7. **Committee Reports** - Generate committee reports

### **🔧 Tools & Utilities**
- **AI Copilot** - AI-powered assistance and automation
- **Notifications** - System notifications and alerts
- **Profile** - User profile and preferences
- **Help & Support** - Help documentation and support
- **Language Toggle** - Khmer/English switching
- **Logout** - Sign out of the system

---

## 🔍 **AUDITOR NAVIGATION**

### **🏠 Main Navigation**
1. **Auditor Dashboard** - Read-only compliance overview
2. **Audit Preparation** - Prepare for audits and reviews
3. **Evidence Review** - Review compliance evidence
4. **CAP Review** - Review Corrective Action Plans
5. **Audit Reporting** - Generate audit reports
6. **Auditor Analytics** - Audit performance analytics

### **🔧 Tools & Utilities**
- **AI Copilot** - AI-powered assistance and automation
- **Notifications** - System notifications and alerts
- **Profile** - User profile and preferences
- **Help & Support** - Help documentation and support
- **Language Toggle** - Khmer/English switching
- **Logout** - Sign out of the system

---

## 👷 **WORKER NAVIGATION**

### **🏠 Main Navigation**
1. **Worker Portal** - Anonymous grievance submission
2. **Case Tracking** - Track submitted grievances
3. **Communication** - Communicate with committee

### **🔧 Tools & Utilities**
- **Profile** - User profile and preferences
- **Help & Support** - Help documentation and support
- **Language Toggle** - Khmer/English switching
- **Logout** - Sign out of the system

---

## 📊 **NAVIGATION SUMMARY BY ROLE**

| Role | Main Screens | Tools | Total Items |
|------|-------------|-------|-------------|
| **Super Admin** | 9 | 6 | 15 |
| **Factory Admin** | 10 | 6 | 16 |
| **HR Staff** | 7 | 6 | 13 |
| **Grievance Committee** | 7 | 6 | 13 |
| **Auditor** | 6 | 6 | 12 |
| **Worker** | 3 | 4 | 7 |

---

## 🎨 **NAVIGATION FEATURES**

### **📱 Responsive Design**
- **Mobile-friendly** navigation with collapsible sidebar
- **Touch-optimized** controls for mobile devices
- **Adaptive layout** that works on all screen sizes

### **🔐 Role-Based Access**
- **Permission-based** navigation items
- **Dynamic menu** that changes based on user role
- **Secure access** to role-specific features

### **🌐 Internationalization**
- **Bilingual support** (Khmer/English)
- **Language toggle** in navigation
- **Localized content** and cultural adaptation

### **⚡ Quick Actions**
- **Context-sensitive** quick actions
- **Role-specific** shortcuts and tools
- **Efficient workflow** optimization

### **🔔 Notifications**
- **Real-time alerts** and notifications
- **Multi-channel** notification system
- **Priority-based** notification management

---

## 🛠️ **IMPLEMENTATION NOTES**

### **Navigation Structure**
```javascript
// Role-based navigation mapping
roleNavigation: {
    'super_admin': ['super_admin', 'system_wide'],
    'factory_admin': ['factory_admin', 'system_wide'],
    'hr_staff': ['hr_staff', 'system_wide'],
    'grievance_committee': ['grievance_committee', 'system_wide'],
    'auditor': ['auditor', 'system_wide'],
    'worker': ['worker', 'system_wide']
}
```

### **Permission System**
- **RBAC (Role-Based Access Control)** for navigation items
- **ABAC (Attribute-Based Access Control)** for data access
- **Multi-tenant isolation** for factory-specific access

### **Navigation Methods**
- `getNavigationForRole(role)` - Get all navigation for a role
- `getNavigationBySection(role)` - Get navigation organized by sections
- `hasPermission(userRole, navigationId)` - Check navigation permissions
- `getPageConfig(pageUrl)` - Get page configuration

---

## 🎯 **KEY BENEFITS**

### **✅ User Experience**
- **Intuitive navigation** based on user role
- **Reduced cognitive load** with role-specific menus
- **Efficient workflow** with quick access to relevant features

### **🔒 Security**
- **Principle of least privilege** - users only see what they need
- **Secure access control** prevents unauthorized access
- **Audit trail** for all navigation actions

### **📈 Scalability**
- **Modular design** allows easy addition of new roles
- **Flexible permissions** system for complex access patterns
- **Multi-tenant support** for enterprise deployment

### **🌍 Accessibility**
- **Bilingual support** for Khmer and English users
- **Mobile-responsive** design for field workers
- **Accessibility compliance** for inclusive design

---

## 🚀 **DEPLOYMENT READINESS**

The navigation system is **production-ready** with:
- ✅ **Complete role-based navigation** for all 6 user roles
- ✅ **Proper permissions** and access control
- ✅ **Responsive design** for all devices
- ✅ **Internationalization** support
- ✅ **Security hardening** and audit logging
- ✅ **Performance optimization** for fast loading
- ✅ **Comprehensive documentation** for maintenance

---

*This navigation structure ensures that each user role has access to the tools and features they need to perform their responsibilities effectively while maintaining security and usability.*

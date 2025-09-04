// HR Dashboard
// Wait for Firebase to be available before initializing
function initializeHRDashboard() {
    // Check if Firebase is available
    if (!window.Firebase) {
        console.log('⏳ Waiting for Firebase to initialize...');
        setTimeout(initializeHRDashboard, 100);
        return;
    }

    // Get Firebase instances and functions from the global Firebase object
    const { auth, db } = window.Firebase;
    const {
        doc, 
        getDoc, 
        collection, 
        query, 
        where, 
        getDocs
    } = window.Firebase;

    let currentUser = null;
    let factoryId = null;

    document.addEventListener('DOMContentLoaded', init);

    function init(){
        auth.onAuthStateChanged(async (user)=>{
            if(!user){ window.location.href = 'login.html'; return; }
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            if(!userDoc.exists()){ window.location.href = 'login.html'; return; }
            const data = userDoc.data();
            currentUser = { id: userDoc.id, ...data };
            if(data.role !== 'hr_staff' && data.role !== 'super_admin'){
                window.location.href = 'dashboard.html';
                return;
            }
            factoryId = data.factoryId || null;
            // Update navigation for role, if available
            try {
                if (window.superAdminNav && window.NavigationConfig && window.NavigationConfig.methods) {
                    const items = window.NavigationConfig.methods.getNavigationForRole(data.role).map(item => ({
                        id: item.id, title: item.title, icon: item.icon, url: item.url, description: item.description
                    }));
                    if (Array.isArray(items) && items.length > 0) {
                        window.superAdminNav.updateNavigation(items);
                    }
                }
            } catch (e) { /* noop */ }
            loadStatsAndUsers();
        });
    }

    async function loadStatsAndUsers(){
        try{
            // Users scoped by factory
            const usersRef = collection(db, 'users');
            const usersQuery = factoryId ? query(usersRef, where('factoryId','==',factoryId)) : query(usersRef);
            const usersSnap = await getDocs(usersQuery);
            const all = usersSnap.docs.map(d=>({ id: d.id, ...d.data() }));
            const active = all.filter(u => (u.status||'active')==='active');

            // CAPs open in this factory (or all if no factoryId)
            let pending = 0;
            if (factoryId) {
                const capsRef = collection(db, 'caps');
                const capsQuery = query(capsRef, where('factoryId','==',factoryId));
                const capsSnap = await getDocs(capsQuery);
                pending = capsSnap.docs.filter(doc=>{
                    const s = (doc.data().status||'pending');
                    return s !== 'completed' && s !== 'closed';
                }).length;
            } else {
                const capsRef = collection(db, 'caps');
                const capsSnap = await getDocs(capsRef);
                pending = capsSnap.docs.filter(doc=>{
                    const s = (doc.data().status||'pending');
                    return s !== 'completed' && s !== 'closed';
                }).length;
            }

            // Trainings: 'training-record' category in last 30 days for this factory
            let trainings = 0;
            const now = new Date();
            const last30 = new Date(now.getTime() - 30*24*60*60*1000);
            if (factoryId) {
                const docsRef = collection(db, 'documents');
                const docsQuery = query(docsRef, where('factoryId','==',factoryId));
                const docsSnap = await getDocs(docsQuery);
                trainings = docsSnap.docs.filter(doc=>{
                    const d = doc.data();
                    const isTraining = d.category === 'training-record' || d.categoryName === 'Training Record';
                    const up = d.uploadedAt && (typeof d.uploadedAt.toDate==='function' ? d.uploadedAt.toDate() : new Date(d.uploadedAt));
                    return isTraining && up && up >= last30;
                }).length;
            } else {
                const docsRef = collection(db, 'documents');
                const docsSnap = await getDocs(docsRef);
                trainings = docsSnap.docs.filter(doc=>{
                    const d = doc.data();
                    const isTraining = d.category === 'training-record' || d.categoryName === 'Training Record';
                    const up = d.uploadedAt && (typeof d.uploadedAt.toDate==='function' ? d.uploadedAt.toDate() : new Date(d.uploadedAt));
                    return isTraining && up && up >= last30;
                }).length;
            }

            updateText('statUsers', all.length);
            updateText('statActive', active.length);
            updateText('statTraining', trainings);
            updateText('statPending', pending);
            renderUsers(all);
        }catch(e){
            console.error('HR load error', e);
            renderUsers([]);
        }
    }

    function renderUsers(users){
        const tbody = document.getElementById('hrUsersTable');
        if(!tbody) return;
        if(users.length===0){ tbody.innerHTML = '<tr><td colspan="5">No users found</td></tr>'; return; }
        tbody.innerHTML = users.map(u=>`
            <tr>
                <td>${escapeHtml(u.displayName || `${u.firstName||''} ${u.lastName||''}`.trim() || 'Unnamed')}</td>
                <td>${escapeHtml(u.email||'')}</td>
                <td><span class="role-badge">${formatRole(u.role)}</span></td>
                <td>${formatStatus(u.status||'active')}</td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="hr.view('${u.id}')"><i data-lucide="eye"></i>View</button>
                    <button class="btn btn-sm btn-outline" onclick="hr.edit('${u.id}')"><i data-lucide="edit"></i>Edit</button>
                </td>
            </tr>
        `).join('');
        if(window.lucide){ lucide.createIcons(); }
    }

    function formatRole(role){
        const map = { super_admin:'Super Admin', factory_admin:'Factory Admin', hr_staff:'HR Staff', auditor:'Auditor', worker:'Worker' };
        return map[role] || role || 'Unknown';
    }
    function formatStatus(s){
        const map = { active:'Active', inactive:'Inactive', pending:'Pending' };
        return map[s] || 'Active';
    }
    function updateText(id,val){ const el = document.getElementById(id); if(el) el.textContent = val; }
    function escapeHtml(str){ return String(str).replace(/[&<>"]+/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s])); }

    // Actions
    function openCreateUser(){ window.location.href = 'user-management.html'; }
    function exportUsers(){ window.location.href = 'user-management.html'; }
    function view(userId){ window.location.href = `user-dashboard.html?id=${encodeURIComponent(userId)}`; }
    function edit(userId){ window.location.href = `user-management.html?edit=${encodeURIComponent(userId)}`; }

    // Expose minimal API
    window.hr = { openCreateUser, exportUsers, view, edit };
}

// Start the initialization process
initializeHRDashboard();


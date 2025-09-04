// Auditor Dashboard
// Wait for Firebase to be available before initializing
function initializeAuditorDashboard() {
    // Check if Firebase is available
    if (!window.Firebase) {
        console.log('⏳ Waiting for Firebase to initialize...');
        setTimeout(initializeAuditorDashboard, 100);
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
        orderBy, 
        onSnapshot, 
        getDocs,
        limit
    } = window.Firebase;

    let currentUser = null;

    document.addEventListener('DOMContentLoaded', init);

    function init(){
        auth.onAuthStateChanged(async (user)=>{
            if(!user){ window.location.href='login.html'; return; }
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            if(!userDoc.exists()){ window.location.href='login.html'; return; }
            const data = userDoc.data();
            currentUser = { id: userDoc.id, ...data };
            if(data.role !== 'auditor' && data.role !== 'super_admin'){
                window.location.href='dashboard.html';
                return;
            }
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
            await Promise.all([
                loadComplianceTrend(),
                loadQuickStats(),
                loadRecentCAPs()
            ]);
        });
    }

    async function loadComplianceTrend(){
        try{
            const ctx = document.getElementById('complianceTrend');
            if(!ctx) return;
            // Calculate monthly completion rate from CAPs (completed vs total per month, last 6 months)
            const now = new Date();
            const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth()-5, 1);
            const capsRef = collection(db, 'caps');
            const capsQuery = query(capsRef, where('createdAt','>=', sixMonthsAgo));
            const snap = await getDocs(capsQuery);
            const buckets = {};
            for (let i=0;i<6;i++) {
                const d = new Date(now.getFullYear(), now.getMonth()- (5-i), 1);
                const key = d.getFullYear()+'-'+(d.getMonth()+1);
                buckets[key] = { total: 0, completed: 0, label: d.toLocaleDateString('en-US',{month:'short'}) };
            }
            snap.docs.forEach(doc=>{
                const d = doc.data();
                const created = d.createdAt && (typeof d.createdAt.toDate==='function' ? d.createdAt.toDate() : new Date(d.createdAt));
                if (!created) return;
                const key = created.getFullYear()+'-'+(created.getMonth()+1);
                if (!buckets[key]) return;
                buckets[key].total += 1;
                const status = (d.status||'pending');
                if (status==='completed' || status==='closed') buckets[key].completed += 1;
            });
            const labels = Object.values(buckets).map(b => b.label);
            const values = Object.values(buckets).map(b => b.total > 0 ? Math.round((b.completed / b.total) * 100) : 0);
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Compliance %',
                            data: values,
                            borderColor: '#3B82F6',
                            backgroundColor: 'rgba(59,130,246,0.1)',
                            fill: true,
                            tension: 0.4,
                            borderWidth: 2
                        }
                    ]
                },
                options: {
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { min: 0, max: 100 } }
                }
            });
        }catch(e){ console.error('Trend error', e); }
    }

    async function loadQuickStats(){
        try{
            // Open CAPs across all factories
            const capsRef = collection(db, 'caps');
            const capsSnap = await getDocs(capsRef);
            const open = capsSnap.docs.filter(d=>{ const s=d.data().status||'pending'; return s!=='completed' && s!=='closed'; }).length;
            updateText('statOpenCaps', open);
            // Documents expiring within 30 days across all factories
            const now = new Date();
            const docsRef = collection(db, 'documents');
            const docsSnap = await getDocs(docsRef);
            const expiring = docsSnap.docs.filter(doc=>{
                const exp = doc.data().expirationDate; if(!exp) return false;
                const date = typeof exp.toDate === 'function' ? exp.toDate() : new Date(exp);
                const days = Math.ceil((date - now)/(1000*60*60*24));
                return days>0 && days<=30;
            }).length;
            updateText('statExpiring', expiring);
        }catch(e){ console.error('Quick stats error', e); updateText('statOpenCaps','-'); updateText('statExpiring','-'); }
    }

    async function loadRecentCAPs(){
        try{
            const tbody = document.getElementById('auditorCaps');
            if(!tbody) return;
            const capsRef = collection(db, 'caps');
            const capsQuery = query(capsRef, orderBy('createdAt','desc'), limit(10));
            const snap = await getDocs(capsQuery);
            if(snap.empty){ tbody.innerHTML = '<tr><td colspan="4">No CAPs found</td></tr>'; return; }
            const factoriesMap = {};
            const rows = await Promise.all(snap.docs.map(async d=>{
                const c = d.data();
                const fId = c.factoryId; let fName = fId || 'Unknown';
                if(fId && !factoriesMap[fId]){
                    try{ 
                        const factoryDocRef = doc(db, 'factories', fId);
                        const fDoc = await getDoc(factoryDocRef); 
                        factoriesMap[fId] = fDoc.exists() ? (fDoc.data().name||fId) : fId; 
                    }catch{}
                }
                fName = factoriesMap[fId] || fName;
                const created = c.createdAt && typeof c.createdAt.toDate==='function' ? c.createdAt.toDate().toLocaleDateString() : '-';
                return `<tr><td>${escapeHtml(c.title||'Untitled')}</td><td>${escapeHtml(fName)}</td><td>${escapeHtml(c.status||'pending')}</td><td>${created}</td></tr>`;
            }));
            tbody.innerHTML = rows.join('');
            if(window.lucide){ lucide.createIcons(); }
        }catch(e){ console.error('CAPs load error', e); }
    }

    function updateText(id,val){ const el=document.getElementById(id); if(el) el.textContent=val; }
    function escapeHtml(str){ return String(str).replace(/[&<>\"]/g, s=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[s])); }

    function exportCaps(){ window.print(); }
    window.auditor = { exportCaps };
}

// Start the initialization process
initializeAuditorDashboard();


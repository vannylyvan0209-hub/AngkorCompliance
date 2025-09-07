/**
 * Angkor Compliance Platform - Service Worker
 * Progressive Web App service worker for offline functionality
 */

const CACHE_NAME = 'angkor-compliance-v2-2025';
const STATIC_CACHE = 'angkor-compliance-static-v2-2025';
const DYNAMIC_CACHE = 'angkor-compliance-dynamic-v2-2025';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/index.html',
  '/pages/auth/login.html',
  '/pages/auth/register.html',
  '/pages/worker-portal/worker-dashboard.html',
  '/pages/factory-admin/factory-dashboard.html',
  '/pages/auditor/auditor-dashboard.html',
  '/pages/super-admin/super-admin-dashboard.html',
  '/pages/hr/hr-dashboard.html',
  '/pages/grievance-committee/case-management-dashboard.html',
  '/assets/css/main-2025.css',
  '/assets/js/navigation-config.js',
  '/assets/js/navigation-template.js',
  '/firebase-config.js',
  '/manifest.json',
  '/favicon.png',
  '/logo.png',
  '/assets/js/firebase-auth.js',
  '/assets/js/firebase-firestore.js',
  '/assets/js/firebase-storage.js'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Static files cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error caching static files', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }
  
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Fetch from network
        return fetch(request)
          .then((networkResponse) => {
            // Don't cache if not a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // Clone the response
            const responseToCache = networkResponse.clone();
            
            // Cache dynamic content
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache);
              });
            
            return networkResponse;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            
            // Return cached version for other requests
            return caches.match(request);
          });
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      syncOfflineData()
    );
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from Angkor Compliance',
    icon: '/favicon.png',
    badge: '/favicon.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/favicon.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/favicon.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Angkor Compliance', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard.html')
    );
  }
});

// Message handling
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Helper function to sync offline data
async function syncOfflineData() {
  try {
    // Get offline data from IndexedDB
    const offlineData = await getOfflineData();
    
    if (offlineData.length > 0) {
      // Sync data with server
      for (const data of offlineData) {
        await syncDataItem(data);
      }
      
      // Clear offline data after successful sync
      await clearOfflineData();
      
      console.log('Service Worker: Offline data synced successfully');
    }
  } catch (error) {
    console.error('Service Worker: Error syncing offline data', error);
  }
}

// Helper function to get offline data
async function getOfflineData() {
  // This would typically use IndexedDB
  // For now, return empty array
  return [];
}

// Helper function to sync individual data item
async function syncDataItem(data) {
  try {
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Sync failed');
    }
    
    return response.json();
  } catch (error) {
    console.error('Service Worker: Error syncing data item', error);
    throw error;
  }
}

// Helper function to clear offline data
async function clearOfflineData() {
  // This would typically clear IndexedDB
  console.log('Service Worker: Offline data cleared');
}

// Update available notification
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
    // Notify clients about update
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'UPDATE_AVAILABLE'
        });
      });
    });
  }
});

console.log('Service Worker: Loaded');

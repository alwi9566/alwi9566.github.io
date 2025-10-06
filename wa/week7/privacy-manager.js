const STORAGE_PREFIX = 'driftHub_';
const EXPIRATION_DAYS = 30;

// Save data with expiration
function saveData(key, value) {
    const consent = getConsent();
    if (!consent && key !== 'consent') {
        console.log('Need consent first');
        return false;
    }

    const data = {
        value: value,
        expiry: Date.now() + (EXPIRATION_DAYS * 24 * 60 * 60 * 1000)
    };

    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
    return true;
}

// Get data (checks if expired)
function getData(key) {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    if (!item) return null;

    const data = JSON.parse(item);
    
    // Check if expired
    if (Date.now() > data.expiry) {
        removeData(key);
        return null;
    }

    return data.value;
}

// Remove specific data
function removeData(key) {
    localStorage.removeItem(STORAGE_PREFIX + key);
}

// Clear ALL Drift Hub data
function clearAllData() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
            localStorage.removeItem(key);
        }
    });
}

// Get all stored data (to show user what we have)
function getAllStoredData() {
    const allData = [];
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
            const item = JSON.parse(localStorage.getItem(key));
            const keyName = key.replace(STORAGE_PREFIX, '');
            allData.push({
                name: keyName,
                value: item.value,
                expires: new Date(item.expiry).toLocaleDateString()
            });
        }
    });
    
    return allData;
}

// Set user consent
function setConsent(granted) {
    const data = {
        value: granted,
        expiry: Date.now() + (365 * 24 * 60 * 60 * 1000) // 1 year
    };
    localStorage.setItem(STORAGE_PREFIX + 'consent', JSON.stringify(data));
}

// Check if user gave consent
function getConsent() {
    return getData('consent') === true;
}

// Check if user answered consent yet
function hasAnsweredConsent() {
    return localStorage.getItem(STORAGE_PREFIX + 'consent') !== null;
}

// Request location (state level only)
function requestLocation(callback) {
    if (!getConsent()) {
        callback({ error: 'Need consent first' });
        return;
    }

    if (!navigator.geolocation) {
        callback({ error: 'Location not supported' });
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async function(position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            // Get state from coordinates
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=5`
                );
                const data = await response.json();
                const state = data.address.state || 'Unknown';
                
                const locationData = {
                    state: state,
                    saved: new Date().toLocaleDateString()
                };
                
                saveData('userLocation', locationData);
                callback(locationData);
            } catch (e) {
                callback({ error: 'Could not get location' });
            }
        },
        function(error) {
            callback({ error: error.message });
        }
    );
}

// Get saved location
function getLocation() {
    return getData('userLocation');
}

// Remove location
function removeLocation() {
    removeData('userLocation');
}

// Clean up expired data on page load
window.addEventListener('load', function() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
            try {
                const item = JSON.parse(localStorage.getItem(key));
                if (Date.now() > item.expiry) {
                    localStorage.removeItem(key);
                }
            } catch (e) {
                // Skip if can't parse
            }
        }
    });
});
// Show privacy banner on first visit
window.addEventListener('load', function() {
    if (!hasAnsweredConsent()) {
        showPrivacyBanner();
    }
    createPrivacyButton();
    updateConsentDisplay();
});

// Create the privacy banner
function showPrivacyBanner() {
    const banner = document.createElement('div');
    banner.className = 'privacy-banner show';
    banner.id = 'privacyBanner';
    banner.innerHTML = `
        <div class="privacy-banner-content">
            <div class="privacy-banner-text">
                <h3>🍪 We Value Your Privacy</h3>
                <p>
                    Drift Hub stores your preferences (like theme) and location (with permission) 
                    to show local events. Data stays on your device for 30 days. 
                    <a href="privacy.html">Learn more</a>
                </p>
            </div>
            <div class="privacy-banner-buttons">
                <button class="privacy-btn privacy-btn-accept" onclick="acceptPrivacy()">
                    Accept All
                </button>
                <button class="privacy-btn privacy-btn-decline" onclick="declinePrivacy()">
                    Decline
                </button>
                <button class="privacy-btn privacy-btn-settings" onclick="openPrivacySettings()">
                    Settings
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(banner);
}

// Hide privacy banner
function hidePrivacyBanner() {
    const banner = document.getElementById('privacyBanner');
    if (banner) {
        banner.remove();
    }
}

// Accept privacy
function acceptPrivacy() {
    setConsent(true);
    hidePrivacyBanner();
    alert('✓ Privacy preferences saved! Your theme and preferences will be remembered.');
}

// Decline privacy
function declinePrivacy() {
    setConsent(false);
    hidePrivacyBanner();
    alert('Privacy declined. We will not store any data on your device.');
}

// Create privacy settings button (bottom left)
function createPrivacyButton() {
    const button = document.createElement('button');
    button.className = 'privacy-settings-btn';
    button.onclick = openPrivacySettings;
    button.setAttribute('aria-label', 'Privacy Settings');
    button.title = 'Privacy Settings';
    document.body.appendChild(button);
}

// Open privacy settings modal
function openPrivacySettings() {
    let modal = document.getElementById('privacyModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'privacy-modal';
        modal.id = 'privacyModal';
        modal.innerHTML = `
            <div class="privacy-modal-content">
                <div class="privacy-modal-header">
                    <h2>Privacy Settings</h2>
                    <button class="privacy-close-btn" onclick="closePrivacySettings()">×</button>
                </div>

                <div class="privacy-section">
                    <h3>Your Privacy Consent</h3>
                    <p>Control what data Drift Hub can store.</p>
                    <div class="privacy-control">
                        <div class="privacy-control-info">
                            <h4>Data Storage</h4>
                            <p id="consentStatus">Loading...</p>
                        </div>
                        <button class="primary" id="toggleConsentBtn" onclick="toggleConsent()">
                            Toggle
                        </button>
                    </div>
                </div>

                <div class="privacy-section">
                    <h3>Location Services</h3>
                    <p>Share your state to see local events.</p>
                    <div class="privacy-control">
                        <div class="privacy-control-info">
                            <h4>Location</h4>
                            <p id="locationStatus">Not shared</p>
                        </div>
                        <button class="primary" onclick="shareLocation()">
                            Share Location
                        </button>
                    </div>
                    <div class="privacy-control">
                        <div class="privacy-control-info">
                            <h4>Remove Location</h4>
                            <p>Delete saved location data</p>
                        </div>
                        <button class="danger" onclick="deleteLocation()">
                            Remove
                        </button>
                    </div>
                </div>

                <div class="privacy-section">
                    <h3>Your Stored Data</h3>
                    <p>See what's currently stored:</p>
                    <div class="privacy-data-list" id="storedDataList">
                        <p class="privacy-empty">Loading...</p>
                    </div>
                </div>

                <div class="privacy-section">
                    <h3>Delete All Data</h3>
                    <p>Remove all stored preferences and data.</p>
                    <div class="privacy-control">
                        <div class="privacy-control-info">
                            <h4>Clear Everything</h4>
                            <p>This cannot be undone</p>
                        </div>
                        <button class="danger" onclick="clearEverything()">
                            Clear All Data
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Close modal when clicking outside
        modal.onclick = function(e) {
            if (e.target === modal) {
                closePrivacySettings();
            }
        };
    }
    
    modal.classList.add('show');
    updateConsentDisplay();
    updateLocationDisplay();
    displayStoredData();
}

// Close privacy settings
function closePrivacySettings() {
    const modal = document.getElementById('privacyModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Toggle consent on/off
function toggleConsent() {
    const currentConsent = getConsent();
    setConsent(!currentConsent);
    updateConsentDisplay();
    
    if (!currentConsent) {
        alert('✓ Consent granted! We can now save your preferences.');
    } else {
        alert('Consent removed. Data will not be saved.');
    }
}

// Update consent display
function updateConsentDisplay() {
    const statusEl = document.getElementById('consentStatus');
    const btnEl = document.getElementById('toggleConsentBtn');
    
    if (statusEl) {
        const hasConsent = getConsent();
        statusEl.textContent = hasConsent ? '✓ Granted' : '✗ Not granted';
        statusEl.style.color = hasConsent ? '#4CAF50' : '#f44336';
    }
    
    if (btnEl) {
        const hasConsent = getConsent();
        btnEl.textContent = hasConsent ? 'Revoke Consent' : 'Grant Consent';
    }
}

// Share location
function shareLocation() {
    if (!getConsent()) {
        alert('Please grant consent first!');
        return;
    }
    
    const statusEl = document.getElementById('locationStatus');
    if (statusEl) {
        statusEl.textContent = 'Getting location...';
    }
    
    requestLocation(function(result) {
        if (result.error) {
            alert('Could not get location: ' + result.error);
            updateLocationDisplay();
        } else {
            alert('✓ Location saved: ' + result.state);
            updateLocationDisplay();
            displayStoredData();
        }
    });
}

// Update location display
function updateLocationDisplay() {
    const statusEl = document.getElementById('locationStatus');
    if (statusEl) {
        const location = getLocation();
        if (location) {
            statusEl.textContent = `✓ Saved: ${location.state}`;
            statusEl.style.color = '#4CAF50';
        } else {
            statusEl.textContent = 'Not shared';
            statusEl.style.color = '#666';
        }
    }
}

// Delete location
function deleteLocation() {
    if (confirm('Remove saved location?')) {
        removeLocation();
        alert('✓ Location removed');
        updateLocationDisplay();
        displayStoredData();
    }
}

// Display all stored data
function displayStoredData() {
    const container = document.getElementById('storedDataList');
    if (!container) return;
    
    const data = getAllStoredData();
    
    if (data.length === 0) {
        container.innerHTML = '<p class="privacy-empty">No data stored</p>';
        return;
    }
    
    let html = '';
    data.forEach(item => {
        let displayValue = item.value;
        if (typeof item.value === 'object') {
            displayValue = JSON.stringify(item.value);
        }
        
        html += `
            <div class="privacy-data-item">
                <strong>${item.name}:</strong> ${displayValue}
                <small>Expires: ${item.expires}</small>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Clear all data
function clearEverything() {
    if (confirm('Delete ALL stored data? This cannot be undone!')) {
        clearAllData();
        alert('✓ All data cleared!');
        closePrivacySettings();
        
        // Refresh page to reset everything
        setTimeout(function() {
            location.reload();
        }, 500);
    }
}
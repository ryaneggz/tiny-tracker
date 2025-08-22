(function() {
    'use strict';
    
    // Configuration
    const TRACKER_CONFIG = {
        endpoint: 'http://localhost:8080/event',
        cookieName: 'tt_uid',
        cookieMaxAge: 60 * 60 * 24 * 365 * 2 // 2 years
    };
    
    // Generate or retrieve user ID
    function getUid() {
        const match = document.cookie.match(new RegExp('(?:^|;)\\s*' + TRACKER_CONFIG.cookieName + '=([^;]+)'));
        if (match) return match[1];
        
        const uid = (Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)).slice(0, 16);
        document.cookie = `${TRACKER_CONFIG.cookieName}=${uid};path=/;max-age=${TRACKER_CONFIG.cookieMaxAge}`;
        return uid;
    }
    
    // Send tracking event
    function sendEvent(eventData) {
        const payload = {
            url: location.href,
            ref: document.referrer || "",
            uid: getUid(),
            ...eventData
        };
        
        const body = JSON.stringify(payload);
        
        if (navigator.sendBeacon) {
            navigator.sendBeacon(TRACKER_CONFIG.endpoint, new Blob([body], { type: "application/json" }));
        } else {
            fetch(TRACKER_CONFIG.endpoint, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: body,
                credentials: 'include'
            }).catch(err => console.warn('Tracking failed:', err));
        }
    }
    
    // Track page view
    function trackPageView() {
        sendEvent({
            event_type: 'page_view',
            timestamp: Date.now()
        });
    }
    
    // Track click events
    function trackClick(element, eventName) {
        const clickData = {
            event_type: 'click',
            event_name: eventName,
            element_tag: element.tagName.toLowerCase(),
            element_text: element.textContent.trim().substring(0, 100),
            timestamp: Date.now()
        };
        
        // Add href for links
        if (element.tagName.toLowerCase() === 'a' && element.href) {
            clickData.link_url = element.href;
        }
        
        // Add button type
        if (element.tagName.toLowerCase() === 'button') {
            clickData.button_type = element.type || 'button';
        }
        
        sendEvent(clickData);
    }
    
    // Track form submissions
    function trackFormSubmit(form, eventName) {
        sendEvent({
            event_type: 'form_submit',
            event_name: eventName || 'form_submit',
            form_id: form.id || 'unnamed',
            timestamp: Date.now()
        });
    }
    
    // Auto-track elements with data-track-event attribute
    function setupAutoTracking() {
        document.addEventListener('click', function(e) {
            const element = e.target;
            const trackEvent = element.getAttribute('data-track-event');
            
            if (trackEvent) {
                trackClick(element, trackEvent);
            }
        });
        
        // Track form submissions
        document.addEventListener('submit', function(e) {
            const form = e.target;
            const trackEvent = form.getAttribute('data-track-event') || 
                              form.querySelector('[data-track-event]')?.getAttribute('data-track-event');
            
            if (trackEvent || form.id === 'contact-form') {
                trackFormSubmit(form, trackEvent || 'contact_form_submit');
            }
        });
    }
    
    // Track time on page
    function setupTimeTracking() {
        let startTime = Date.now();
        let isActive = true;
        
        // Track when user becomes inactive
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                isActive = false;
                sendEvent({
                    event_type: 'time_on_page',
                    duration: Date.now() - startTime,
                    timestamp: Date.now()
                });
            } else {
                isActive = true;
                startTime = Date.now();
            }
        });
        
        // Track before page unload
        window.addEventListener('beforeunload', function() {
            if (isActive) {
                sendEvent({
                    event_type: 'time_on_page',
                    duration: Date.now() - startTime,
                    timestamp: Date.now()
                });
            }
        });
    }
    
    // Initialize tracking when DOM is ready
    function init() {
        // Track initial page view
        trackPageView();
        
        // Setup event listeners
        setupAutoTracking();
        setupTimeTracking();
        
        // Expose tracking functions globally for manual use
        window.tracker = {
            trackClick: trackClick,
            trackEvent: sendEvent,
            trackPageView: trackPageView
        };
    }
    
    // Start tracking when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
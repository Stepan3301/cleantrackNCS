/**
 * Utility functions for the modern button functionality
 */

/**
 * Adds loading state to buttons with loading class
 * Simulates the loading spinner and disables the button temporarily
 */
export function setupButtonLoading() {
  // Wait for DOM to be fully loaded
  if (typeof document === 'undefined') return;
  
  // Find all loading buttons
  const loadingButtons = document.querySelectorAll('.btn-loading, .button[data-loading="true"], [aria-busy="true"]');
  
  loadingButtons.forEach(btn => {
    if (!(btn instanceof HTMLElement)) return;
    
    // Check if button already has a spinner
    if (!btn.querySelector('.btn-spinner, .spinner')) {
      // Create spinner element
      const spinner = document.createElement('span');
      spinner.className = 'btn-spinner';
      btn.prepend(spinner);
    }
    
    // Add click event listener
    btn.addEventListener('click', function() {
      // Disable button during loading state
      btn.setAttribute('disabled', 'true');
      
      // Re-enable button after 2 seconds (simulating loading completion)
      setTimeout(() => {
        btn.removeAttribute('disabled');
      }, 2000);
    });
  });
}

/**
 * Adds hover effects to icon buttons
 */
export function setupIconButtons() {
  // Wait for DOM to be fully loaded
  if (typeof document === 'undefined') return;
  
  // Find all icon buttons
  const iconButtons = document.querySelectorAll('.btn-icon, button.icon, .icon-button, button[class*="rounded-full"]');
  
  iconButtons.forEach(btn => {
    if (!(btn instanceof HTMLElement)) return;
    
    // Add hover animations
    btn.addEventListener('mouseenter', function() {
      const icon = btn.querySelector('svg');
      if (icon) {
        icon.style.transform = 'scale(1.1)';
        icon.style.transition = 'transform 0.2s ease';
      }
    });
    
    btn.addEventListener('mouseleave', function() {
      const icon = btn.querySelector('svg');
      if (icon) {
        icon.style.transform = 'scale(1)';
      }
    });
  });
}

/**
 * Initialize all button enhancements
 */
export function initializeModernButtons() {
  setupButtonLoading();
  setupIconButtons();
  
  // Add ripple effect to buttons
  addRippleEffect();
}

/**
 * Adds a ripple effect to all buttons
 */
function addRippleEffect() {
  // Wait for DOM to be fully loaded
  if (typeof document === 'undefined') return;
  
  // Find all buttons
  const buttons = document.querySelectorAll('button, .btn, .button');
  
  buttons.forEach(button => {
    if (!(button instanceof HTMLElement)) return;
    
    // Skip buttons that already have the listener
    if (button.dataset.rippleInitialized) return;
    
    button.dataset.rippleInitialized = 'true';
    
    button.addEventListener('click', function(e) {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ripple = document.createElement('span');
      ripple.style.position = 'absolute';
      ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
      ripple.style.borderRadius = '50%';
      ripple.style.width = '0';
      ripple.style.height = '0';
      ripple.style.transform = 'translate(-50%, -50%)';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.style.pointerEvents = 'none';
      
      button.style.position = button.style.position || 'relative';
      button.style.overflow = 'hidden';
      
      button.appendChild(ripple);
      
      // Animate ripple
      const animation = ripple.animate([
        { width: '0', height: '0', opacity: 1 },
        { width: '500px', height: '500px', opacity: 0 }
      ], {
        duration: 600,
        easing: 'ease-out'
      });
      
      animation.onfinish = () => {
        ripple.remove();
      };
    });
  });
} 
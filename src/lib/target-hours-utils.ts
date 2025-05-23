/**
 * Utility functions for Target Hours page
 */

import { User } from "@/contexts/auth-context";

/**
 * Get user initials from name
 */
export function getInitials(name: string): string {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

/**
 * Add the bubbles animation to the target hours page
 */
export function setupTargetBubbles() {
  // Wait for DOM to be fully loaded
  if (typeof document === 'undefined') return;
  
  // Create bubbles container if it doesn't exist
  let bubblesContainer = document.querySelector('.target-bubbles');
  if (!bubblesContainer) {
    bubblesContainer = document.createElement('div');
    bubblesContainer.className = 'target-bubbles';
    document.body.appendChild(bubblesContainer);
    
    // Create bubbles
    for (let i = 0; i < 3; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'target-bubble';
      bubblesContainer.appendChild(bubble);
    }
  }
}

/**
 * Setup the bulk set modal
 */
export function setupBulkSetModal(
  onConfirm: (value: number) => void
) {
  // Wait for DOM to be fully loaded
  if (typeof document === 'undefined') return;
  
  setTimeout(() => {
    const bulkSetBtn = document.getElementById('bulkSetBtn');
    const bulkSetModalBg = document.getElementById('bulkSetModalBg');
    const bulkSetInput = document.getElementById('bulkSetInput') as HTMLInputElement;
    const bulkSetConfirm = document.getElementById('bulkSetConfirm');
    const bulkSetCancel = document.getElementById('bulkSetCancel');
    
    if (!bulkSetBtn || !bulkSetModalBg || !bulkSetInput || !bulkSetConfirm || !bulkSetCancel) {
      console.warn('Bulk set modal elements not found');
      return;
    }
    
    // Open modal
    bulkSetBtn.addEventListener('click', () => {
      bulkSetModalBg.classList.add('active');
      bulkSetInput.value = '';
      bulkSetInput.focus();
    });
    
    // Close modal
    const closeBulkSetModal = () => {
      bulkSetModalBg.classList.remove('active');
    };
    
    bulkSetCancel.addEventListener('click', closeBulkSetModal);
    bulkSetModalBg.addEventListener('click', (e) => {
      if (e.target === bulkSetModalBg) closeBulkSetModal();
    });
    
    // Handle Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeBulkSetModal();
    });
    
    // Confirm bulk set
    bulkSetConfirm.addEventListener('click', () => {
      const val = parseInt(bulkSetInput.value, 10);
      if (isNaN(val) || val < 0 || val > 500) {
        bulkSetInput.style.background = "#ffe0e0";
        bulkSetInput.focus();
        return;
      }
      
      onConfirm(val);
      closeBulkSetModal();
    });
    
    // Allow Enter key to confirm
    bulkSetInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') bulkSetConfirm.click();
    });
    
    console.log('Bulk set modal initialized');
  }, 200);
}

/**
 * Show a save message
 */
export function showSaveMessage(message: string) {
  const msg = document.getElementById('saveMsg');
  if (!msg) return;
  
  msg.textContent = message;
  msg.style.display = "block";
  
  setTimeout(() => {
    msg.style.display = "none";
  }, 1800);
}

/**
 * Initialize the target hours page
 */
export function initializeTargetHoursPage() {
  // Add target-hours-page class to body
  document.body.classList.add('target-hours-page');
  
  // Setup bubbles
  setupTargetBubbles();
  
  // Clean up function to remove classes when component unmounts
  return () => {
    document.body.classList.remove('target-hours-page');
  };
} 
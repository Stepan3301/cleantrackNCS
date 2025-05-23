/**
 * Utility functions for the modern employees page
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
 * Sets up the custom select dropdown
 */
export function setupCustomSelect(elementId: string, onSelectionChange?: (value: string) => void) {
  // Wait for DOM to be fully loaded
  if (typeof document === 'undefined') return;
  
  setTimeout(() => {
    const selectContainer = document.getElementById(elementId);
    if (!selectContainer) {
      console.warn(`Custom select container with ID ${elementId} not found`);
      return;
    }
  
    const selected = selectContainer.querySelector('.select-selected');
    const items = selectContainer.querySelector('.select-items');
    const arrow = selectContainer.querySelector('.select-arrow');
    
    if (!selected || !items) {
      console.warn(`Custom select elements not found within container ${elementId}`);
      return;
    }
    
    // Ensure the dropdown is initially hidden
    items.classList.add('select-hide');
    items.classList.remove('select-show');
    
    // Handle select click
    selected.addEventListener('click', function(e) {
      e.stopPropagation();
      closeAllSelect(this);
      selected.classList.toggle('active');
      items.classList.toggle('select-hide');
      items.classList.toggle('select-show');
    });
    
    // Handle option click
    items.querySelectorAll('div').forEach(option => {
      option.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent event bubbling
        const target = e.target as HTMLElement;
        selected.textContent = target.textContent;
        const value = target.getAttribute('data-value') || '';
        
        // Update selected item
        items.querySelectorAll('div').forEach(opt => opt.classList.remove('selected'));
        target.classList.add('selected');
        
        // Hide dropdown
        items.classList.add('select-hide');
        items.classList.remove('select-show');
        selected.classList.remove('active');
        
        if (onSelectionChange) {
          onSelectionChange(value);
        }
      });
    });
    
    // Close all selects when clicking outside
    document.addEventListener('click', closeAllSelect);
    
    console.log(`Custom select ${elementId} initialized successfully`);
  }, 200); // Increased timeout to ensure DOM is fully rendered
}

/**
 * Close all select dropdowns except the current one
 */
function closeAllSelect(elmnt: any) {
  const selectContainers = document.querySelectorAll('.custom-select');
  
  selectContainers.forEach(container => {
    const selected = container.querySelector('.select-selected');
    const items = container.querySelector('.select-items');
    
    if (selected !== elmnt) {
      selected?.classList.remove('active');
      items?.classList.add('select-hide');
      items?.classList.remove('select-show');
    }
  });
}

/**
 * Add the bubbles animation to the employees page
 */
export function setupEmployeesBubbles() {
  // Wait for DOM to be fully loaded
  if (typeof document === 'undefined') return;
  
  // Create bubbles container if it doesn't exist
  let bubblesContainer = document.querySelector('.employees-bubbles');
  if (!bubblesContainer) {
    bubblesContainer = document.createElement('div');
    bubblesContainer.className = 'employees-bubbles';
    document.body.appendChild(bubblesContainer);
    
    // Create bubbles
    for (let i = 0; i < 3; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'employees-bubble';
      bubblesContainer.appendChild(bubble);
    }
  }
}

/**
 * Initialize employees page
 */
export function initializeEmployeesPage() {
  // Add employees-page class to body
  document.body.classList.add('employees-page');
  
  // Setup bubbles
  setupEmployeesBubbles();
  
  // Clean up function to remove classes when component unmounts
  return () => {
    document.body.classList.remove('employees-page');
  };
} 
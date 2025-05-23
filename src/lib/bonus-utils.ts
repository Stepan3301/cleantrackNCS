/**
 * Utility functions for the Bonuses page
 */

/**
 * Initializes the modern styling for the Bonuses page
 * @returns Cleanup function to remove event listeners
 */
export function initializeBonusesPage(): () => void {
  // Add class to body
  document.body.classList.add('bonuses-page');
  
  // Create and append animated bubbles
  const bubbles = document.createElement('div');
  bubbles.className = 'bonus-bubbles';
  
  // Add 3 bubbles
  for (let i = 0; i < 3; i++) {
    const bubble = document.createElement('div');
    bubble.className = 'bonus-bubble';
    bubbles.appendChild(bubble);
  }
  
  document.body.appendChild(bubbles);
  
  // Return cleanup function
  return () => {
    document.body.classList.remove('bonuses-page');
    if (bubbles.parentNode) {
      bubbles.parentNode.removeChild(bubbles);
    }
  };
}

/**
 * Shows a success notification for a staff member
 * @param staffName The name of the staff member
 */
export function showBonusUpdated(staffName: string): void {
  // Check if notification already exists
  let notification = document.querySelector('.bonus-notification');
  
  // If not, create a new one
  if (!notification) {
    notification = document.createElement('div');
    notification.className = 'bonus-notification';
    document.body.appendChild(notification);
  }
  
  // Set content and show
  notification.textContent = `Bonus updated for ${staffName}`;
  notification.classList.add('show');
  
  // Hide after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

/**
 * Gets the initials of a person from their name
 * @param name Full name
 * @returns Initials (up to 2 characters)
 */
export function getInitials(name: string): string {
  if (!name) return '';
  
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Calculate bonus amount based on hours worked and formula
 * @param hoursWorked Hours worked
 * @param targetHours Target hours threshold
 * @param amountPerHour Amount per hour
 * @returns The calculated bonus amount
 */
export function calculateBonus(
  hoursWorked: number,
  targetHours: number,
  amountPerHour: number
): number {
  if (hoursWorked <= targetHours) return 0;
  
  const extraHours = hoursWorked - targetHours;
  return extraHours * amountPerHour;
}

/**
 * Get appropriate CSS class for progress status
 * @param progress Progress percentage (0-100)
 * @returns CSS class name for the status
 */
export function getProgressStatusClass(progress: number): string {
  if (progress < 30) {
    return 'status-below';
  } else if (progress < 80) {
    return 'status-progressing';
  } else if (progress < 100) {
    return 'status-near';
  } else {
    return 'status-achieved';
  }
} 
/**
 * Utility functions for the Announcements page
 */

/**
 * Initializes the modern styling for the Announcements page
 * @returns Cleanup function to remove event listeners
 */
export function initializeAnnouncementsPage(): () => void {
  // Add class to body
  document.body.classList.add('announcements-page');
  
  // Create and append animated bubbles
  const bubbles = document.createElement('div');
  bubbles.className = 'announcement-bubbles';
  
  // Add 3 bubbles
  for (let i = 0; i < 3; i++) {
    const bubble = document.createElement('div');
    bubble.className = 'announcement-bubble';
    bubbles.appendChild(bubble);
  }
  
  document.body.appendChild(bubbles);
  
  // Return cleanup function
  return () => {
    document.body.classList.remove('announcements-page');
    if (bubbles.parentNode) {
      bubbles.parentNode.removeChild(bubbles);
    }
  };
}

/**
 * Format date for display in announcements
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export function formatAnnouncementDate(dateString: string): string {
  const date = new Date(dateString);
  
  // Format: "January 1, 2023 at 2:30 PM"
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) + ' at ' + 
  date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Truncate text with ellipsis
 * @param text Text to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Shows a notification toast for announcement actions
 * @param message The message to display
 * @param type The type of notification ('success' or 'error')
 */
export function showAnnouncementNotification(message: string, type: 'success' | 'error'): void {
  // Check if notification already exists
  let notification = document.querySelector('.announcement-notification');
  
  // If not, create a new one
  if (!notification) {
    notification = document.createElement('div');
    notification.className = 'announcement-notification';
    document.body.appendChild(notification);
  }
  
  // Add appropriate class based on type
  notification.classList.remove('success', 'error');
  notification.classList.add(type);
  
  // Set content and show
  notification.textContent = message;
  notification.classList.add('show');
  
  // Hide after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

/**
 * Validate announcement form data
 * @param title Announcement title
 * @param content Announcement content
 * @param type Announcement type
 * @param recipients Array of recipient IDs (only needed for direct announcements)
 * @returns Object containing validation result and error message if any
 */
export function validateAnnouncementForm(
  title: string, 
  content: string, 
  type: 'general' | 'direct',
  recipients: string[]
): { isValid: boolean; errorMessage?: string } {
  if (!title.trim()) {
    return { isValid: false, errorMessage: 'Title is required' };
  }
  
  if (!content.trim()) {
    return { isValid: false, errorMessage: 'Content is required' };
  }
  
  if (type === 'direct' && (!recipients || recipients.length === 0)) {
    return { isValid: false, errorMessage: 'Please select at least one recipient' };
  }
  
  return { isValid: true };
} 
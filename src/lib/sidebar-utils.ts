/**
 * Utility functions for the sidebar navigation
 */

/**
 * Highlights the active link in the sidebar
 * Should be called after the sidebar is rendered in the DOM
 */
export function setupSidebarNavigation() {
  // Wait for DOM to be fully loaded
  if (typeof document === 'undefined') return;
  
  // Highlight active link based on current path
  const currentPath = window.location.pathname;
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  
  sidebarLinks.forEach(link => {
    // Remove active class from all links
    link.classList.remove('active');
    
    // Add active class to current link
    const linkHref = link.getAttribute('href');
    if (linkHref && (currentPath === linkHref || currentPath.startsWith(linkHref + '/'))) {
      link.classList.add('active');
    }
    
    // Add click event listener
    link.addEventListener('click', function() {
      // Remove active class from all links
      document.querySelectorAll('.sidebar-link').forEach(l => 
        l.classList.remove('active')
      );
      
      // Add active class to clicked link
      this.classList.add('active');
    });
  });
}

/**
 * Toggles the sidebar collapse state
 * @param {boolean} collapsed - Whether the sidebar should be collapsed
 */
export function toggleSidebar(collapsed: boolean) {
  const sidebar = document.querySelector('.sidebar-nav');
  if (!sidebar) return;
  
  if (collapsed) {
    sidebar.classList.add('collapsed');
  } else {
    sidebar.classList.remove('collapsed');
  }
} 
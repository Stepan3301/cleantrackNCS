# FullCalendar Implementation for Staff Hours

This implementation replaces the existing calendar with [FullCalendar](https://fullcalendar.io/), which offers better mobile responsiveness and a more feature-rich calendar experience.

## Features

- Mobile-optimized calendar view that automatically switches to week view on smaller screens
- Ability to see hours directly in each calendar day cell
- Better touch support for mobile users
- More intuitive date selection
- Maintains all existing functionality including the restriction to submit only for the current day

## Installation

You can install the required dependencies in one of two ways:

### Using the script

Run the provided installation script:

```bash
./install-fullcalendar.sh
```

### Manual installation

Run the following command:

```bash
npm install @fullcalendar/react @fullcalendar/core @fullcalendar/daygrid @fullcalendar/interaction
```

## Implementation Details

The implementation consists of several key files:

1. `src/components/hours/FullCalendarHours.tsx` - The main component implementing FullCalendar
2. `src/components/hours/fullcalendar-styles.css` - Custom styles for the calendar
3. `src/components/hours/StaffHoursView.tsx` - Updated to use the new FullCalendar component

### Key Features

- **Responsive Design**: Automatically switches between month view (desktop) and week view (mobile)
- **Day cell customization**: Shows the day number and hours data directly in each cell
- **Today Highlighting**: The current day is highlighted for better visibility
- **Date Selection Restrictions**: Only allows selection of the current day for hour submissions

### Mobile Optimizations

- Smaller font sizes on mobile devices
- Compact header with smaller buttons
- Week view on narrow screens for better readability
- Optimized touch targets

## Usage

The component works exactly like the previous calendar implementation. Users can:

1. View their submitted hours across the month
2. Select the current day to enter hours
3. Submit hours, location, and description data
4. View their dashboard when no day is selected

## Known Limitations

- TypeScript linter may show errors until the app is rebuilt after installing dependencies
- Some browser-specific issues may need additional CSS tweaking 
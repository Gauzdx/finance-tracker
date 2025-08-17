# Design Document

## Overview

This design outlines the implementation approach for reducing toast notification timeout from the default duration to 1.5 seconds. The solution involves configuring the vue-toastification plugin with custom options in the main application setup file.

## Architecture

The toast notification system uses vue-toastification plugin which is configured globally in `src/main.js`. The plugin provides a centralized configuration approach where timeout settings can be specified once and applied to all toast notifications throughout the application.

### Current Implementation
- Toast plugin is initialized with default settings: `app.use(Toast)`
- Default timeout is typically 5000ms (5 seconds)
- All components use `useToast()` composable to access toast functionality

### Proposed Implementation
- Configure toast plugin with custom options object
- Set timeout to 1500ms (1.5 seconds) for all toast types
- Maintain existing toast functionality and styling

## Components and Interfaces

### Modified Components
1. **src/main.js** - Main application setup file where toast configuration will be updated

### Unchanged Components
- **src/components/AddTransaction.vue** - Will inherit new timeout automatically
- **src/components/TransactionList.vue** - Will inherit new timeout automatically  
- **src/App.vue** - Will inherit new timeout automatically

### Configuration Interface
The vue-toastification plugin accepts a configuration object with the following relevant properties:
- `timeout`: Number (milliseconds) - Duration before toast auto-dismisses
- `hideProgressBar`: Boolean - Whether to show/hide progress bar
- `closeOnClick`: Boolean - Whether clicking dismisses toast
- `pauseOnFocusLoss`: Boolean - Whether to pause timeout when window loses focus

## Data Models

No new data models are required. The existing toast usage patterns remain unchanged:
- `toast.success(message)`
- `toast.error(message)`
- `toast.info(message)`
- `toast.warning(message)`

## Error Handling

No additional error handling is required as this is a configuration change. The existing error handling in components remains unchanged.

## Testing Strategy

### Manual Testing
1. Trigger various toast notifications in the application
2. Verify each toast disappears after approximately 1.5 seconds
3. Test different toast types (success, error, info, warning)
4. Verify toast functionality remains intact (click to dismiss, progress bar, etc.)

### Test Scenarios
1. Add a new transaction - verify success toast timeout
2. Trigger validation errors - verify error toast timeout  
3. Export transactions - verify info/progress toasts timeout
4. Delete transaction - verify success toast timeout
5. API errors - verify error toast timeout

### Verification Points
- Toast appears immediately when triggered
- Toast disappears automatically after 1.5 seconds
- User can still manually dismiss toast by clicking
- Multiple toasts stack properly with consistent timeout
- No regression in existing toast functionality
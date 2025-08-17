# Requirements Document

## Introduction

This feature involves reducing the toast notification display time from the default duration to 1.5 seconds across the entire application. Toast notifications are currently used for success messages, error messages, info messages, and warnings throughout the application components (AddTransaction, TransactionList, and App components).

## Requirements

### Requirement 1

**User Story:** As a user, I want toast notifications to disappear after 1.5 seconds, so that they don't stay on screen too long and interfere with my workflow.

#### Acceptance Criteria

1. WHEN any toast notification is displayed THEN the system SHALL automatically dismiss it after 1.5 seconds
2. WHEN a success toast is shown (e.g., "Transaction added", "Transaction deleted") THEN it SHALL disappear after 1.5 seconds
3. WHEN an error toast is shown (e.g., validation errors, API errors) THEN it SHALL disappear after 1.5 seconds
4. WHEN an info toast is shown (e.g., "Fetching transactions") THEN it SHALL disappear after 1.5 seconds
5. WHEN a warning toast is shown (e.g., "No transactions to export") THEN it SHALL disappear after 1.5 seconds

### Requirement 2

**User Story:** As a user, I want the toast timeout configuration to be centralized, so that all toast notifications across the application have consistent behavior.

#### Acceptance Criteria

1. WHEN the toast plugin is configured THEN the system SHALL apply the 1.5-second timeout globally to all toast types
2. WHEN any component uses the toast functionality THEN it SHALL inherit the global timeout configuration without requiring component-level changes
3. WHEN the application initializes THEN the toast configuration SHALL be set once in the main application setup
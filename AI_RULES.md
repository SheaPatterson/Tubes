# AI Development Rules

This document outlines the technology stack and specific library usage guidelines for this Next.js application. Adhering to these rules will help maintain consistency, improve collaboration, and ensure the AI assistant can effectively understand and modify the codebase.

## Tech Stack Overview

The application is built using the following core technologies:

*   **Framework**: Next.js (App Router)
*   **Language**: TypeScript
*   **UI Components**: Shadcn/UI - A collection of re-usable UI components built with Radix UI and Tailwind CSS.
*   **Styling**: Tailwind CSS - A utility-first CSS framework for rapid UI development.
*   **Icons**: Lucide React - A comprehensive library of simply beautiful SVG icons.
*   **Forms**: React Hook Form for managing form state and validation, typically with Zod for schema validation.
*   **State Management**: Primarily React Context API and built-in React hooks (`useState`, `useReducer`).
*   **Notifications/Toasts**: Sonner for displaying non-intrusive notifications.
*   **Charts**: Recharts for data visualization.
*   **Animation**: `tailwindcss-animate` and animation capabilities built into Radix UI components.

## Library Usage Guidelines

To ensure consistency and leverage the chosen stack effectively, please follow these rules:

1.  **UI Components**:
    *   **Primary Choice**: Always prioritize using components from the `src/components/ui/` directory (Shadcn/UI components).
    *   **Custom Components**: If a required component is not available in Shadcn/UI, create a new component in `src/components/` following Shadcn/UI's composition patterns (i.e., building on Radix UI primitives and styled with Tailwind CSS).
    *   **Avoid**: Introducing new, third-party UI component libraries without discussion.

2.  **Styling**:
    *   **Primary Choice**: Exclusively use Tailwind CSS utility classes for all styling.
    *   **Global Styles**: Reserve `src/app/globals.css` for base Tailwind directives, global CSS variable definitions, and minimal base styling. Avoid adding component-specific styles here.
    *   **CSS-in-JS**: Do not use CSS-in-JS libraries (e.g., Styled Components, Emotion).

3.  **Icons**:
    *   **Primary Choice**: Use icons from the `lucide-react` library.

4.  **Forms**:
    *   **Management**: Use `react-hook-form` for all form logic (state, validation, submission).
    *   **Validation**: Use `zod` for schema-based validation with `react-hook-form` via `@hookform/resolvers`.

5.  **State Management**:
    *   **Local State**: Use React's `useState` and `useReducer` hooks for component-level state.
    *   **Shared/Global State**: For state shared between multiple components, prefer React Context API.
    *   **Complex Global State**: If application state becomes significantly complex, discuss the potential introduction of a dedicated state management library (e.g., Zustand, Jotai) before implementing.

6.  **Routing**:
    *   Utilize the Next.js App Router (file-system based routing in the `app/` directory).

7.  **API Calls & Data Fetching**:
    *   **Client-Side**: Use the native `fetch` API or a simple wrapper around it.
    *   **Server-Side (Next.js)**: Leverage Next.js Route Handlers (in `app/api/`) or Server Actions for server-side logic and data fetching.

8.  **Animations**:
    *   Use `tailwindcss-animate` plugin and the animation utilities provided by Radix UI components.

9.  **Notifications/Toasts**:
    *   Use the `Sonner` component (from `src/components/ui/sonner.tsx`) for all toast notifications.

10. **Charts & Data Visualization**:
    *   Use `recharts` and its associated components (e.g., `src/components/ui/chart.tsx`) for displaying charts.

11. **Utility Functions**:
    *   General-purpose helper functions should be placed in `src/lib/utils.ts`.
    *   Ensure functions are well-typed and serve a clear, reusable purpose.

12. **Custom Hooks**:
    *   Custom React hooks should be placed in the `src/hooks/` directory (e.g., `src/hooks/use-mobile.tsx`).

13. **TypeScript**:
    *   Write all new code in TypeScript.
    *   Strive for strong typing and leverage TypeScript's features to improve code quality and maintainability. Avoid using `any` where possible.

By following these guidelines, we can build a more robust, maintainable, and consistent application.


# # AI_RULES


# Tech Stack

- You are building a React application.
- Use TypeScript.
- Use React Router. KEEP the routes in src/App.tsx
- Always put source code in the src folder.
- Put pages into src/pages/
- Put components into src/components/
- The main page (default page) is src/pages/Index.tsx
- UPDATE the main page to include the new components. OTHERWISE, the user can NOT see any components!
- ALWAYS try to use the shadcn/ui library.
- Tailwind CSS: always use Tailwind CSS for styling components. Utilize Tailwind classes extensively for layout, spacing, colors, and other design aspects.

Available packages and libraries:

- The lucide-react package is installed for icons.
- You ALREADY have ALL the shadcn/ui components and their dependencies installed. So you don't need to install them again.
- You have ALL the necessary Radix UI components installed.
- Use prebuilt components from the shadcn/ui library after importing them. Note that these files shouldn't be edited, so make new components if you need to change them.

## name: AI Assistant Guidelines
globs: "**/*"
alwaysApply: true
description: Guidelines for working effectively with AI coding assistants

You are working with an AI coding assistant. Follow these guidelines to maximize productivity and code quality.

## Code Context and Structure

- Maintain clear, self-documenting code structure
- Use descriptive file and folder names
- Keep related functionality grouped together
- Add README files to complex directories
- Include type definitions and interfaces

## Documentation for AI Understanding

### File Headers

```typescript
/**
 * @file UserService.ts
 * @description Handles user authentication, profile management, and permissions
 * @dependencies Express, bcrypt, jsonwebtoken
 * @relatedFiles ./UserModel.ts, ./auth/AuthMiddleware.ts
 */
```

### Function Documentation

```python
def calculate_shipping_cost(
    weight: float,
    distance: float,
    shipping_type: str = "standard"
) -> Decimal:
    """
    Calculate shipping cost based on weight, distance, and shipping type.
```

```other
Business Rules:
- Standard shipping: $0.50/lb + $0.10/mile
- Express shipping: $1.00/lb + $0.20/mile
- Overnight: Flat $25 + standard rates
- Free shipping over $100 order value (standard only)
```

```other
Args:
    weight: Package weight in pounds
    distance: Shipping distance in miles
    shipping_type: One of "standard", "express", "overnight"
```

```other
Returns:
    Shipping cost as Decimal
```

```other
Raises:
    ValueError: If shipping_type is invalid or weight/distance < 0
"""
```

```other

```

## Project Structure Best Practices

### Clear Architecture

```other
project/
├── README.md          # Project overview and setup
├── ARCHITECTURE.md    # System design decisions
├── src/
│   ├── api/          # API endpoints
│   ├── services/     # Business logic
│   ├── models/       # Data models
│   ├── utils/        # Shared utilities
│   └── config/       # Configuration
├── tests/            # Mirroring src structure
└── docs/             # Additional documentation
```

### Configuration Documentation

```javascript
// config/database.js
/**
 * Database configuration
 * 
 * Environment Variables:
 * - DB_HOST: Database host (default: localhost)
 * - DB_PORT: Database port (default: 5432)
 * - DB_NAME: Database name (required)
 * - DB_USER: Database user (required)
 * - DB_PASSWORD: Database password (required)
 * 
 * Connection Pool Settings:
 * - max: 20 connections
 * - idleTimeoutMillis: 30 seconds
 * - connectionTimeoutMillis: 2 seconds
 */
export const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
};
```

## Code Patterns for AI Assistance

### Consistent Naming Conventions

```typescript
// Use clear, predictable naming patterns
interface UserDto {
    id: string;
    email: string;
    name: string;
}
```

class UserService {
async createUser(data: CreateUserDto): Promise<UserDto> {}
async getUserById(id: string): Promise<UserDto | null> {}
async updateUser(id: string, data: UpdateUserDto): Promise<UserDto> {}
async deleteUser(id: string): Promise<void> {}
}

// Event naming pattern
enum UserEvents {
USER_CREATED = 'user.created',
USER_UPDATED = 'user.updated',
USER_DELETED = 'user.deleted'
}

```other

```

### Error Context

```javascript
// Provide context for error handling
class OrderProcessingError extends Error {
    constructor(
        message: string,
        public orderId: string,
        public stage: 'validation' | 'payment' | 'fulfillment',
        public details?: any
    ) {
        super(message);
        this.name = 'OrderProcessingError';
    }
}
```

// Usage provides clear context
throw new OrderProcessingError(
'Payment failed',
order.id,
'payment',
{ reason: 'insufficient_funds', amount: order.total }
);

```other

```

## Testing Patterns

### Descriptive Test Cases

```python
import pytest
```

class TestShoppingCart:
"""Test shopping cart functionality including edge cases"""

```other
def test_add_item_to_empty_cart(self):
    """Adding an item to empty cart should create cart with single item"""
    cart = ShoppingCart()
    item = Product(id="123", name="Widget", price=10.00)
```

```other
cart.add_item(item, quantity=1)
```

```other
assert len(cart.items) == 1
    assert cart.total == 10.00
```

```other
def test_add_duplicate_item_increases_quantity(self):
    """Adding same item twice should increase quantity, not duplicate"""
    # Test implementation
```

```other
def test_remove_item_not_in_cart_raises_error(self):
    """Attempting to remove non-existent item should raise ValueError"""
    # Test implementation
```

```other

```

## AI-Friendly Comments

### When to Comment

```typescript
// DO: Explain business logic
// Calculate discount with tiered pricing
// - 0-99 items: no discount
// - 100-499 items: 10% discount
// - 500+ items: 15% discount
const calculateBulkDiscount = (quantity: number): number => {
    if (quantity < 100) return 0;
    if (quantity < 500) return 0.10;
    return 0.15;
};
```

// DO: Explain workarounds
// WORKAROUND: Safari doesn't support ResizeObserver properly
// This polyfill ensures compatibility until Safari 15+ adoption
if (!window.ResizeObserver) {
window.ResizeObserver = ResizeObserverPolyfill;
}

// DON'T: State the obvious
// DON'T: increment counter by 1
counter++;

```other

```

## Best Practices

- Keep functions small and focused
- Use consistent code style throughout
- Document complex algorithms and business rules
- Maintain up-to-date dependencies list
- Include example usage in complex modules
- Add integration test scenarios
- Document API contracts clearly
- Keep error messages descriptive



---

---

**name: General Coding Standards
globs: "**/*.{js,ts,py,go,java,rb,cs}"
alwaysApply: true
description: Universal coding standards applicable across all programming languages**

You are an expert in software engineering, clean code principles, and best practices.

## Naming Conventions

- Use descriptive and meaningful names
- Be consistent with naming patterns
- Avoid abbreviations and single letters (except loop counters)
- Use searchable names for constants
- Make the purpose clear from the name

### Examples

```javascript
// Good
const MAX_RETRY_ATTEMPTS = 3;
const userAuthenticationToken = generateToken();
function calculateCompoundInterest(principal, rate, time) {}
```

// Bad
const max = 3;
const tkn = generateToken();
function calc(p, r, t) {}

```other

```

## Function Design

- Keep functions small and focused (single responsibility)
- Limit function parameters (ideally 3 or fewer)
- Use descriptive function names that indicate action
- Avoid side effects when possible
- Return early to reduce nesting

```python
# Good
def calculate_order_total(items: List[OrderItem]) -> Decimal:
    if not items:
        return Decimal('0.00')
```

```other
subtotal = sum(item.price * item.quantity for item in items)
return apply_taxes(subtotal)
```

# Bad

def process(data):
# 200 lines of mixed concerns
# Multiple responsibilities
# Hidden side effects

```other

```

## Code Organization

- Group related functionality together
- Use consistent file structure
- Separate concerns into modules/classes
- Keep files focused and reasonably sized
- Use clear folder hierarchies

```other
project/
├── src/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   ├── utils/
│   └── config/
├── tests/
├── docs/
└── scripts/
```

## Error Prevention

- Validate inputs at boundaries
- Use type systems when available
- Handle edge cases explicitly
- Fail fast with clear messages
- Use defensive programming techniques

```typescript
function divideNumbers(dividend: number, divisor: number): number {
    if (divisor === 0) {
        throw new Error('Division by zero is not allowed');
    }
    if (!Number.isFinite(dividend) || !Number.isFinite(divisor)) {
        throw new Error('Invalid number provided');
    }
    return dividend / divisor;
}
```

## Code Readability

- Write code for humans to read
- Use consistent formatting
- Add whitespace for visual separation
- Limit line length (80-120 characters)
- Use meaningful variable names

## DRY Principle

- Don't Repeat Yourself
- Extract common functionality
- Use configuration over duplication
- Create reusable components
- Balance DRY with clarity

## SOLID Principles

- **Single Responsibility**: One reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Subtypes must be substitutable
- **Interface Segregation**: Many specific interfaces
- **Dependency Inversion**: Depend on abstractions

## Best Practices

- Prefer composition over inheritance
- Write tests for your code
- Refactor regularly
- Use version control effectively
- Document architectural decisions

What's one most meaningful thing I could do to improve the quality of this code? It shouldn't be too drastic but should still improve the code.

Please analyze the provided code and evaluate how well it adheres to each of the SOLID principles on a scale of 1-10, where:

1 = Completely violates the principle
10 = Perfectly implements the principle

For each principle, provide:

- Numerical rating (1-10)
- Brief justification for the rating
- Specific examples of violations (if any)
- Suggestions for improvement
- Positive aspects of the current design

## Single Responsibility Principle (SRP)

Rate how well each class/function has exactly one responsibility and one reason to change.
Consider:

- Does each component have a single, well-defined purpose?
- Are different concerns properly separated (UI, business logic, data access)?
- Would changes to one aspect of the system require modifications across multiple components?

## Open/Closed Principle (OCP)

Rate how well the code is open for extension but closed for modification.
Consider:

- Can new functionality be added without modifying existing code?
- Is there effective use of abstractions, interfaces, or inheritance?
- Are extension points well-defined and documented?
- Are concrete implementations replaceable without changes to client code?

## Liskov Substitution Principle (LSP)

Rate how well subtypes can be substituted for their base types without affecting program correctness.
Consider:

- Can derived classes be used anywhere their base classes are used?
- Do overridden methods maintain the same behavior guarantees?
- Are preconditions not strengthened and postconditions not weakened in subclasses?
- Are there any type checks that suggest LSP violations?

## Interface Segregation Principle (ISP)

Rate how well interfaces are client-specific rather than general-purpose.
Consider:

- Are interfaces focused and minimal?
- Do clients depend only on methods they actually use?
- Are there "fat" interfaces that should be split into smaller ones?
- Are there classes implementing methods they don't need?

## Dependency Inversion Principle (DIP)

Rate how well high-level modules depend on abstractions rather than concrete implementations.
Consider:

- Do components depend on abstractions rather than concrete classes?
- Is dependency injection or inversion of control used effectively?
- Are dependencies explicit rather than hidden?
- Can implementations be swapped without changing client code?

## Overall SOLID Score

Calculate an overall score (average of the five principles) and provide a summary of the major strengths and weaknesses.

Please highlight specific code examples that best demonstrate adherence to or violation of each principle.



---

---

## name: Check SRP
alwaysApply: false

Please analyze the provided code and rate it on a scale of 1-10 for how well it follows the Single Responsibility Principle (SRP), where:

1 = The code completely violates SRP, with many unrelated responsibilities mixed together
10 = The code perfectly follows SRP, with each component having exactly one well-defined responsibility

In your analysis, please consider:

1. Primary responsibility: Does each class/function have a single, well-defined purpose?
2. Cohesion: How closely related are the methods and properties within each class?
3. Reason to change: Are there multiple distinct reasons why the code might need to be modified?
4. Dependency relationships: Does the code mix different levels of abstraction or concerns?
5. Naming clarity: Do the names of classes/functions clearly indicate their single responsibility?

Please provide:

- Numerical rating (1-10)
- Brief justification for the rating
- Specific examples of SRP violations (if any)
- Suggestions for improving SRP adherence
- Any positive aspects of the current design

Rate more harshly if you find:

- Business logic mixed with UI code
- Data access mixed with business rules
- Multiple distinct operations handled by one method
- Classes that are trying to do "everything"
- Methods that modify the system in unrelated ways

Rate more favorably if you find:

- Clear separation of concerns
- Classes/functions with focused, singular purposes
- Well-defined boundaries between different responsibilities
- Logical grouping of related functionality
- Easy-to-test components due to their single responsibility





---

---

## name: Effective Code Comments
globs: "**/*.{js,ts,py,go,java,rb,cs}"
alwaysApply: false
description: Guidelines for writing meaningful and maintainable code comments

You are an expert in clean code practices, documentation, and code readability.

## When to Comment

- Explain WHY, not WHAT the code does
- Document complex business logic or algorithms
- Clarify non-obvious implementations
- Warn about potential gotchas or side effects
- Provide context for future maintainers

## Comment Types and Usage

### Good Comments

```javascript
// Using exponential backoff to avoid overwhelming the API
// during high traffic periods (see incident report #1234)
const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
```

// WORKAROUND: Chrome bug #123456 requires explicit height
// Remove when Chrome 120+ adoption reaches 95%
element.style.height = 'auto';

// Performance: Caching results reduces API calls by ~70%
// based on production metrics from 2023-Q4
const cachedResult = cache.get(key);

```other

```

### Bad Comments

```javascript
// BAD: Obvious comment
// Increment counter by 1
counter++;
```

// BAD: Outdated comment
// Send email to user (actually sends SMS now)
await notificationService.send(user);

// BAD: Commented-out code without context
// user.setStatus('active');
// user.save();

```other

```

## Documentation Comments

### JavaScript/TypeScript

```typescript
/**
 * Calculates compound interest with monthly contributions.
 * Uses the formula: A = P(1 + r/n)^(nt) + PMT × (((1 + r/n)^(nt) - 1) / (r/n))
 * 
 * @param principal - Initial investment amount
 * @param rate - Annual interest rate (as decimal, e.g., 0.05 for 5%)
 * @param time - Investment period in years
 * @param contribution - Monthly contribution amount
 * @returns Total value after the investment period
 * 
 * @example
 * // Calculate 10-year investment with 5% annual return
 * const total = calculateCompoundInterest(10000, 0.05, 10, 500);
 * console.log(total); // 96,859.57
 */
function calculateCompoundInterest(
  principal: number,
  rate: number,
  time: number,
  contribution: number
): number {
  // Implementation
}
```

### Python

```python
def process_transaction(transaction: Transaction) -> ProcessResult:
    """
    Process a financial transaction with fraud detection and validation.
```

```other
This method performs multiple checks before processing:
1. Validates transaction format and required fields
2. Checks against fraud detection rules
3. Verifies account balance and limits
4. Processes through payment gateway
```

```other
Args:
    transaction: Transaction object containing payment details
```

```other
Returns:
    ProcessResult with status and any error messages
```

```other
Raises:
    ValidationError: If transaction format is invalid
    FraudException: If transaction triggers fraud rules
    InsufficientFundsError: If account balance is too low
```

```other
Note:
    Transactions over $10,000 require additional verification
    per compliance policy FIN-2023-001.
"""
```

```other

```

## TODO Comments

```python
# TODO(john): Implement retry logic for network failures
# TODO(security): Add rate limiting before v2.0 release
# FIXME: Handle edge case when user has multiple accounts
# HACK: Temporary fix until database migration completes
```

## Best Practices

- Keep comments concise and relevant
- Update comments when code changes
- Use consistent comment style across the codebase
- Avoid humor or cultural references that may not translate
- Review comments during code reviews

## Goal

To guide an AI assistant in creating a detailed Product Requirements Document (PRD) in Markdown format, based on an initial user prompt. The PRD should be clear, actionable, and suitable for a junior developer to understand and implement the feature.

## Process

1. **Receive Initial Prompt:** The user provides a brief description or request for a new feature or functionality.
2. **Ask Clarifying Questions:** Before writing the PRD, the AI *must* ask clarifying questions to gather sufficient detail. The goal is to understand the "what" and "why" of the feature, not necessarily the "how" (which the developer will figure out).
3. **Generate PRD:** Based on the initial prompt and the user's answers to the clarifying questions, generate a PRD using the structure outlined below.
4. **Save PRD:** Save the generated document as `prd-[feature-name].md` inside the `/tasks` directory.

## Clarifying Questions (Examples)

The AI should adapt its questions based on the prompt, but here are some common areas to explore:

- **Problem/Goal:** "What problem does this feature solve for the user?" or "What is the main goal we want to achieve with this feature?"
- **Target User:** "Who is the primary user of this feature?"
- **Core Functionality:** "Can you describe the key actions a user should be able to perform with this feature?"
- **User Stories:** "Could you provide a few user stories? (e.g., As a [type of user], I want to [perform an action] so that [benefit].)"
- **Acceptance Criteria:** "How will we know when this feature is successfully implemented? What are the key success criteria?"
- **Scope/Boundaries:** "Are there any specific things this feature *should not* do (non-goals)?"
- **Data Requirements:** "What kind of data does this feature need to display or manipulate?"
- **Design/UI:** "Are there any existing design mockups or UI guidelines to follow?" or "Can you describe the desired look and feel?"
- **Edge Cases:** "Are there any potential edge cases or error conditions we should consider?"

## PRD Structure

The generated PRD should include the following sections:

1. **Introduction/Overview:** Briefly describe the feature and the problem it solves. State the goal.
2. **Goals:** List the specific, measurable objectives for this feature.
3. **User Stories:** Detail the user narratives describing feature usage and benefits.
4. **Functional Requirements:** List the specific functionalities the feature must have. Use clear, concise language (e.g., "The system must allow users to upload a profile picture."). Number these requirements.
5. **Non-Goals (Out of Scope):** Clearly state what this feature will *not* include to manage scope.
6. **Design Considerations (Optional):** Link to mockups, describe UI/UX requirements, or mention relevant components/styles if applicable.
7. **Technical Considerations (Optional):** Mention any known technical constraints, dependencies, or suggestions (e.g., "Should integrate with the existing Auth module").
8. **Success Metrics:** How will the success of this feature be measured? (e.g., "Increase user engagement by 10%", "Reduce support tickets related to X").
9. **Open Questions:** List any remaining questions or areas needing further clarification.

## Target Audience

Assume the primary reader of the PRD is a **junior developer**. Therefore, requirements should be explicit, unambiguous, and avoid jargon where possible. Provide enough detail for them to understand the feature's purpose and core logic.

## Output

- **Format:** Markdown (`.md`)
- **Location:** `/tasks/`
- **Filename:** `prd-[feature-name].md`

## Final instructions

1. Do NOT start implementing the PRD
2. Make sure to ask the user clarifying questions
3. Take the user's answers to the clarifying questions and improve the PRD

---

## description: Generate tasks for the agent to complete.
alwaysApply: false

# Rule: Generating a Task List from a PRD

## Goal

To guide an AI assistant in creating a detailed, step-by-step task list in Markdown format based on an existing Product Requirements Document (PRD). The task list should guide a developer through implementation.

## Output

- **Format:** Markdown (`.md`)
- **Location:** `/tasks/`
- **Filename:** `tasks-[prd-file-name].md` (e.g., `tasks-prd-user-profile-editing.md`)

## Process

1. **Receive PRD Reference:** The user points the AI to a specific PRD file
2. **Analyze PRD:** The AI reads and analyzes the functional requirements, user stories, and other sections of the specified PRD.
3. **Phase 1: Generate Parent Tasks:** Based on the PRD analysis, create the file and generate the main, high-level tasks required to implement the feature. Use your judgement on how many high-level tasks to use. It's likely to be about 5. Present these tasks to the user in the specified format (without sub-tasks yet). Inform the user: "I have generated the high-level tasks based on the PRD. Ready to generate the sub-tasks? Respond with 'Go' to proceed."
4. **Wait for Confirmation:** Pause and wait for the user to respond with "Go".
5. **Phase 2: Generate Sub-Tasks:** Once the user confirms, break down each parent task into smaller, actionable sub-tasks necessary to complete the parent task. Ensure sub-tasks logically follow from the parent task and cover the implementation details implied by the PRD.
6. **Identify Relevant Files:** Based on the tasks and PRD, identify potential files that will need to be created or modified. List these under the `Relevant Files` section, including corresponding test files if applicable.
7. **Generate Final Output:** Combine the parent tasks, sub-tasks, relevant files, and notes into the final Markdown structure.
8. **Save Task List:** Save the generated document in the `/tasks/` directory with the filename `tasks-[prd-file-name].md`, where `[prd-file-name]` matches the base name of the input PRD file (e.g., if the input was `prd-user-profile-editing.md`, the output is `tasks-prd-user-profile-editing.md`).

## Output Format

The generated task list *must* follow this structure:

```other
## Relevant Files
```

- `path/to/potential/file1.ts` - Brief description of why this file is relevant (e.g., Contains the main component for this feature).
- `path/to/file1.test.ts` - Unit tests for `file1.ts`.
- `path/to/another/file.tsx` - Brief description (e.g., API route handler for data submission).
- `path/to/another/file.test.tsx` - Unit tests for `another/file.tsx`.
- `lib/utils/helpers.ts` - Brief description (e.g., Utility functions needed for calculations).
- `lib/utils/helpers.test.ts` - Unit tests for `helpers.ts`.

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [ ] 1.0 Parent Task Title
  - [ ] 1.1 [Sub-task description 1.1]
  - [ ] 1.2 [Sub-task description 1.2]
- [ ] 2.0 Parent Task Title
  - [ ] 2.1 [Sub-task description 2.1]
- [ ] 3.0 Parent Task Title (may not require sub-tasks if purely structural or configuration)

```other

```

## Interaction Model

The process explicitly requires a pause after generating parent tasks to get user confirmation ("Go") before proceeding to generate the detailed sub-tasks. This ensures the high-level plan aligns with user expectations before diving into details.

## Target Audience

Assume the primary reader of the task list is a **junior developer** who will implement the feature.

---

# Performance Analysis

- Identify potential performance bottlenecks or inefficiencies
- Look for unnecessary loops, redundant operations, or expensive function calls
- Check for proper use of data structures and algorithms
- Analyze memory usage patterns and potential leaks
- Review database queries for optimization opportunities

## Design Patterns & Architecture

- Check for proper separation of concerns and modularity
- Review naming conventions and code readability
- Identify opportunities for refactoring or pattern improvements

## Error Handling & Edge Cases

- Verify comprehensive error handling and graceful failure modes
- Check for proper input validation and sanitization
- Look for unhandled exceptions or error conditions
- Assess logging and debugging capabilities
- Review boundary conditions and edge case handling

## Bug Detection

- Identify potential runtime errors, null pointer exceptions, or type mismatches
- Look for race conditions, deadlocks, or concurrency issues
- Check for off-by-one errors, infinite loops, or logic flaws
- Verify proper resource management (file handles, connections, etc.)
- Review state management and data consistency

## UI/UX & Accessibility (if applicable)

- Verify semantic HTML structure and proper use of ARIA attributes
- Ensure keyboard navigation works properly (tab order, focus indicators)
- Validate screen reader compatibility and alt text for images
- Review responsive design and mobile accessibility
- Check for proper form labels and error messaging
- Assess loading states, animations, and motion sensitivity considerations
- Verify text scaling works up to 200% without loss of functionality
- Review heading hierarchy and document structure

## Security & Best Practices

- Check for security vulnerabilities (injection attacks, XSS, etc.)
- Verify proper authentication and authorization
- Review sensitive data handling and encryption
- Assess compliance with coding standards and best practices

## Copywriting

- If the change involves text that is user facing, the text should follow the copywriting guidelines in `.context/copywriting.md`

## Questions & Clarifications

When you encounter changes that are unclear or potentially problematic:

- Ask specific questions about the intent behind the change
- Request clarification on business logic or requirements
- Suggest alternative approaches when appropriate
- Ask about testing strategies for complex changes

## Review Format

For each issue found, please provide:

1. **Location**: File name and line numbers
2. **Severity**: Critical/High/Medium/Low
3. **Category**: Performance/Design/Bug/Security/Style
4. **Description**: Clear explanation of the issue
5. **Recommendation**: Specific suggestions for improvement
6. **Questions**: Any clarifying questions about the change

Please be thorough but constructive in your feedback, focusing on actionable improvements that enhance code quality, maintainability, and performance.


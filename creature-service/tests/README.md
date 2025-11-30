# Creature Service Tests

## Overview

This directory contains unit tests for the Creature Service backend logic.

## Test Coverage

We focus on **unit testing the service layer** (`src/services/creatureService.js`) with comprehensive test coverage:

- ✅ **100% Statement Coverage**
- ✅ **100% Branch Coverage**
- ✅ **100% Function Coverage**
- ✅ **100% Line Coverage**

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

### `tests/services/creatureService.test.js`

Tests for the creature service business logic:

#### `getAllCreatures()`
- ✓ Returns all creatures from database
- ✓ Returns empty array when no creatures exist
- ✓ Throws error when database query fails

#### `getCreatureById(id)`
- ✓ Returns a creature by ID
- ✓ Returns null when creature does not exist
- ✓ Throws error when database query fails

#### `createCreature(data)`
- ✓ Creates a new creature with valid data
- ✓ Creates creatures with all valid species
- ✓ Throws error when database insert fails

## Mocking Strategy

We use Jest's `unstable_mockModule` to mock the Prisma client, ensuring:
- Tests run without requiring a database connection
- Fast test execution
- Isolated unit tests that only test business logic
- No side effects between tests

## Test Philosophy

These tests follow best practices for unit testing:
1. **Isolation**: Each test is independent and doesn't rely on external dependencies
2. **Clarity**: Test names clearly describe what is being tested
3. **Coverage**: All code paths and edge cases are tested
4. **Maintainability**: Tests are easy to understand and modify

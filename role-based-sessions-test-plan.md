# Role-Based Sessions Page Test Plan

## Overview
This document outlines the test cases to verify the role-based views implementation for the SessionsPage component.

## Test Cases

### 1. Student Role Testing
**Expected Behavior:**
- Should see only their own sessions in table view
- Should see full calendar view with only their sessions
- Form should show counselor selection (not student selection)
- Form should NOT show Outcome field
- Form should NOT show Next Steps field
- Should prevent selecting counselors with conflicting schedules

**Manual Test Steps:**
1. Login as a student user
2. Navigate to Sessions page
3. Verify table shows only student's sessions
4. Verify calendar shows only student's sessions
5. Click "Schedule New Session" button
6. Verify form shows:
   - Counselor dropdown (enabled)
   - No student dropdown
   - No Outcome field
   - No Next Steps field
7. Try to schedule session with conflicting counselor time
8. Verify conflict validation works

### 2. Counselor Role Testing
**Expected Behavior:**
- Should see only their own sessions in table view
- Should see full calendar view with only their sessions
- Form should show student selection (not counselor selection)
- Form should show Outcome field
- Form should show Next Steps field
- Should prevent selecting students with conflicting schedules

**Manual Test Steps:**
1. Login as a counselor user
2. Navigate to Sessions page
3. Verify table shows only counselor's sessions
4. Verify calendar shows only counselor's sessions
5. Click "Schedule New Session" button
6. Verify form shows:
   - Student dropdown (enabled)
   - No counselor dropdown
   - Outcome field (visible)
   - Next Steps field (visible)
7. Try to schedule session with conflicting student time
8. Verify conflict validation works

### 3. Admin/Staff Role Testing
**Expected Behavior:**
- Should see all sessions in table view
- Should see full calendar view with all sessions
- Form should show both student and counselor selection
- Form should NOT show Outcome field
- Form should NOT show Next Steps field
- Should prevent both student and counselor scheduling conflicts

**Manual Test Steps:**
1. Login as an admin or staff user
2. Navigate to Sessions page
3. Verify table shows all sessions
4. Verify calendar shows all sessions
5. Click "Schedule New Session" button
6. Verify form shows:
   - Student dropdown (enabled)
   - Counselor dropdown (enabled)
   - No Outcome field
   - No Next Steps field
7. Try to schedule session with conflicting times
8. Verify conflict validation works for both student and counselor

### 4. Schedule Conflict Validation Testing
**Test Scenarios:**
1. Student trying to book with busy counselor
2. Counselor trying to book with busy student
3. Admin trying to book overlapping sessions
4. Same person having multiple sessions at same time

### 5. Form Field Visibility Testing
**Fields by Role:**
- Student Selection: Hidden for students, visible for counselors and others
- Counselor Selection: Hidden for counselors, visible for students and others
- Outcome: Only visible for counselors
- Next Steps: Only visible for counselors

### 6. Data Filtering Testing
**Expected Data Access:**
- Students: Only sessions where they are the student
- Counselors: Only sessions where they are the counselor
- Others: All sessions

## Test Data Requirements
- At least 1 student user with existing sessions
- At least 1 counselor user with existing sessions
- At least 1 admin/staff user
- Multiple sessions with different students and counselors
- Some overlapping session times for conflict testing

## Success Criteria
- All role-based filtering works correctly
- Form fields show/hide based on user role
- Schedule conflict validation prevents double-booking
- No TypeScript/compilation errors
- UI remains responsive and user-friendly

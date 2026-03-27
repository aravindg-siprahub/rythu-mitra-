---
description: Web IDE Integration Flow
---
# Web IDE Integration Workflow

This workflow defines the lifecycle of the browser-based IDE integration.

## 1. Page Load Flow
- **URL**: `/ide/assignment/:id`
- **Action**: Fetch assignment details via `GET /api/ide/assignments/:id`.
- **Auth**: JWT (Learner Session).
- **State**:
  - `status`: loading | ready | error
  - `code`: assignment.starter_code or default template

## 2. Submission Flow
- **Action**: Post code via `POST /api/ide/submit`.
- **Payload**: `{ assignment_id, code_snapshot }`.
- **Immediate Response**: `SubmissionRead` object with status `pending`.

## 3. Polling Lifecycle
- **Trigger**: Success response from `submit`.
- **Interval**: 2000ms.
- **Endpoint**: `GET /api/ide/submissions/{submission_id}`.
- **Logic**:
  - Update UI status badge based on `status`.
  - **Termination**: Stop polling when `status` is `passed`, `failed`, or `error`.
- **Cleanup**: Ensure `clearInterval` is called on component unmount.

## 4. Error Handling
- **API Failure**: Show toast notification.
- **Worker Timeout**: Submission status will transition to `error` via Celery logic; UI should display this clearly.

# Participant Data Model Refactoring & Profile Update

I have refactored the application to store `userId` in the event participants list instead of static name and email. This allows user profile updates (name, email) to be automatically reflected in all events they are part of.

## Changes Made

### Backend
- **Event Model**: Updated `participants` array to store `{ userId, wishlist }`.
- **Join Event**: Now stores `userId` when a user joins.
- **Get Event**: Populates participant details (`name`, `email`) from the `users` collection dynamically.
- **Matching**: Fetches fresh user details before generating assignments.
- **Profile API**: Created `PUT /api/profile` to allow users to update their name, email, and password.

### Frontend
- **Dashboard**: Populates participant details for event cards.
- **Event View**: Uses `userId` for identifying the current user and checking ownership.
- **Navbar**: Added a link to the new Profile page.
- **Profile Page**: Created `/profile` page with a form to update user details.

## Verification
- **Backward Compatibility**: Added fallback logic to support existing events that still have `name` and `email` in the participants list.
- **Dynamic Updates**: Changing your name in the Profile page will now update your name in the Navbar and in the participant list of any event you have joined (for new joins or migrated data).

## Next Steps
- Users can now click on their name in the Navbar to edit their profile.
- New event joins will use the new data structure.

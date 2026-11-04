# Auth Manual Test Checklist

## Pre-setup

- [ ] Confirm `VITE_CONVEX_URL` points to the target environment.
- [ ] Confirm `SITE_URL` and `BETTER_AUTH_SECRET` are set on the Convex deployment (`bunx convex env list`).
- [ ] Note whether `AUTH_REQUIRE_EMAIL_VERIFICATION` is set. It is off by default, and the app has no email sender configured.
- [ ] Use a clean browser profile (no cached sessions).

## Registration

- [ ] Sign up with valid email + strong password (meets policy).
- [ ] Reject invalid email format.
- [ ] Reject weak password (too short).
- [ ] Reject password mismatch (confirm field).

## Login

- [ ] Login with valid email + password.
- [ ] Reject wrong password with correct email.
- [ ] Reject unknown email.
- [ ] Verify error message is user-friendly and not revealing.

## Session & Logout

- [ ] Refresh page after login; session persists.
- [ ] Close/reopen tab; session persists.
- [ ] Logout; protected pages redirect to login.
- [ ] Back button after logout does not show protected content.

## Organization & Onboarding

- [ ] First-time user is prompted to create/select org.
- [ ] Create org with valid name.
- [ ] Reject empty org name.
- [ ] Switch org (if multiple) and confirm data scope updates.

## Permissions

- [ ] Owner can manage org settings.
- [ ] Member cannot access owner-only settings.

## Invitations

Invites are links. The app sends no email.

- [ ] Create an invite link from an owner account (Settings > Members).
- [ ] Accept invite as new user.
- [ ] Existing user accepts invite and sees org in switcher.
- [ ] Invalid/expired invite token shows correct error.

## Password Management

Password change is not implemented yet. The Security settings tab shows a "not implemented" message.

- [ ] Confirm the Security tab shows the expected message and does not crash.

## Error/Edge Cases

- [ ] Network offline during login shows graceful error.
- [ ] Multiple rapid login attempts do not break UI.
- [ ] Auth state sync does not briefly show onboarding for existing orgs.

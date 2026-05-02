# E2E Test Checklist

## Team Members Needed
- M1 (You): Running backend server
- M2: Has dashboard open
- M3: Has VS Code extension loaded

---

## The Full Flow

### Step 1 — Create Session
- [ ] M1 starts backend server (`node server.js`)
- [ ] M3 opens VS Code, clicks "Start Debug Session"
- [ ] Server returns a Session ID (e.g., "XYZ-789")
- **Expected:** Session appears in M2's dashboard

### Step 2 — Join Session
- [ ] M2 enters Session ID "XYZ-789" in dashboard
- [ ] M3 (second user) joins via extension
- **Expected:** Both users visible in dashboard

### Step 3 — Set a Breakpoint
- [ ] M3 clicks line 42 in VS Code to set breakpoint
- **Expected:** M2's dashboard shows "Breakpoint at line 42 — app.js"

### Step 4 — Variable State
- [ ] Code hits the breakpoint during execution
- [ ] Variable values are sent to server
- **Expected:** M2's dashboard shows variable names and values

### Step 5 — User Disconnect
- [ ] M3 closes VS Code / kills connection
- **Expected:** M2's dashboard shows "User disconnected"
- **Expected:** Server's member list no longer has M3

---

## Edge Cases

| Scenario | Expected |
|----------|----------|
| Two users set breakpoint on same line | Both shown, no crash |
| Wrong Session ID entered | Error message shown |
| Server restarts mid-session | Clients show "Connection lost", can rejoin |
| 5 users in one session | All receive all broadcasts |
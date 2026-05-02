# Test Results — Day 2
**Tester:** [Rohith Pillendla]  
**Date:** [2-5-2026]  
**Server:** localhost:3000

---

## WebSocket & API Tests

| # | Test Name | Expected | Actual | Status |
|---|-----------|----------|--------|--------|
| 1 | POST /session/create | 200 + sessionId | 200 + "abc123" | ✅ PASS |
| 2 | POST /session/join (valid) | 200 + success | 200 + success | ✅ PASS |
| 3 | POST /session/join (invalid ID) | 404 error | 404 error | ✅ PASS |
| 4 | WS Client 1 connects | Connection opens | Connected | ✅ PASS |
| 5 | WS Client 2 connects | Connection opens | Connected | ✅ PASS |
| 6 | Broadcast to Client 1 | Receives line:42 | line:42 received | ✅ PASS |
| 7 | Broadcast to Client 2 | Receives line:42 | line:42 received | ✅ PASS |
| 8 | Disconnect cleanup | Alice removed from session | Alice not in members list | ✅ PASS |

---

## Notes
- All core WebSocket broadcast scenarios pass
- Disconnect cleanup confirmed via /session/:id/members endpoint
- No crashes observed during testing
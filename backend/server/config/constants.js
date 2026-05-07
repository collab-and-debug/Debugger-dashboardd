/**
 * WebSocket message types
 */
const MESSAGE_TYPES = {
  CREATE_SESSION: "CREATE_SESSION",
  JOIN_SESSION: "JOIN_SESSION",
  LEAVE_SESSION: "LEAVE_SESSION",
  MESSAGE: "MESSAGE",
  SESSION_ENDED: "SESSION_ENDED",
  ERROR: "ERROR"
};

/**
 * User roles inside a session
 */
const ROLES = {
  HOST: "host",
  CLIENT: "client"
};

/**
 * WebSocket ready states (from ws library)
 */
const WS_STATUS = {
  OPEN: 1,
  CLOSED: 3
};

/**
 * Server configuration
 */
const SERVER_CONFIG = {
  PORT: process.env.PORT || 3000,
  HEARTBEAT_INTERVAL: 30000, // 30s
  MAX_PAYLOAD_SIZE: 1024 * 50 // 50KB
};

/**
 * Error messages (centralized for consistency)
 */
const ERROR_MESSAGES = {
  SESSION_NOT_FOUND: "Session does not exist",
  SESSION_ALREADY_EXISTS: "Session already exists",
  INVALID_PAYLOAD: "Invalid message payload",
  UNAUTHORIZED: "Unauthorized action"
};

/**
 * Event names (internal use)
 */
const EVENTS = {
  DISCONNECT: "disconnect",
  CONNECT: "connect",
  MESSAGE: "message"
};

module.exports = {
  MESSAGE_TYPES,
  ROLES,
  WS_STATUS,
  SERVER_CONFIG,
  ERROR_MESSAGES,
  EVENTS
};

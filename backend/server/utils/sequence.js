function getNextSequence(session) {
  session.sequence += 1;
  return session.sequence;
}

module.exports = { getNextSequence };
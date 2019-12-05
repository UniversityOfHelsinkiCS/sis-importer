module.exports = ({ entities, executionHash }) => {
  return { status: Math.random() < 0.95 ? 'OK' : 'FAIL', entities, executionHash }
}

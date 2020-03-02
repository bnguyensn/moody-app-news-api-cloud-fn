exports.getDateStrFromDate = date => {
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();

  const dPrefixed = d < 10 ? `0${d}` : d;
  const mPrefixed = m < 10 ? `0${m}` : m;

  return `${y}-${mPrefixed}-${dPrefixed}`;
};

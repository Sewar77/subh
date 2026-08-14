export const moneyToMinorUnits = (value) => {
  const match = String(value).match(/^(\d+)(?:\.(\d{1,2}))?$/);
  if (!match) throw new Error("Invalid money value");
  return BigInt(match[1]) * 100n + BigInt((match[2] || "").padEnd(2, "0"));
};

export const minorUnitsToMoney = (value) => {
  const units = value / 100n;
  const fraction = String(value % 100n).padStart(2, "0");
  return `${units}.${fraction}`;
};

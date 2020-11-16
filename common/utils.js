export const toHourFormat = (value) => `${Math.floor(value / 60) % 24}:${(value % 60).toString().padStart(2, "0")}`;

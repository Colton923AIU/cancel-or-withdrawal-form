const formatToCustomISOString = (date: Date) => {
  const isoString = date.toISOString(); // Generates: "2025-01-31T06:00:00.000Z"
  const [datePart, timePart] = isoString.split("T");
  const [time] = timePart.split(".");
  const fractionalSeconds = (date.getMilliseconds() * 1000).toString();

  // Manually ensure 7 digits for fractional seconds
  const fullFractionalSeconds =
    fractionalSeconds + "0000000".slice(fractionalSeconds.length);

  return `${datePart}T${time}.${fullFractionalSeconds}Z`;
};

export default formatToCustomISOString;

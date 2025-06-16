export function formatThousands(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatTime(milliseconds) {
  const seconds = milliseconds / 1000;

  if (seconds < 60) {
    return `${seconds.toFixed(2)} sec`;
  } else {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(2);
    return `${minutes} min ${remainingSeconds} sec`;
  }
}

function createProgressBar(current, total, size = 20) {
  const percentage = current / total;
  const progress = Math.round(size * percentage);
  const emptyProgress = size - progress;

  const progressText = '▇'.repeat(progress);
  const emptyProgressText = '—'.repeat(emptyProgress);
  const percentageText = Math.round(percentage * 100) + '%';

  return {
    bar: progressText + emptyProgressText,
    percentage: percentageText
  };
}

module.exports = { createProgressBar };
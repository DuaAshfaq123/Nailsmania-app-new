/**
 * Flattens gallery items into single FlatList rows (image pairs + ad breaks).
 * One row per list item enables reliable virtualization and scroll metrics.
 */
export const buildGalleryRows = (items, adEveryItemCount) => {
  if (!items?.length) {
    return [];
  }

  const rows = [];

  for (let i = 0; i < items.length; i += 2) {
    const left = items[i];
    const right = items[i + 1] ?? null;

    rows.push({
      key: `row_${left.id}${right ? `_${right.id}` : ''}`,
      type: 'row',
      left,
      right,
      startIndex: i,
    });

    const coveredCount = i + (right ? 2 : 1);
    if (
      adEveryItemCount > 0 &&
      coveredCount % adEveryItemCount === 0 &&
      coveredCount < items.length
    ) {
      rows.push({
        key: `ad_${coveredCount}`,
        type: 'ad',
      });
    }
  }

  return rows;
};

export const getGalleryRowHeight = (row, rowMarginBottom = 0) => {
  if (row.type === 'ad') {
    return 72 + rowMarginBottom;
  }

  const leftHeight = row.left?.height ?? 0;
  const rightHeight = row.right?.height ?? 0;

  return Math.max(leftHeight, rightHeight) + rowMarginBottom;
};

export const createGalleryGetItemLayout = (rows, rowMarginBottom = 0) => {
  const offsets = [];
  let runningOffset = 0;

  rows.forEach((row, index) => {
    offsets[index] = runningOffset;
    runningOffset += getGalleryRowHeight(row, rowMarginBottom);
  });

  return (data, index) => {
    const row = data[index];
    const length = getGalleryRowHeight(row, rowMarginBottom);

    return {
      length,
      offset: offsets[index] ?? 0,
      index,
    };
  };
};

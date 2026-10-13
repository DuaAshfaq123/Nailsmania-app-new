// Keeps existing item column assignments when paginating so pins do not remount.
export const assignMasonryColumns = (items, getItemKey, previousCache = new Map()) => {
  const columnByKey = new Map();
  const leftColumn = [];
  const rightColumn = [];
  let leftHeight = 0;
  let rightHeight = 0;

  items.forEach(item => {
    const key = getItemKey(item);
    let side = previousCache.get(key);

    if (!side) {
      side = leftHeight <= rightHeight ? 'left' : 'right';
    }

    columnByKey.set(key, side);

    if (side === 'left') {
      leftColumn.push(item);
      leftHeight += item.height;
    } else {
      rightColumn.push(item);
      rightHeight += item.height;
    }
  });

  return {leftColumn, rightColumn, columnByKey};
};

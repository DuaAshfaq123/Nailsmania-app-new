export const filterCategoriesByQuery = (categories, query) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return categories;
  }

  return categories.filter(category => {
    if (typeof category === 'string') {
      return category.toLowerCase().includes(normalized);
    }
    const id = (category.id || '').toLowerCase();
    const label = (category.label || '').toLowerCase();
    return id.includes(normalized) || label.includes(normalized);
  });
};

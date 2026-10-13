import i18n from '../i18n';
import {LANGUAGE_OPTIONS} from '../i18n/languages';

const ALL_CHIP = 'All';

const bundledName = englishName =>
  i18n.t(`home:categoryNames.${englishName}`, {defaultValue: englishName});

const bundledDescription = (englishName, englishDescription) =>
  i18n.t(`home:categoryDescriptions.${englishName}`, {
    defaultValue:
      englishDescription || i18n.t('home:categoryDescriptionFallback'),
  });

export const localizeCategory = (category, language = i18n.language) => {
  const lang = (language || LANGUAGE_OPTIONS.EN).split('-')[0];
  const translations = category?.translations || {};
  const localeBlock = translations[lang] || {};

  const englishName = category?.name || category?.id || '';
  const englishDescription =
    category?.description || category?.shortDescription || '';

  if (lang === LANGUAGE_OPTIONS.EN || englishName === ALL_CHIP) {
    return {
      ...category,
      name: englishName,
      displayName:
        englishName === ALL_CHIP
          ? i18n.t('common:allChip', {defaultValue: 'All'})
          : englishName,
      description: englishDescription || bundledDescription(englishName, ''),
    };
  }

  return {
    ...category,
    name: englishName,
    displayName: localeBlock.name?.trim() || bundledName(englishName),
    description:
      localeBlock.shortDescription?.trim() ||
      bundledDescription(englishName, englishDescription),
  };
};

export const localizeCategories = (categories, language) =>
  (categories || []).map(category => localizeCategory(category, language));

export const buildLocalizedFilterChips = (categories, language) => {
  const all = localizeCategory({name: ALL_CHIP, id: ALL_CHIP}, language);
  return [
    {id: ALL_CHIP, label: all.displayName},
    ...localizeCategories(categories, language).map(category => ({
      id: category.name,
      label: category.displayName,
    })),
  ];
};

export {ALL_CHIP};

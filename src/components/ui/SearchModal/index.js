import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Animated,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import EncryptedStorage from 'react-native-encrypted-storage';
import {useTranslation} from 'react-i18next';
import {Icons} from '../../../constants';
import useThemedStyles from '../../../hooks/useThemedStyles';
import {useTheme} from '../../../theme/ThemeContext';
import {filterCategoriesByQuery} from '../../../utils/searchFilters';
import {debugError} from '../../../utils/debugLog';
import AnimatedPressable from '../AnimatedPressable';
import GlassSurface from '../GlassSurface';
import {createStyles} from './styles';

const RECENT_SEARCHES_KEY = 'recent_searches';
const MAX_RECENT = 6;

const SearchModal = ({
  visible,
  onClose,
  categories,
  trendingSearches = [],
  onCategorySelect,
}) => {
  const {theme} = useTheme();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const {t} = useTranslation('common');
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef(null);

  const filteredCategories = filterCategoriesByQuery(categories, query);

  const loadRecentSearches = useCallback(async () => {
    try {
      const stored = await EncryptedStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      debugError('SearchModal', 'Failed to load recent searches', error);
    }
  }, []);

  // Stores the English category ID, never the label shown on the chip.
  //
  // Recent searches store the stable local catalog category id, never its translated label.
  // Storing the label instead meant that in Urdu or Arabic the app persisted a translated
  // name and then tried to navigate to a category by that name, which matched nothing. It
  // also means the list re-labels itself correctly when the language changes, rather than
  // stranding entries in whichever language they were tapped in.
  const saveRecentSearch = useCallback(
    async id => {
      const trimmed = String(id || '').trim();
      if (!trimmed) {
        return;
      }
      try {
        const next = [
          trimmed,
          ...recentSearches.filter(item => item !== trimmed),
        ].slice(0, MAX_RECENT);
        setRecentSearches(next);
        await EncryptedStorage.setItem(
          RECENT_SEARCHES_KEY,
          JSON.stringify(next),
        );
      } catch (error) {
        debugError('SearchModal', 'Failed to save recent search', error);
      }
    },
    [recentSearches],
  );

  // Removing one entry and clearing the lot both write the whole array back, which keeps
  // storage and state in step with a single code path.
  const persistRecentSearches = useCallback(async next => {
    setRecentSearches(next);
    try {
      await EncryptedStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
    } catch (error) {
      debugError('SearchModal', 'Failed to persist recent searches', error);
    }
  }, []);

  const removeRecentSearch = useCallback(
    term => persistRecentSearches(recentSearches.filter(item => item !== term)),
    [persistRecentSearches, recentSearches],
  );

  const clearRecentSearches = useCallback(
    () => persistRecentSearches([]),
    [persistRecentSearches],
  );

  useEffect(() => {
    if (visible) {
      setQuery('');
      loadRecentSearches();
      Animated.spring(slideAnim, {
        toValue: 1,
        ...theme.motion.spring.sheet,
        useNativeDriver: true,
      }).start();
      const focusTimer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(focusTimer);
    }
    slideAnim.setValue(0);
    return undefined;
  }, [visible, slideAnim, loadRecentSearches, theme.motion.spring.sheet]);

  const handleClose = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: theme.motion.duration.fast,
      useNativeDriver: true,
    }).start(({finished}) => {
      if (finished) {
        onClose();
      }
    });
  }, [onClose, slideAnim, theme.motion.duration.fast]);

  const handleSelect = useCallback(
    chip => {
      const id = typeof chip === 'string' ? chip : chip.id;
      saveRecentSearch(id);
      onCategorySelect(id);
      handleClose();
    },
    [handleClose, onCategorySelect, saveRecentSearch],
  );

  // Recent entries are IDs, so their display text is resolved against the live catalog
  // every render — that is what makes them follow the selected language. An ID with no
  // matching category (removed since it was saved, or written by an older build) falls
  // back to showing itself rather than disappearing.
  const recentLabelFor = useCallback(
    id => categories?.find(chip => chip.id === id)?.label || id,
    [categories],
  );

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.spacing.xxl + theme.spacing.md, 0],
  });

  const opacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const renderCategoryItem = useCallback(
    item => {
      const chip = typeof item === 'string' ? {id: item, label: item} : item;
      return (
        <AnimatedPressable
          key={chip.id}
          onPress={() => handleSelect(chip)}
          style={styles.categoryCell}>
          <Icons.Ionicons
            name="grid-outline"
            size={18}
            color={theme.colors.accent.gold}
          />
          <Text style={styles.categoryCellText} numberOfLines={1}>
            {chip.label}
          </Text>
        </AnimatedPressable>
      );
    },
    [handleSelect, styles, theme.colors.accent.gold],
  );

  const showSuggestions = query.trim().length === 0;

  // Same bottom-inset formula the scrolling content screens use (About Us, Privacy,
  // Terms), so the last row clears the Android navigation bar / iOS home indicator by
  // exactly as much as it does everywhere else — no more, no less.
  const scrollBottomInset =
    Math.max(insets.bottom, theme.spacing.sm) + theme.spacing.lg;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.sheet,
            {
              paddingTop: insets.top + theme.spacing.xs,
              opacity,
              transform: [{translateY}],
            },
          ]}>
          <View style={styles.searchRow}>
            <GlassSurface
              style={styles.inputGlass}
              borderRadius={theme.radius.lg}
              blurAmount={22}
              shadow="card"
              contentStyle={styles.inputContainer}>
              <View style={styles.iconCircle}>
                <Icons.Ionicons
                  name="search-outline"
                  size={17}
                  color={theme.colors.accent.terracotta}
                />
              </View>
             
              {query.length > 0 ? (
                <TouchableOpacity
                  onPress={() => setQuery('')}
                  style={styles.clearButton}
                  hitSlop={theme.spacing.xs}>
                  <Icons.Ionicons
                    name="close-circle"
                    size={18}
                    color={theme.colors.text.tertiary}
                  />
                </TouchableOpacity>
              ) : null}
            </GlassSurface>
            <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
              <Text style={styles.cancelText}>{t('common:cancel')}</Text>
            </TouchableOpacity>
          </View>

          {/*
            One scroll container for everything below the search field: recent searches,
            trending, the category grid and the empty state. Previously only the category
            FlatList scrolled, so the suggestion blocks above it were fixed and squeezed
            the grid into a sliver once the keyboard was up.

            keyboardShouldPersistTaps="handled" is what dismisses the keyboard on a tap
            outside the field: a tap the children handle (a chip, a category cell, Clear
            all) runs its own press and leaves the keyboard alone, while a tap that lands
            on empty content is not handled and closes it. contentContainerStyle grows to
            fill the sheet so that blank area below the last row still belongs to the
            scroll view and dismisses too.

            No nested scrollables: the category grid is a plain wrapping View, not a
            FlatList. The catalogue is a dozen-odd categories, so virtualisation bought
            nothing here anyway.
          */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              {paddingBottom: scrollBottomInset},
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag">
            {showSuggestions ? (
              <>
                {recentSearches.length > 0 ? (
                  <>
                    <View style={styles.sectionLabelRow}>
                      <Text style={styles.sectionLabel}>
                        {t('common:searchRecentLabel')}
                      </Text>
                      <TouchableOpacity
                        onPress={clearRecentSearches}
                        hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                        accessibilityRole="button">
                        <Text style={styles.clearAllText}>
                          {t('common:searchClearAll')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.chipWrap}>
                      {recentSearches.map(item => (
                        <View key={`recent_${item}`} style={styles.recentChip}>
                          <TouchableOpacity
                            onPress={() => handleSelect(item)}
                            style={styles.recentChipLabelHit}>
                            <Text
                              style={styles.suggestionChipText}
                              numberOfLines={1}>
                              {recentLabelFor(item)}
                            </Text>
                          </TouchableOpacity>
                          {/* Separate hit target so tapping the chip searches and tapping
                              the cross removes, without the two overlapping. */}
                          <TouchableOpacity
                            onPress={() => removeRecentSearch(item)}
                            hitSlop={{top: 8, bottom: 8, left: 4, right: 8}}
                            accessibilityRole="button"
                            accessibilityLabel={t('common:searchRemoveRecent', {
                              term: recentLabelFor(item),
                            })}>
                            <Icons.Ionicons
                              name="close"
                              size={14}
                              color={theme.colors.text.tertiary}
                              style={styles.recentChipRemove}
                            />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </>
                ) : null}
                {trendingSearches.length > 0 ? (
                  <>
                    <Text style={styles.sectionLabel}>
                      {t('common:searchTrendingLabel')}
                    </Text>
                    <View style={styles.chipWrap}>
                      {trendingSearches.map(item => (
                        <TouchableOpacity
                          key={`trending_${item.id}`}
                          style={styles.trendingChip}
                          onPress={() => handleSelect(item)}>
                          <Icons.Ionicons
                            name="trending-up"
                            size={13}
                            color={theme.colors.accent.gold}
                          />
                          <Text style={styles.trendingChipText}>
                            {item.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                ) : null}
              </>
            ) : null}

            <Text style={styles.sectionLabel}>
              {t('common:searchCategoriesLabel')}
            </Text>
            {filteredCategories.length > 0 ? (
              <View style={styles.categoryGrid}>
                {filteredCategories.map(renderCategoryItem)}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconWrap}>
                  <Icons.Ionicons
                    name="search-outline"
                    size={24}
                    color={theme.colors.accent.gold}
                  />
                </View>
                <Text style={styles.emptyTitle}>
                  {t('common:searchNoResultsTitle')}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {t('common:searchNoResultsSubtitle')}
                </Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default SearchModal;

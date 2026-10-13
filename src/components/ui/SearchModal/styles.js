import {Platform, StyleSheet} from 'react-native';
import {Layout} from '../../../theme/spacing';
import {screenWidth} from '../../../utils/responsive';

const CATEGORY_COLUMN_GAP = 12;
// Two even columns inside the list's horizontal padding.
const categoryCellWidth = Math.floor(
  (screenWidth - Layout.screenPadding * 2 - CATEGORY_COLUMN_GAP) / 2,
);

export const createStyles = theme =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.colors.overlay.scrim,
    },
    sheet: {
      flex: 1,
      backgroundColor: theme.colors.bg.base,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.layout.screenPadding,
      marginBottom: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    inputGlass: {
      flex: 1,
      minWidth: 0,
      backgroundColor: theme.colors.bg.surface,
    },
    inputContainer: {
      minHeight: theme.spacing.xxl + theme.spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    iconCircle: {
      width: theme.spacing.xl + theme.spacing.xs,
      height: theme.spacing.xl + theme.spacing.xs,
      borderRadius: theme.radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.accent.primaryMuted,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border.gold,
    },
    input: {
      flex: 1,
      // Compact size so the placeholder fits without clipping on small screens, where
      // the field shares its row with the Cancel action.
      ...theme.text.inputCompact,
      color: theme.colors.text.primary,
      paddingVertical: Platform.OS === 'android' ? theme.spacing.xxs : 0,
      margin: 0,
      minHeight: theme.spacing.xl,
      ...(Platform.OS === 'android' ? {includeFontPadding: false} : null),
    },
    clearButton: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButton: {
      minHeight: theme.spacing.xxl + theme.spacing.sm,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.xs,
    },
    cancelText: {
      ...theme.text.button,
      color: theme.colors.accent.gold,
    },
    sectionLabel: {
      ...theme.text.label,
      color: theme.colors.text.tertiary,
      paddingHorizontal: theme.layout.screenPadding,
      marginBottom: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },
    chipWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: theme.layout.screenPadding,
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.md,
    },
    suggestionChip: {
      backgroundColor: theme.colors.bg.muted,
      borderRadius: theme.radius.pill,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs + 2,
    },
    suggestionChipText: {
      ...theme.text.button,
      color: theme.colors.text.primary,
    },
    trendingChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xxs,
      backgroundColor: theme.colors.accent.primaryMuted,
      borderRadius: theme.radius.pill,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs + 2,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border.gold,
    },
    trendingChipText: {
      ...theme.text.button,
      color: theme.colors.text.gold,
    },
    // Two-column grid: a single column left most of the row empty and made the list
    // much longer than it needed to be. Laid out by wrapping rather than by a FlatList
    // so it can live inside the screen's one scroll view — categoryCell carries a fixed
    // width, so two cells and one column gap fill the padded row exactly.
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: theme.layout.screenPadding,
      columnGap: CATEGORY_COLUMN_GAP,
    },
    categoryCell: {
      width: categoryCellWidth,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      backgroundColor: theme.colors.bg.muted,
      borderRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    categoryCellText: {
      ...theme.text.button,
      color: theme.colors.text.primary,
      flexShrink: 1,
    },
    // Recent-search chip: label and remove control are separate hit targets.
    recentChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.bg.muted,
      borderRadius: theme.radius.pill,
      paddingLeft: theme.spacing.md,
      paddingRight: theme.spacing.sm,
      paddingVertical: theme.spacing.xs + 2,
      maxWidth: '100%',
    },
    recentChipLabelHit: {
      flexShrink: 1,
    },
    recentChipRemove: {
      marginLeft: theme.spacing.xs,
    },
    sectionLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingRight: theme.layout.screenPadding,
    },
    clearAllText: {
      ...theme.text.button,
      color: theme.colors.accent.primary,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    scrollView: {
      flex: 1,
    },
    // flexGrow (not flex) so short content still lets the container fill the sheet: the
    // blank area under the last row stays part of the scroll view, which is what makes a
    // tap there dismiss the keyboard. The bottom inset is applied at the call site.
    scrollContent: {
      flexGrow: 1,
    },
    resultItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      marginBottom: theme.spacing.xs,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.bg.muted,
    },
    resultText: {
      marginLeft: theme.spacing.sm,
      ...theme.text.body,
      color: theme.colors.text.primary,
      flex: 1,
    },
    emptyState: {
      alignItems: 'center',
      paddingTop: theme.spacing.xxl,
      paddingHorizontal: theme.spacing.xl,
    },
    emptyIconWrap: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: theme.colors.accent.primaryMuted,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border.gold,
    },
    emptyTitle: {
      ...theme.text.h3,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    emptySubtitle: {
      ...theme.text.caption,
      color: theme.colors.text.secondary,
      textAlign: 'center',
    },
  });

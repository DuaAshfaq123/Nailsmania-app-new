import {StyleSheet} from 'react-native';

const THUMBNAIL_SIZE = 72;

export const createStyles = theme =>
  StyleSheet.create({
    content: {
      paddingBottom: theme.layout.tabBarClearance,
    },
    sourceGroup: {
      paddingHorizontal: theme.layout.screenPadding,
      marginBottom: theme.spacing.lg,
    },
    sourceCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.bg.muted,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    sourceCardIcon: {
      width: 52,
      height: 52,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.accent.primaryMuted,
      marginRight: theme.spacing.md,
    },
    sourceCardLabel: {
      ...theme.text.body,
      color: theme.colors.text.primary,
      flex: 1,
    },
    editorCard: {
      marginHorizontal: theme.layout.screenPadding,
      marginBottom: theme.spacing.xl,
      padding: theme.spacing.md,
      borderRadius: theme.radius.xl,
      backgroundColor: theme.colors.bg.surface,
      ...theme.shadows.card,
    },
    previewImage: {
      width: '100%',
      aspectRatio: 0.84,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.bg.muted,
    },
    categoryLabel: {
      ...theme.text.title,
      color: theme.colors.text.primary,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    categoryChip: {
      maxWidth: '48%',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.bg.muted,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border.hairline,
    },
    categoryChipSelected: {
      backgroundColor: theme.colors.accent.primaryMuted,
      borderColor: theme.colors.accent.primary,
    },
    categoryChipText: {
      ...theme.text.button,
      color: theme.colors.text.secondary,
    },
    categoryChipTextSelected: {
      color: theme.colors.accent.primary,
    },
    editorActions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.lg,
    },
    editorAction: {
      flex: 1,
    },
    loader: {
      marginVertical: theme.spacing.xl,
    },
    designList: {
      marginHorizontal: theme.layout.screenPadding,
      borderRadius: theme.radius.lg,
      overflow: 'hidden',
      backgroundColor: theme.colors.bg.surface,
    },
    designRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.sm,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border.hairline,
    },
    designThumbnail: {
      width: THUMBNAIL_SIZE,
      height: THUMBNAIL_SIZE,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.bg.muted,
    },
    designInfo: {
      flex: 1,
      marginHorizontal: theme.spacing.md,
    },
    designCategory: {
      ...theme.text.title,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xxs,
    },
    designDate: {
      ...theme.text.caption,
      color: theme.colors.text.secondary,
    },
    deleteButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.pill,
    },
  });

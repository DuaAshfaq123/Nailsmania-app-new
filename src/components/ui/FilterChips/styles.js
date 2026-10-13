import {StyleSheet} from 'react-native';

export const createStyles = theme =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.sm,
      marginHorizontal: -theme.layout.screenPadding,
    },
    listContent: {
      paddingLeft: theme.layout.screenPadding,
      paddingRight: theme.layout.screenPadding,
      gap: theme.spacing.sm,
    },
    chip: {
      borderRadius: theme.radius.pill,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderWidth: StyleSheet.hairlineWidth,
    },
    chipDefault: {
      backgroundColor: theme.colors.bg.surface,
      borderColor: theme.colors.border.hairline,
    },
    chipSelected: {
      backgroundColor: theme.colors.accent.terracotta,
      borderColor: theme.colors.accent.terracotta,
    },
    chipLabel: {
      ...theme.text.button,
    },
    chipLabelDefault: {
      color: theme.colors.text.secondary,
    },
    chipLabelSelected: {
      color: theme.colors.text.inverse,
    },
  });

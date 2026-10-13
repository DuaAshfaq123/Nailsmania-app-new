import {StyleSheet} from 'react-native';

export const createStyles = theme =>
  StyleSheet.create({
    wrapper: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: theme.layout.screenPadding,
      backgroundColor: 'transparent',
    },
    bottomScrim: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.isDark
        ? 'rgba(18, 16, 15, 0.92)'
        : 'rgba(248, 245, 241, 0.94)',
    },
    container: {
      width: '100%',
      alignSelf: 'center',
      backgroundColor: theme.colors.bg.surface,
    },
    inner: {
      flexDirection: 'row',
      padding: theme.spacing.xxs,
      position: 'relative',
    },
    activeIndicator: {
      position: 'absolute',
      top: theme.spacing.xxs,
      bottom: theme.spacing.xxs,
      // Logical, not physical: this parks the pill under the FIRST tab, which is the
      // right-hand one in Urdu/Arabic. Its slide is mirrored to match (see index.js).
      start: theme.spacing.xxs,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.accent.primaryMuted,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border.gold,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm + 2,
      zIndex: 1,
    },
    // Every tab label shares one style so all three destinations stay consistent.
    label: {
      marginTop: 4,
      ...theme.text.navLabel,
    },
    labelActive: {
      color: theme.colors.accent.terracotta,
    },
    labelInactive: {
      color: theme.colors.text.secondary,
    },
  });

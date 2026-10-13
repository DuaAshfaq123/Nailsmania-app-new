import {StyleSheet} from 'react-native';

const buttonSize = theme => theme.spacing.xl + theme.spacing.xs;

export const createStyles = theme =>
  StyleSheet.create({
    // Anchored to the image's top-right corner, the position users expect from
    // Pinterest/Instagram. These values are the single definition of the save control's
    // geometry — the masonry pins and the trending cards both render this component, so
    // the affordance cannot drift between screens.
    button: {
      position: 'absolute',
      top: theme.spacing.xs,
      right: theme.spacing.xs,
      width: buttonSize(theme),
      height: buttonSize(theme),
      borderRadius: buttonSize(theme) / 2,
      // Scrim so the glyph stays legible over both light and dark artwork, in either theme.
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 4,
    },
  });

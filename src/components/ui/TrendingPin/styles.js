import {StyleSheet} from 'react-native';
import {Layout} from '../../../theme/spacing';

export const TRENDING_CARD_WIDTH = Layout.trendingCardWidth;
export const TRENDING_CARD_HEIGHT = Layout.trendingCardHeight;

export const createStyles = theme =>
  StyleSheet.create({
    wrapper: {
      width: TRENDING_CARD_WIDTH,
      marginRight: theme.spacing.md,
    },
    categoryName: {
      ...theme.text.cardMeta,
      color: theme.colors.text.primary,
      textTransform: 'uppercase',
      marginBottom: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xxs,
    },
    // Same card, stacked down a column instead of scrolled along a row: the fixed carousel
    // width and its right-hand gutter give way to the container's width and a vertical
    // gutter. Radius, height, label typography and image treatment are untouched, which is
    // the point — Home's collection cards and the Trending pins cannot drift apart.
    wrapperFullWidth: {
      width: '100%',
      marginRight: 0,
      marginBottom: theme.spacing.lg,
    },
    pressable: {
      width: '100%',
    },
    imageCard: {
      width: TRENDING_CARD_WIDTH,
      height: TRENDING_CARD_HEIGHT,
      borderRadius: theme.radius.xl,
      overflow: 'hidden',
      backgroundColor: theme.colors.skeleton.base,
    },
    imageCardFullWidth: {
      width: '100%',
    },
    image: {
      width: '100%',
      height: '100%',
    },
  });

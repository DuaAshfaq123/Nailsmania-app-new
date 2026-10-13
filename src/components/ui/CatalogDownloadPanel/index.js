import React from 'react';
import {ActivityIndicator, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import useThemedStyles from '../../../hooks/useThemedStyles';
import {useTheme} from '../../../theme/ThemeContext';
import {confirmMeteredCatalogDownload} from '../../../services/catalog/catalogBridge';
import PrimaryButton from '../PrimaryButton';
import {createStyles} from './styles';

const copyForStatus = (packName, status, t) => {
  const isFull = packName === 'full';

  switch (status) {
    case 'waitingForWifi':
    case 'needsConfirmation':
      return {
        title: t('catalogDownloadCellularTitle'),
        body: t('catalogDownloadCellularBody'),
      };
    case 'failed':
    case 'canceled':
      return {
        title: t('catalogDownloadFailedTitle'),
        body: t('catalogDownloadFailedBody'),
      };
    case 'transferring':
      return {
        title: t('catalogDownloadPreparing'),
        body: isFull
          ? t('catalogDownloadFullBody')
          : t('catalogDownloadThumbsBody'),
      };
    default:
      return {
        title: isFull
          ? t('catalogDownloadFullTitle')
          : t('catalogDownloadThumbsTitle'),
        body: isFull
          ? t('catalogDownloadFullBody')
          : t('catalogDownloadThumbsBody'),
      };
  }
};

const CatalogDownloadPanel = ({
  packName = 'thumbs',
  status,
  fraction = 0,
  compact = false,
  onRetry,
}) => {
  const {theme} = useTheme();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation('home');
  const copy = copyForStatus(packName, status, t);
  const isFailed = status === 'failed' || status === 'canceled';
  const needsApproval =
    status === 'waitingForWifi' || status === 'needsConfirmation';
  const percent = Math.round(Math.min(1, Math.max(0, fraction)) * 100);
  const showBar = !isFailed && !needsApproval;

  return (
    <View
      style={[styles.card, compact && styles.cardCompact]}
      accessibilityRole="progressbar"
      accessibilityLabel={copy.title}
      accessibilityValue={{now: percent, min: 0, max: 100}}>
      {!compact ? (
        <ActivityIndicator
          color={theme.colors.accent.terracotta}
          style={styles.spinner}
        />
      ) : null}
      <Text style={styles.title}>{copy.title}</Text>
      <Text style={styles.body}>{copy.body}</Text>
      {showBar ? (
        <View style={styles.track}>
          <View style={[styles.fill, {width: `${percent}%`}]} />
        </View>
      ) : null}
      {showBar ? (
        <Text style={styles.percent}>
          {t('catalogDownloadPercent', {percent})}
        </Text>
      ) : null}
      {needsApproval ? (
        <PrimaryButton
          label={t('catalogDownloadUseData')}
          onPress={confirmMeteredCatalogDownload}
          style={styles.retry}
        />
      ) : null}
      {isFailed && onRetry ? (
        <PrimaryButton
          label={t('catalogDownloadRetry')}
          onPress={onRetry}
          style={styles.retry}
        />
      ) : null}
    </View>
  );
};

export default CatalogDownloadPanel;

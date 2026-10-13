import {useEffect, useState} from 'react';
import {subscribeCatalogPackProgress} from '../services/catalog/catalogBridge';

const ACTIVE_STATUSES = new Set([
  'pending',
  'downloading',
  'transferring',
  'waitingForWifi',
  'needsConfirmation',
  'notInstalled',
]);

const packFraction = pack => {
  if (!pack) {
    return 0;
  }
  if (typeof pack.fraction === 'number' && Number.isFinite(pack.fraction)) {
    return Math.min(1, Math.max(0, pack.fraction));
  }
  if (pack.totalBytes > 0) {
    return Math.min(1, pack.bytesDownloaded / pack.totalBytes);
  }
  return pack.status === 'completed' ? 1 : 0;
};

const useCatalogPackProgress = () => {
  const [packs, setPacks] = useState({});

  useEffect(() => {
    return subscribeCatalogPackProgress(event => {
      if (!event?.packName) {
        return;
      }
      setPacks(current => ({
        ...current,
        [event.packName]: event,
      }));
    });
  }, []);

  const thumbs = packs.thumbs;
  const full = packs.full;

  return {
    thumbs,
    full,
    thumbsActive: ACTIVE_STATUSES.has(thumbs?.status),
    fullActive: ACTIVE_STATUSES.has(full?.status),
    thumbsFailed: thumbs?.status === 'failed' || thumbs?.status === 'canceled',
    fullFailed: full?.status === 'failed' || full?.status === 'canceled',
    thumbsFraction: packFraction(thumbs),
    fullFraction: packFraction(full),
  };
};

export default useCatalogPackProgress;

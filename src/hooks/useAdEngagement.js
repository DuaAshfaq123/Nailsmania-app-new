import {useEffect, useState} from 'react';
import AdEngagementGate from '../services/admob/adEngagementGate';

const useAdEngagement = () => {
  const [canShowAds, setCanShowAds] = useState(() =>
    AdEngagementGate.canShowAds(),
  );

  useEffect(() => {
    setCanShowAds(AdEngagementGate.canShowAds());
    return AdEngagementGate.subscribe(setCanShowAds);
  }, []);

  return {
    canShowAds,
    recordEngagement: AdEngagementGate.recordEngagement.bind(AdEngagementGate),
  };
};

export default useAdEngagement;

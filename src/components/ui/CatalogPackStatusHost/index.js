import React from 'react';
import {View} from 'react-native';
import useCatalogPackProgress from '../../../hooks/useCatalogPackProgress';
import useThemedStyles from '../../../hooks/useThemedStyles';
import CatalogDownloadPanel from '../CatalogDownloadPanel';
import {createStyles} from './styles';


const CatalogPackStatusHost = () => {
  const styles = useThemedStyles(createStyles);
  const {full, fullActive, fullFailed, fullFraction} = useCatalogPackProgress();

  if (!fullActive && !fullFailed) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={styles.host}>
      <CatalogDownloadPanel
        packName="full"
        status={full?.status}
        fraction={fullFraction}
        compact
      />
    </View>
  );
};

export default CatalogPackStatusHost;

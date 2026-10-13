import React, {useMemo, useRef} from 'react';
import {View} from 'react-native';
import useThemedStyles from '../../../hooks/useThemedStyles';
import {assignMasonryColumns} from '../../../utils/masonry';
import {createStyles} from './styles';

const MasonryGrid = ({items, renderItem, keyExtractor}) => {
  const styles = useThemedStyles(createStyles);
  const columnCacheRef = useRef(new Map());
  const {leftColumn, rightColumn} = useMemo(() => {
    const {leftColumn: left, rightColumn: right, columnByKey} = assignMasonryColumns(
      items,
      item => keyExtractor(item),
      columnCacheRef.current,
    );
    columnCacheRef.current = columnByKey;
    return {leftColumn: left, rightColumn: right};
  }, [items, keyExtractor]);

  return (
    <View style={styles.container}>
      <View style={styles.column}>
        {leftColumn.map((item, index) => (
          <View key={keyExtractor(item, index * 2)}>
            {renderItem({item, index: index * 2})}
          </View>
        ))}
      </View>
      <View style={styles.column}>
        {rightColumn.map((item, index) => (
          <View key={keyExtractor(item, index * 2 + 1)}>
            {renderItem({item, index: index * 2 + 1})}
          </View>
        ))}
      </View>
    </View>
  );
};

export default MasonryGrid;

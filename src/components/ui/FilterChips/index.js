import React, {useCallback} from 'react';
import {FlatList, Text, TouchableOpacity, View} from 'react-native';
import useThemedStyles from '../../../hooks/useThemedStyles';
import {createStyles} from './styles';

const normalizeChip = chip =>
  typeof chip === 'string' ? {id: chip, label: chip} : chip;

const FilterChips = ({chips, selectedChip, onChipSelect}) => {
  const styles = useThemedStyles(createStyles);

  const renderItem = useCallback(
    ({item}) => {
      const chip = normalizeChip(item);
      const isSelected = chip.id === selectedChip;
      return (
        <TouchableOpacity
          onPress={() => onChipSelect(chip.id)}
          activeOpacity={0.8}
          style={[
            styles.chip,
            isSelected ? styles.chipSelected : styles.chipDefault,
          ]}>
          <Text
            style={[
              styles.chipLabel,
              isSelected ? styles.chipLabelSelected : styles.chipLabelDefault,
            ]}>
            {chip.label}
          </Text>
        </TouchableOpacity>
      );
    },
    [onChipSelect, selectedChip, styles],
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={chips}
        renderItem={renderItem}
        keyExtractor={item => normalizeChip(item).id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

export default FilterChips;

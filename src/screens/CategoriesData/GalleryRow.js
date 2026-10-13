import React, {memo} from 'react';
import {View} from 'react-native';
import {MasonryPin} from '../../components/ui';

const GalleryRow = memo(
  ({row, styles, startIndex, getPinProps}) => (
    <View style={styles.galleryRow}>
      <View style={styles.galleryColumn}>
        <MasonryPin {...getPinProps(row.left, startIndex)} />
      </View>
      <View style={styles.galleryColumn}>
        {row.right ? (
          <MasonryPin {...getPinProps(row.right, startIndex + 1)} />
        ) : (
          <View style={styles.galleryColumnSpacer} />
        )}
      </View>
    </View>
  ),
  // Rows are memoized aggressively to keep the gallery smooth while scrolling, but the
  // comparator must also watch getPinProps: it is rebuilt whenever the favourites list
  // changes, and comparing row.key alone meant a newly liked design kept rendering its
  // old (unfilled) heart until the row happened to unmount.
  (prev, next) =>
    prev.row.key === next.row.key && prev.getPinProps === next.getPinProps,
);

GalleryRow.displayName = 'GalleryRow';

export default GalleryRow;

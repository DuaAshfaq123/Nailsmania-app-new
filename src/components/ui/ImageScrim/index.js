import React, {useMemo} from 'react';
import {StyleSheet} from 'react-native';
import Svg, {Defs, LinearGradient, Rect, Stop} from 'react-native-svg';
import {useTheme} from '../../../theme/ThemeContext';

const ImageScrim = ({intensity = 'medium'}) => {
  const {colorScheme} = useTheme();
  const gradientId = useMemo(
    () => `imageScrim-${intensity}-${colorScheme}`,
    [colorScheme, intensity],
  );

  const stops = useMemo(() => {
    const isLight = colorScheme === 'light';
    const base = isLight ? '18, 14, 10' : '0, 0, 0';

    if (intensity === 'soft') {
      return [
        {offset: '0%', color: `rgba(${base}, 0)`},
        {offset: '58%', color: `rgba(${base}, 0)`},
        {offset: '82%', color: `rgba(${base}, ${isLight ? 0.22 : 0.28})`},
        {offset: '100%', color: `rgba(${base}, ${isLight ? 0.48 : 0.58})`},
      ];
    }

    return [
      {offset: '0%', color: `rgba(${base}, 0)`},
      {offset: '52%', color: `rgba(${base}, 0)`},
      {offset: '76%', color: `rgba(${base}, ${isLight ? 0.28 : 0.34})`},
      {offset: '100%', color: `rgba(${base}, ${isLight ? 0.58 : 0.68})`},
    ];
  }, [colorScheme, intensity]);

  return (
    <Svg
      style={styles.scrim}
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      pointerEvents="none">
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          {stops.map(stop => (
            <Stop
              key={stop.offset}
              offset={stop.offset}
              stopColor={stop.color}
            />
          ))}
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
    </Svg>
  );
};

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default ImageScrim;

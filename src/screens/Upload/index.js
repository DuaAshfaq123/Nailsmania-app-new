import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import FastImage from '@d11/react-native-fast-image';
import {useTranslation} from 'react-i18next';
import {
  EmptyState,
  PrimaryButton,
  ScreenContainer,
  ScreenHeader,
  SectionHeader,
} from '../../components/ui';
import {CATEGORY_NAMES, Icons} from '../../constants';
import useCategoryCatalog from '../../hooks/useCategoryCatalog';
import useConfirm from '../../hooks/useConfirm';
import useThemedStyles from '../../hooks/useThemedStyles';
import useToast from '../../hooks/useToast';
import {
  addCustomDesign,
  deleteCustomDesign,
  getCustomDesigns,
  subscribeCustomDesigns,
} from '../../services/customDesigns/customDesignService';
import {useTheme} from '../../theme/ThemeContext';
import {debugError} from '../../utils/debugLog';
import {
  pickImageFromGallery,
  takeImageWithCamera,
} from '../../utils/imagePicker';
import {directionalIconName} from '../../utils/rtl';
import {createStyles} from './styles';

const Upload = () => {
  const navigation = useNavigation();
  const {theme} = useTheme();
  const styles = useThemedStyles(createStyles);
  const {t} = useTranslation(['upload', 'common']);
  const toast = useToast();
  const confirm = useConfirm();
  const {categories} = useCategoryCatalog();

  const [designs, setDesigns] = useState([]);
  const [pickedImage, setPickedImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getCustomDesigns()
      .then(items => {
        if (active) {
          setDesigns(items);
        }
      })
      .catch(error => {
        debugError('CustomDesigns', 'Failed to load designs', error);
        if (active) {
          toast.show(t('upload:myDesignsLoadErrorTitle'), {type: 'error'});
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    const unsubscribe = subscribeCustomDesigns(setDesigns);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [t, toast]);

  const categoryOptions = useMemo(() => {
    if (categories.length > 0) {
      return categories
        .filter(category => category.name !== 'All')
        .map(category => ({
          id: category.name,
          label: category.displayName || category.name,
        }));
    }

    return CATEGORY_NAMES.filter(name => name !== 'All').map(name => ({
      id: name,
      label: name,
    }));
  }, [categories]);

  const categoryLabels = useMemo(
    () => new Map(categoryOptions.map(category => [category.id, category.label])),
    [categoryOptions],
  );

  const chooseImage = useCallback(
    async picker => {
      try {
        const asset = await picker();
        if (asset) {
          setPickedImage(asset);
          setSelectedCategory(categoryOptions[0]?.id || null);
        }
      } catch (error) {
        debugError('CustomDesigns', 'Image selection failed', error);
        toast.show(t('upload:galleryPickFailed'), {type: 'error'});
      }
    },
    [categoryOptions, t, toast],
  );

  const cancelAdd = useCallback(() => {
    setPickedImage(null);
    setSelectedCategory(null);
  }, []);

  const saveDesign = useCallback(async () => {
    if (!pickedImage || !selectedCategory || saving) {
      return;
    }

    setSaving(true);
    try {
      await addCustomDesign({
        asset: pickedImage,
        category: selectedCategory,
      });
      cancelAdd();
      toast.show(t('upload:submitSuccess'), {type: 'success'});
    } catch (error) {
      debugError('CustomDesigns', 'Failed to save local design', error);
      toast.show(t('upload:submitFailed'), {type: 'error'});
    } finally {
      setSaving(false);
    }
  }, [
    cancelAdd,
    pickedImage,
    saving,
    selectedCategory,
    t,
    toast,
  ]);

  const openDesign = useCallback(
    (design, index) => {
      const images = designs.map(item => item.imageRef);
      navigation.navigate('ViewImages', {
        image: design.imageRef.fullUrl,
        imageRef: design.imageRef,
        categoryName: design.category,
        images,
        initialIndex: index,
      });
    },
    [designs, navigation],
  );

  const confirmDelete = useCallback(
    design => {
      confirm({
        title: t('upload:deleteDesignTitle'),
        message: t('upload:deleteDesignMessage'),
        confirmLabel: t('upload:deleteDesignConfirm'),
        cancelLabel: t('common:cancel'),
        destructive: true,
        icon: 'trash-outline',
        onConfirm: async () => {
          try {
            await deleteCustomDesign(design.id);
            toast.show(t('upload:deleteDesignSuccess'), {type: 'success'});
          } catch (error) {
            debugError('CustomDesigns', 'Failed to delete local design', error);
            toast.show(t('upload:deleteDesignFailed'), {type: 'error'});
          }
        },
      });
    },
    [confirm, t, toast],
  );

  return (
    <ScreenContainer edges={[]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title={t('upload:sourceTitle')}
          subtitle={t('upload:sourceSubtitle')}
        />

        <SectionHeader title={t('upload:addDesignSectionTitle')} />

        {pickedImage ? (
          <View style={styles.editorCard}>
            <FastImage
              source={{uri: pickedImage.uri}}
              style={styles.previewImage}
              resizeMode={FastImage.resizeMode.cover}
            />

            <Text style={styles.categoryLabel}>
              {t('upload:categoryTitle')}
            </Text>
            <View style={styles.categoryGrid}>
              {categoryOptions.map(category => {
                const selected = selectedCategory === category.id;
                return (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => setSelectedCategory(category.id)}
                    style={[
                      styles.categoryChip,
                      selected && styles.categoryChipSelected,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{selected}}>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.categoryChipText,
                        selected && styles.categoryChipTextSelected,
                      ]}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.editorActions}>
              <PrimaryButton
                label={t('common:cancel')}
                variant="secondary"
                onPress={cancelAdd}
                style={styles.editorAction}
              />
              <PrimaryButton
                label={t('upload:saveLocallyLabel')}
                onPress={saveDesign}
                loading={saving}
                disabled={!selectedCategory}
                style={styles.editorAction}
              />
            </View>
          </View>
        ) : (
          <View style={styles.sourceGroup}>
            <TouchableOpacity
              style={styles.sourceCard}
              onPress={() => chooseImage(takeImageWithCamera)}
              accessibilityRole="button">
              <View style={styles.sourceCardIcon}>
                <Icons.Ionicons
                  name="camera-outline"
                  size={28}
                  color={theme.colors.accent.primary}
                />
              </View>
              <Text style={styles.sourceCardLabel}>
                {t('upload:chooseCameraLabel')}
              </Text>
              <Icons.Ionicons
                name={directionalIconName('chevron-forward')}
                size={18}
                color={theme.colors.text.tertiary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sourceCard}
              onPress={() => chooseImage(pickImageFromGallery)}
              accessibilityRole="button">
              <View style={styles.sourceCardIcon}>
                <Icons.Ionicons
                  name="images-outline"
                  size={28}
                  color={theme.colors.accent.primary}
                />
              </View>
              <Text style={styles.sourceCardLabel}>
                {t('upload:chooseGalleryLabel')}
              </Text>
              <Icons.Ionicons
                name={directionalIconName('chevron-forward')}
                size={18}
                color={theme.colors.text.tertiary}
              />
            </TouchableOpacity>
          </View>
        )}

        <SectionHeader title={t('upload:myDesignsTitle')} />

        {loading ? (
          <ActivityIndicator
            style={styles.loader}
            color={theme.colors.accent.primary}
          />
        ) : designs.length === 0 ? (
          <EmptyState
            icon="images-outline"
            title={t('upload:myDesignsEmptyTitle')}
            subtitle={t('upload:myDesignsEmptySubtitle')}
          />
        ) : (
          <View style={styles.designList}>
            {designs.map((design, index) => (
              <TouchableOpacity
                key={design.id}
                style={styles.designRow}
                onPress={() => openDesign(design, index)}
                accessibilityRole="button">
                <FastImage
                  source={{uri: design.imageRef.thumbnailUrl}}
                  style={styles.designThumbnail}
                  resizeMode={FastImage.resizeMode.cover}
                />
                <View style={styles.designInfo}>
                  <Text style={styles.designCategory} numberOfLines={1}>
                    {categoryLabels.get(design.category) || design.category}
                  </Text>
                  <Text style={styles.designDate}>
                    {new Date(design.createdAtMs).toLocaleDateString()}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => confirmDelete(design)}
                  style={styles.deleteButton}
                  accessibilityRole="button"
                  accessibilityLabel={t('upload:deleteDesignLabel')}>
                  <Icons.Ionicons
                    name="trash-outline"
                    size={20}
                    color={theme.colors.semantic.error}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

export default Upload;

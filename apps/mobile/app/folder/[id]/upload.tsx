import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Icon, useTheme, type Theme } from "@hukukai/ui";
import { UPLOAD_LIMITS } from "@hukukai/config";
import { useUploadDocument } from "../../../src/hooks/useDocuments";

type UploadSource = "camera" | "gallery" | "pdf";

export default function UploadDocumentScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { id: folderId } = useLocalSearchParams<{ id: string }>();
  const uploadDocument = useUploadDocument(folderId);
  const [pendingSource, setPendingSource] = useState<UploadSource | null>(null);

  const onUploaded = () => {
    setPendingSource(null);
    router.back();
  };

  const onUploadError = (error: unknown) => {
    setPendingSource(null);
    Alert.alert("Hata", error instanceof Error ? error.message : "Yükleme başarısız oldu.");
  };

  const uploadAsset = (uri: string, name: string, mimeType: string) => {
    uploadDocument.mutate(
      { uri, name, mimeType },
      { onSuccess: onUploaded, onError: onUploadError },
    );
  };

  const onPickCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("İzin gerekli", "Belge fotoğrafı çekmek için kamera izni vermeniz gerekiyor.");
      return;
    }
    setPendingSource("camera");
    const result = await ImagePicker.launchCameraAsync({ quality: 0.9 });
    if (result.canceled || result.assets.length === 0) {
      setPendingSource(null);
      return;
    }
    const asset = result.assets[0];
    if (!asset) {
      setPendingSource(null);
      return;
    }
    uploadAsset(asset.uri, asset.fileName ?? `belge-${Date.now()}.jpg`, asset.mimeType ?? "image/jpeg");
  };

  const onPickGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("İzin gerekli", "Galeriden belge seçmek için fotoğraf kitaplığı izni vermeniz gerekiyor.");
      return;
    }
    setPendingSource("gallery");
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.9 });
    if (result.canceled || result.assets.length === 0) {
      setPendingSource(null);
      return;
    }
    const asset = result.assets[0];
    if (!asset) {
      setPendingSource(null);
      return;
    }
    uploadAsset(asset.uri, asset.fileName ?? `belge-${Date.now()}.jpg`, asset.mimeType ?? "image/jpeg");
  };

  const onPickPdf = async () => {
    setPendingSource("pdf");
    const result = await DocumentPicker.getDocumentAsync({
      type: [...UPLOAD_LIMITS.allowedMimeTypes],
      copyToCacheDirectory: true,
    });
    if (result.canceled || result.assets.length === 0) {
      setPendingSource(null);
      return;
    }
    const asset = result.assets[0];
    if (!asset) {
      setPendingSource(null);
      return;
    }
    if (asset.size !== undefined && asset.size !== null && asset.size > UPLOAD_LIMITS.maxFileSizeBytes) {
      setPendingSource(null);
      Alert.alert("Hata", "Dosya boyutu izin verilen azami boyutu aşıyor.");
      return;
    }
    uploadAsset(asset.uri, asset.name, asset.mimeType ?? "application/octet-stream");
  };

  const isUploading = uploadDocument.isPending;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
          <Icon name="close" size={20} color={theme.colors.onSurface} />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Belge Analiz Et</Text>
        <Text style={styles.heroSubtitle}>
          Yapay zeka destekli analiz motorumuz belgenizdeki hukuki detayları saniyeler içinde
          çözümler. Verileriniz KVKK uyumlu uçtan uca şifrelenir.
        </Text>
      </View>

      <View style={styles.optionGrid}>
        <UploadOption
          icon="photo_camera"
          title="Kamera"
          description="Belgenin fotoğrafını çekerek anında tarayın."
          loading={isUploading && pendingSource === "camera"}
          disabled={isUploading}
          onPress={onPickCamera}
          styles={styles}
          theme={theme}
        />
        <UploadOption
          icon="image"
          title="Galeri"
          description="Cihazınızdaki mevcut fotoğraflardan birini seçin."
          loading={isUploading && pendingSource === "gallery"}
          disabled={isUploading}
          onPress={onPickGallery}
          styles={styles}
          theme={theme}
        />
        <UploadOption
          icon="picture_as_pdf"
          title="PDF Yükle"
          description="Dijital belgelerinizi PDF formatında sisteme aktarın."
          loading={isUploading && pendingSource === "pdf"}
          disabled={isUploading}
          onPress={onPickPdf}
          styles={styles}
          theme={theme}
        />
      </View>

      <View style={styles.securityBanner}>
        <Icon name="verified_user" size={22} color={theme.colors.tertiaryContainer} />
        <View style={styles.securityTextCol}>
          <Text style={styles.securityTitle}>Yüksek Güvenlik Protokolü</Text>
          <Text style={styles.securityBody}>
            Yüklenen tüm belgeler analiz tamamlandıktan sonra talebiniz üzerine sunucularımızdan
            tamamen silinebilir.
          </Text>
        </View>
      </View>

      <View style={styles.tipsSection}>
        <Text style={styles.tipsLabel}>İPUÇLARI</Text>
        <View style={styles.tipRow}>
          <Icon name="lightbulb" size={16} color={theme.colors.primary} />
          <Text style={styles.tipText}>Belgeyi düz bir zeminde ve yeterli ışık altında çekin.</Text>
        </View>
        <View style={styles.tipRow}>
          <Icon name="lightbulb" size={16} color={theme.colors.primary} />
          <Text style={styles.tipText}>Yazıların net ve okunabilir olduğundan emin olun.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function UploadOption({
  icon,
  title,
  description,
  loading,
  disabled,
  onPress,
  styles,
  theme,
}: {
  icon: string;
  title: string;
  description: string;
  loading: boolean;
  disabled: boolean;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  theme: Theme;
}) {
  return (
    <Pressable style={styles.optionCard} onPress={onPress} disabled={disabled}>
      <View style={styles.optionIconWrap}>
        {loading ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          <Icon name={icon} size={26} color={theme.colors.primary} />
        )}
      </View>
      <Text style={styles.optionTitle}>{title}</Text>
      <Text style={styles.optionDescription}>{description}</Text>
    </Pressable>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.background },
    container: {
      padding: theme.spacing.containerPadding,
      paddingTop: 56,
      paddingBottom: 48,
      gap: theme.spacing.stackGapMd,
    },
    headerRow: { flexDirection: "row" },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.surfaceContainer,
      alignItems: "center",
      justifyContent: "center",
    },
    hero: { alignItems: "center", gap: 8, paddingHorizontal: 8 },
    heroTitle: {
      fontFamily: theme.typography.headlineLgMobile.fontFamily,
      fontSize: 22,
      fontWeight: "700",
      color: theme.colors.primary,
      textAlign: "center",
    },
    heroSubtitle: {
      fontFamily: theme.typography.bodyLg.fontFamily,
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      textAlign: "center",
      lineHeight: 20,
    },
    optionGrid: { gap: 12 },
    optionCard: {
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      borderRadius: theme.radii.xl,
      padding: 20,
      alignItems: "center",
      gap: 6,
    },
    optionIconWrap: {
      width: 56,
      height: 56,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.surfaceContainer,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 4,
    },
    optionTitle: {
      fontFamily: theme.typography.headlineSm.fontFamily,
      fontSize: 15,
      fontWeight: "700",
      color: theme.colors.primary,
    },
    optionDescription: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      textAlign: "center",
    },
    securityBanner: {
      flexDirection: "row",
      gap: 12,
      backgroundColor: theme.colors.tertiaryFixed,
      borderColor: theme.colors.tertiaryContainer,
      borderWidth: 1,
      borderRadius: theme.radii.xl,
      padding: 16,
      alignItems: "flex-start",
    },
    securityTextCol: { flex: 1, gap: 2 },
    securityTitle: {
      fontFamily: theme.typography.bodyLg.fontFamily,
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.onTertiaryFixed,
    },
    securityBody: {
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 12,
      color: theme.colors.onTertiaryFixed,
      lineHeight: 17,
    },
    tipsSection: { gap: 10 },
    tipsLabel: {
      fontFamily: theme.typography.labelMd.fontFamily,
      fontSize: 11,
      letterSpacing: 0.5,
      color: theme.colors.onSurfaceVariant,
      textTransform: "uppercase",
    },
    tipRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderLeftWidth: 2,
      borderLeftColor: theme.colors.primaryContainer,
      paddingLeft: 10,
    },
    tipText: {
      flex: 1,
      fontFamily: theme.typography.bodyMd.fontFamily,
      fontSize: 13,
      color: theme.colors.onSurface,
    },
  });
}

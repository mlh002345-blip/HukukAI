import React from "react";
import { StyleSheet, TextInput, View, Text } from "react-native";

export interface GlobalSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

/**
 * Bölüm 6.1 — Ana Sayfa üst arama alanı: "Ne yapmak istiyorsunuz?"
 * Bu bileşen, ürünün ana keşif mekanizmasının giriş noktasıdır
 * (Bölüm 29, madde 4).
 */
export function GlobalSearchBar({
  value,
  onChangeText,
  onSubmit,
  placeholder = "Ne yapmak istiyorsunuz?",
  autoFocus = false,
}: GlobalSearchBarProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon} accessibilityElementsHidden>
        🔍
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor="#98A2B3"
        autoFocus={autoFocus}
        returnKeyType="search"
        style={styles.input}
        accessibilityLabel="Araç ve belge arama alanı"
        accessibilityHint="İhtiyacınızı günlük dille yazabilirsiniz, örneğin: icra tebligatı geldi kaç günüm var"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F2F4F7",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  icon: {
    fontSize: 16,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#101828",
  },
});

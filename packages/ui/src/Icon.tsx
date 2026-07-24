import { Text, type StyleProp, type TextStyle } from "react-native";

interface IconProps {
  /** Material Symbols ikon adı (ör. "home", "gavel", "description"). */
  name: string;
  size?: number;
  color?: string;
  /** Doldurulmuş (FILL=1) varyant — aktif sekme/durum ikonları için. */
  filled?: boolean;
  style?: StyleProp<TextStyle>;
}

/**
 * Material Symbols Outlined, harf dizisini (ligature) ilgili ikon
 * glifiyle değiştiren bir yazı tipidir — tasarım paketindeki
 * `<span class="material-symbols-outlined">home</span>` deseniyle
 * birebir aynı yaklaşım. İki statik ağırlık (FILL 0/1) yerel olarak
 * paketlenmiştir (bkz. `assets/fonts`).
 */
export function Icon({ name, size = 24, color, filled = false, style }: IconProps) {
  return (
    <Text
      style={[
        {
          fontFamily: filled ? "MaterialSymbolsOutlinedFilled" : "MaterialSymbolsOutlined",
          fontSize: size,
          color,
          includeFontPadding: false,
        },
        style,
      ]}
    >
      {name}
    </Text>
  );
}

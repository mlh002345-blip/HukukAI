import { useFonts } from "expo-font";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { JetBrainsMono_500Medium } from "@expo-google-fonts/jetbrains-mono";

/** Uygulama genelinde kullanılan yazı tiplerini (Inter, JetBrains Mono,
 * Material Symbols Outlined ikon fontu) yükler. */
export function useAppFonts() {
  return useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    JetBrainsMono_500Medium,
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- expo-font statik asset yüklemesi require gerektirir
    MaterialSymbolsOutlined: require("../../assets/fonts/MaterialSymbolsOutlined-Regular.ttf"),
    MaterialSymbolsOutlinedFilled:
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("../../assets/fonts/MaterialSymbolsOutlined-Filled.ttf"),
  });
}

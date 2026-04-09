import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import React from "react";
import { StyleProp, TextStyle } from "react-native";

import { colors, IconKey, iconMap } from "../constants/theme";

type SharedProps = {
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
};

type AppIconProps = SharedProps & {
  name: IconKey;
};

export function AppIcon({
  name,
  size = 20,
  color = colors.text,
  style,
  accessibilityLabel,
}: AppIconProps) {
  const icon = iconMap[name];

  if (icon.family === "Ionicons") {
    return (
      <Ionicons
        name={icon.name}
        size={size}
        color={color}
        style={style}
        accessibilityLabel={accessibilityLabel}
      />
    );
  }

  if (icon.family === "MaterialIcons") {
    return (
      <MaterialIcons
        name={icon.name}
        size={size}
        color={color}
        style={style}
        accessibilityLabel={accessibilityLabel}
      />
    );
  }

  return (
    <MaterialCommunityIcons
      name={icon.name}
      size={size}
      color={color}
      style={style}
      accessibilityLabel={accessibilityLabel}
    />
  );
}

export default AppIcon;

import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { StyleProp, TextStyle } from 'react-native';

import { colors, IconKey, iconMap } from '../constants/theme';

type IconFamily = keyof typeof iconFamilies;

type IoniconName = ComponentProps<typeof Ionicons>['name'];
type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];
type MaterialCommunityIconName =
  ComponentProps<typeof MaterialCommunityIcons>['name'];

type IconNameMap = {
  Ionicons: IoniconName;
  MaterialIcons: MaterialIconName;
  MaterialCommunityIcons: MaterialCommunityIconName;
};

type SharedIconProps = {
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
};

type AppIconProps =
  | (SharedIconProps & {
      name: IconKey;
    })
  | (SharedIconProps & {
      family: 'Ionicons';
      name: IoniconName;
    })
  | (SharedIconProps & {
      family: 'MaterialIcons';
      name: MaterialIconName;
    })
  | (SharedIconProps & {
      family: 'MaterialCommunityIcons';
      name: MaterialCommunityIconName;
    });

const iconFamilies = {
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} as const;

function isMappedIcon(
  props: AppIconProps,
): props is SharedIconProps & { name: IconKey } {
  return !('family' in props);
}

function renderFamilyIcon<TFamily extends IconFamily>(
  family: TFamily,
  name: IconNameMap[TFamily],
  props: SharedIconProps,
) {
  const IconComponent = iconFamilies[family];

  return (
    <IconComponent
      name={name}
      size={props.size ?? 20}
      color={props.color ?? colors.text}
      style={props.style}
      accessibilityLabel={props.accessibilityLabel}
    />
  );
}

export function AppIcon(props: AppIconProps) {
  if (isMappedIcon(props)) {
    const definition = iconMap[props.name];

    return renderFamilyIcon(definition.family, definition.name as never, props);
  }

  return renderFamilyIcon(props.family, props.name as never, props);
}

export default AppIcon;

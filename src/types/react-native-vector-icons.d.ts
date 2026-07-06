declare module 'react-native-vector-icons/Feather' {
  import {ComponentType} from 'react';
  import {TextProps} from 'react-native';

  type IconProps = TextProps & {
    name: string;
    size?: number;
    color?: string;
  };

  const Feather: ComponentType<IconProps>;
  export default Feather;
}

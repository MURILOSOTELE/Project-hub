import React, { useRef } from 'react';
import { Animated, Pressable } from 'react-native';

// Botão "genérico" que substitui o TouchableOpacity, mas com uma
// animação de escala: encolhe um pouco ao ser pressionado e cresce
// levemente ao passar o mouse por cima (efeito só visível na versão
// web/desktop, no celular funciona só o efeito de toque).
export default function AnimatedButton({
  onPress,
  style,
  children,
  disabled,
  ...props
}) {
  const escala = useRef(new Animated.Value(1)).current;

  const animarPara = (valor) => {
    Animated.spring(escala, {
      toValue: valor,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => animarPara(0.95)}
      onPressOut={() => animarPara(1)}
      onHoverIn={() => animarPara(1.03)}
      onHoverOut={() => animarPara(1)}
      style={style}
      {...props}>
      <Animated.View
        style={[
          { transform: [{ scale: escala }] },
          disabled && { opacity: 0.6 },
        ]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
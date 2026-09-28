import React from 'react';
import { Image, Pressable, Text, useWindowDimensions, View } from 'react-native';
import styles from '../styles/styles';

export function ProgressBar({ value }) {
  const percentage = Math.max(0, Math.min(100, value));

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Progress"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(percentage) }}
      style={styles.progressTrack}
    >
      <View style={[styles.progressFill, { width: `${percentage}%` }]} />
    </View>
  );
}

export function AppButton({ label, onPress, secondary = false, disabled = false, accessibilityHint }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.buttonSecondary,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <Text style={[styles.buttonText, secondary && styles.buttonSecondaryText]}>{label}</Text>
    </Pressable>
  );
}

export function Metric({ label, value }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

export function FutureFeatureCard({ title, subtitle, icon, onPress }) {
  const { fontScale } = useWindowDimensions();
  const iconIsImageUrl = typeof icon === 'string' && icon.startsWith('http');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      accessibilityHint="Opens this feature"
      onPress={onPress}
      style={({ pressed }) => [
        styles.futureFeatureCard,
        fontScale >= 1.3 && { width: '100%' },
        pressed && styles.buttonPressed,
      ]}
    >
      <View style={styles.futureIcon} accessible={false}>
        {iconIsImageUrl ? (
          <Image accessible={false} source={{ uri: icon }} style={styles.featureImageIcon} />
        ) : (
          <Text style={styles.futureIconText}>{icon}</Text>
        )}
      </View>
      <Text style={styles.futureFeatureTitle}>{title}</Text>
      <Text style={styles.futureFeatureSubtitle}>{subtitle}</Text>
      <Text style={styles.quickLinkLabel}>OPEN ›</Text>
    </Pressable>
  );
}

export function ScreenBackdrop({ variant = 'green' }) {
  const variantStyle = styles[`backdropBlob_${variant}`];
  const dotNumbers = [0, 1, 2, 3, 4, 5];

  return (
    <View pointerEvents="none" style={styles.backdrop}>
      <View style={[
        styles.backdropBlob,
        styles.backdropBlobTop,
        variantStyle,
      ]} />
      <View style={[
        styles.backdropBlob,
        styles.backdropBlobBottom,
        variantStyle,
      ]} />
      <View style={styles.backdropDotGrid}>
        {dotNumbers.map((dotNumber) => (
          <View key={dotNumber} style={styles.backdropDot} />
        ))}
      </View>
    </View>
  );
}

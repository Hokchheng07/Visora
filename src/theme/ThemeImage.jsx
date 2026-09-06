import { forwardRef } from 'react';
import { motion } from 'motion/react';
import { useThemeAsset } from './useTheme';

export const ThemeImage = forwardRef(function ThemeImage({ src, ...props }, ref) {
  const asset = useThemeAsset();
  return <img ref={ref} src={asset(src)} {...props} />;
});
const AnimatedImage = motion.create(ThemeImage);
export function MotionThemeImage(props) { return <AnimatedImage {...props} />; }
const SvgImage = forwardRef(function SvgImage({ href, ...props }, ref) {
  const asset = useThemeAsset();
  return <image ref={ref} href={asset(href)} {...props} />;
});
const AnimatedSvgImage = motion.create(SvgImage);
export function MotionThemeSvgImage(props) { return <AnimatedSvgImage {...props} />; }

// Reproducible color-only variants. Source geometry and embedded photos stay intact.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const assets = 'src/assets/Website/';
const files = [
  'Nav/NavbarBg.svg',
  ...['OuterHeroVector', 'MiddleHeroVector', 'InnerHeroVector', 'HeroSolidVector', 'HeroDashedVector', 'Stats/HeroStatsBg', 'Stats/PurpleBackground', 'Stats/YellowBackground'].map(n => `LandingPage/Hero-Section/${n}.svg`),
  ...['PopularTemplateTopWave', 'PopularTemplateLowerWave'].map(n => `LandingPage/PopularTemplates/${n}.svg`),
  'LandingPage/WhyChooseVisora/WhyChooseVisoraLinear.svg',
  ...['YellowBlob', 'PurpleBlob'].map(n => `LandingPage/CreateWithoutLimits/${n}.svg`),
  ...['YellowCardBlob(WithoutLimits)', 'PurpleCard(WithoutLimits)', 'SoftGreenCard(WithoutLimits)', 'SoftRedCard(WithoutLimits)', 'MajenticCard(WithoutLimits)', 'CyanCard(WithoutLimits).svg'].map(n => `LandingPage/CreateWithoutLimits/${n}.svg`),
  ...['FirstRactangle', '2ndRactangle', '3rdRactangle', 'Top-bg', 'BottomBg', 'Mountain', '01', '02', '03'].map(n => `LandingPage/HowItWorks/${n}.svg`),
  ...['TopBg(ExploreByEvents)', 'LightPurpleBackground', 'ForegroundPurple', 'LeftLayerBlur(ExploreByEvents)', 'CenterLayerBlur(ExploreByEvents)', 'RightLayerBlur'].map(n => `LandingPage/ExploreByEvents/${n}.svg`),
];
const palette = {
  '#705ae0': '#315b89', '#6854da': '#315b89', '#b294f0': '#413059',
  '#ffc21c': '#6b305e', '#ffbf1f': '#6b305e', '#ff99fd': '#914e87',
  '#b55ce1': '#5e386b', '#d0c5d6': '#222132', '#fffaf0': '#151520',
  '#fffdf8': '#202332', '#ffffff': '#202332', '#faf9f4': '#202332',
};
// Hand-authored replacements: these dark variants were painted by hand with the
// real brand palette instead of the auto palette-substitution above, so we copy
// them verbatim rather than recolor the light source.
const manualOverrides = {
  'Nav/NavbarBg.svg': 'Nav/navbarBg-dark.svg',
  ...Object.fromEntries(['OuterHeroVector', 'MiddleHeroVector', 'InnerHeroVector', 'HeroSolidVector', 'HeroDashedVector']
    .map(n => [`LandingPage/Hero-Section/${n}.svg`, `LandingPage/Hero-Section/${n}(DarkMode).svg`])),
  'LandingPage/Hero-Section/Stats/HeroStatsBg.svg': 'LandingPage/Hero-Section/Stats/HeroStats(DarkMode).svg',
  'LandingPage/PopularTemplates/PopularTemplateTopWave.svg': 'LandingPage/PopularTemplates/PopularTemplateTopBg(DarkMode).svg',
  'LandingPage/PopularTemplates/PopularTemplateLowerWave.svg': 'LandingPage/PopularTemplates/PopularTemplateBottomBg(DarkMode).svg',
  'LandingPage/WhyChooseVisora/WhyChooseVisoraLinear.svg': 'LandingPage/WhyChooseVisora/WhyChooseVisoraLinear(DarkMode).svg',
  'LandingPage/CreateWithoutLimits/YellowBlob.svg': 'LandingPage/CreateWithoutLimits/CreateWithOutLimits(TopRight, darkMode).svg',
  'LandingPage/CreateWithoutLimits/PurpleBlob.svg': 'LandingPage/CreateWithoutLimits/CreateWithOutLimits(BottomLeft, darkMode).svg',
  'LandingPage/HowItWorks/FirstRactangle.svg': 'LandingPage/HowItWorks/howItWorksFirstMountain(DarkMode).svg',
  'LandingPage/HowItWorks/2ndRactangle.svg': 'LandingPage/HowItWorks/HowItWorksSecondMountain(DarkMode).svg',
  'LandingPage/HowItWorks/3rdRactangle.svg': 'LandingPage/HowItWorks/HowItWorksThirdMountain(DarkMode).svg',
  'LandingPage/ExploreByEvents/LightPurpleBackground.svg': 'LandingPage/ExploreByEvents/ExploreByEvents(DarkMode, back) copy.svg',
  'LandingPage/ExploreByEvents/ForegroundPurple.svg': 'LandingPage/ExploreByEvents/ExploreByEventsPinkBlob(darkmode, front).svg',
};
// Hand-authored dark artwork with no recolorable light source (e.g. a PNG glow),
// paired in directly rather than run through the loop below.
const extraPairs = [
  ['LandingPage/WhyChooseVisora/why-choose-blob.png', 'LandingPage/WhyChooseVisora/WhyChooseVisoraRightBlob(DarkMode).svg'],
];
let imports = '';
let entries = '';
files.forEach((file, index) => {
  const override = manualOverrides[file];
  let svg = readFileSync(resolve(root, assets, override ?? file), 'utf8');
  if (!override) {
    svg = svg.replace(/#[0-9a-f]{6}\b/gi, c => palette[c.toLowerCase()] ?? c);
    svg = svg.replace(/(fill|stop-color)="white"/g, '$1="#202332"');
    // Number badges need the luminous accent paired with dark ink.
    if (/\/0[123]\.svg$/.test(file)) svg = svg.replaceAll('#6b305e', '#e35dcb');
    if (file.includes('CreateWithoutLimits/') && file.includes('Card')) {
      const surface = file.includes('Green') ? '#203b38' : file.includes('Red') || file.includes('Majentic') ? '#42293f' : '#242e48';
      svg = svg.replace(/fill="(#[0-9a-f]{6})"/gi, (_, color) => `fill="${color.toLowerCase() === '#585858' ? '#c6c6d7' : surface}"`)
        .replaceAll('fill="black"', 'fill="#f0f0f5"')
        .replaceAll('stroke="black"', 'stroke="#9aafd1"')
        .replace(/fill-opacity="[\d.]+"/g, 'fill-opacity="1"');
    }
  }
  const output = `src/theme/artwork/${file}`;
  mkdirSync(dirname(resolve(root, output)), { recursive: true });
  writeFileSync(resolve(root, output), svg);
  imports += `import light${index} from '../assets/Website/${file}';\nimport dark${index} from './artwork/${file}';\n`;
  entries += `  [light${index}]: dark${index},\n`;
});
extraPairs.forEach(([light, dark], i) => {
  const index = files.length + i;
  imports += `import light${index} from '../assets/Website/${light}';\nimport dark${index} from '../assets/Website/${dark}';\n`;
  entries += `  [light${index}]: dark${index},\n`;
});
writeFileSync(resolve(root, 'src/theme/darkAssets.js'), `// Generated by scripts/build-dark-artwork.mjs\n${imports}\nexport const darkAssets = {\n${entries}};\n`);
const sparkle = readFileSync(resolve(root, 'public/textures/speckles.svg'), 'utf8')
  .replace(/#6854da/gi, '#72BFF1').replace(/#ffc21c/gi, '#DA4EC9');
writeFileSync(resolve(root, 'public/textures/speckles-dark.svg'), sparkle);

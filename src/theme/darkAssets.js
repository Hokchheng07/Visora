/*
 * Light artwork -> its dark-mode counterpart. ThemeImage reads this map, so a
 * component keeps importing the light asset and the swap happens on theme.
 *
 * The Home/navbar block below was machine-generated (by a build-dark-artwork
 * script that is no longer in the repo) and is paired by filename. The About
 * block after it is hand-written: its dark exports were named independently of
 * the light ones, so each pair was matched on viewBox and path geometry rather
 * than on name, and the recolour follows one rule throughout -- yellow becomes
 * blue, purple becomes pink. Both halves are edited by hand now.
 */
import light0 from '../assets/sections/navbar/NavbarBg.svg';
import dark0 from '../assets/sections/navbar/dark/NavbarBg.svg';
import light1 from '../assets/pages/home/hero/OuterHeroVector.svg';
import dark1 from '../assets/pages/home/hero/dark/OuterHeroVector.svg';
import light2 from '../assets/pages/home/hero/MiddleHeroVector.svg';
import dark2 from '../assets/pages/home/hero/dark/MiddleHeroVector.svg';
import light3 from '../assets/pages/home/hero/InnerHeroVector.svg';
import dark3 from '../assets/pages/home/hero/dark/InnerHeroVector.svg';
import light4 from '../assets/pages/home/hero/HeroSolidVector.svg';
import dark4 from '../assets/pages/home/hero/dark/HeroSolidVector.svg';
import light5 from '../assets/pages/home/hero/HeroDashedVector.svg';
import dark5 from '../assets/pages/home/hero/dark/HeroDashedVector.svg';
import light6 from '../assets/pages/home/hero/stats/HeroStatsBg.svg';
import dark6 from '../assets/pages/home/hero/stats/dark/HeroStatsBg.svg';
import light7 from '../assets/pages/home/hero/stats/PurpleBackground.svg';
import dark7 from '../assets/pages/home/hero/stats/dark/PurpleBackground.svg';
import light8 from '../assets/pages/home/hero/stats/YellowBackground.svg';
import dark8 from '../assets/pages/home/hero/stats/dark/YellowBackground.svg';
import light9 from '../assets/pages/home/popular-templates/PopularTemplateTopWave.svg';
import dark9 from '../assets/pages/home/popular-templates/dark/PopularTemplateTopWave.svg';
import light10 from '../assets/pages/home/popular-templates/PopularTemplateLowerWave.svg';
import dark10 from '../assets/pages/home/popular-templates/dark/PopularTemplateLowerWave.svg';
import light11 from '../assets/pages/home/why-choose-visora/WhyChooseVisoraLinear.svg';
import dark11 from '../assets/pages/home/why-choose-visora/dark/WhyChooseVisoraLinear.svg';
import light12 from '../assets/pages/home/create-without-limits/YellowBlob.svg';
import dark12 from '../assets/pages/home/create-without-limits/dark/YellowBlob.svg';
import light13 from '../assets/pages/home/create-without-limits/PurpleBlob.svg';
import dark13 from '../assets/pages/home/create-without-limits/dark/PurpleBlob.svg';
import light14 from '../assets/pages/home/create-without-limits/YellowCardBlob(WithoutLimits).svg';
import dark14 from '../assets/pages/home/create-without-limits/dark/YellowCardBlob(WithoutLimits).svg';
import light15 from '../assets/pages/home/create-without-limits/PurpleCard(WithoutLimits).svg';
import dark15 from '../assets/pages/home/create-without-limits/dark/PurpleCard(WithoutLimits).svg';
import light16 from '../assets/pages/home/create-without-limits/SoftGreenCard(WithoutLimits).svg';
import dark16 from '../assets/pages/home/create-without-limits/dark/SoftGreenCard(WithoutLimits).svg';
import light17 from '../assets/pages/home/create-without-limits/SoftRedCard(WithoutLimits).svg';
import dark17 from '../assets/pages/home/create-without-limits/dark/SoftRedCard(WithoutLimits).svg';
import light18 from '../assets/pages/home/create-without-limits/MajenticCard(WithoutLimits).svg';
import dark18 from '../assets/pages/home/create-without-limits/dark/MajenticCard(WithoutLimits).svg';
import light19 from '../assets/pages/home/create-without-limits/CyanCard(WithoutLimits).svg.svg';
import dark19 from '../assets/pages/home/create-without-limits/dark/CyanCard(WithoutLimits).svg.svg';
import light20 from '../assets/pages/home/how-it-works/FirstRactangle.svg';
import dark20 from '../assets/pages/home/how-it-works/dark/FirstRactangle.svg';
import light21 from '../assets/pages/home/how-it-works/2ndRactangle.svg';
import dark21 from '../assets/pages/home/how-it-works/dark/2ndRactangle.svg';
import light22 from '../assets/pages/home/how-it-works/3rdRactangle.svg';
import dark22 from '../assets/pages/home/how-it-works/dark/3rdRactangle.svg';
import light23 from '../assets/pages/home/how-it-works/Top-bg.svg';
import dark23 from '../assets/pages/home/how-it-works/dark/Top-bg.svg';
import light24 from '../assets/pages/home/how-it-works/BottomBg.svg';
import dark24 from '../assets/pages/home/how-it-works/dark/BottomBg.svg';
import light25 from '../assets/pages/home/how-it-works/Mountain.svg';
import dark25 from '../assets/pages/home/how-it-works/dark/Mountain.svg';
import light26 from '../assets/pages/home/how-it-works/01.svg';
import dark26 from '../assets/pages/home/how-it-works/dark/01.svg';
import light27 from '../assets/pages/home/how-it-works/02.svg';
import dark27 from '../assets/pages/home/how-it-works/dark/02.svg';
import light28 from '../assets/pages/home/how-it-works/03.svg';
import dark28 from '../assets/pages/home/how-it-works/dark/03.svg';
import light29 from '../assets/pages/home/explore-by-events/TopBg(ExploreByEvents).svg';
import dark29 from '../assets/pages/home/explore-by-events/dark/TopBg(ExploreByEvents).svg';
import light30 from '../assets/pages/home/explore-by-events/LightPurpleBackground.svg';
import dark30 from '../assets/pages/home/explore-by-events/dark/LightPurpleBackground.svg';
import light31 from '../assets/pages/home/explore-by-events/ForegroundPurple.svg';
import dark31 from '../assets/pages/home/explore-by-events/dark/ForegroundPurple.svg';
import light32 from '../assets/pages/home/explore-by-events/LeftLayerBlur(ExploreByEvents).svg';
import dark32 from '../assets/pages/home/explore-by-events/dark/LeftLayerBlur(ExploreByEvents).svg';
import light33 from '../assets/pages/home/explore-by-events/CenterLayerBlur(ExploreByEvents).svg';
import dark33 from '../assets/pages/home/explore-by-events/dark/CenterLayerBlur(ExploreByEvents).svg';
import light34 from '../assets/pages/home/explore-by-events/RightLayerBlur.svg';
import dark34 from '../assets/pages/home/explore-by-events/dark/RightLayerBlur.svg';
import light35 from '../assets/pages/home/why-choose-visora/why-choose-blob.png';
import dark35 from '../assets/pages/home/why-choose-visora/WhyChooseVisoraRightBlob(DarkMode).svg';


// --- About page ---
import heroYellowFrameLight from '../assets/pages/about/hero/YellowFrameHero.svg';
import heroYellowFrameDark from '../assets/pages/about/DarkMode/HeroBlueFrame.svg';
import heroPurpleFrameLight from '../assets/pages/about/hero/PurpleFrame.svg';
import heroPurpleFrameDark from '../assets/pages/about/DarkMode/HeroPinkFrame.svg';
import heroRightSolidLight from '../assets/pages/about/hero/RightSolid.svg';
import heroRightSolidDark from '../assets/pages/about/DarkMode/RightSolid.svg';
import heroLeftDashedLight from '../assets/pages/about/shared/connectors/DashedLeftLine.svg';
import heroLeftDashedDark from '../assets/pages/about/DarkMode/HeroLeftDash.svg';
import heroLeftSolidLight from '../assets/pages/about/shared/connectors/LeftSolidLine.svg';
import heroLeftSolidDark from '../assets/pages/about/DarkMode/HeroLeftSolid.svg';
import snailOneLight from '../assets/pages/about/shared/doodles/Snail1.svg';
import snailOneDark from '../assets/pages/about/DarkMode/LeftSnail.svg';
import snailTwoLight from '../assets/pages/about/shared/doodles/Snail2.svg';
import snailTwoDark from '../assets/pages/about/DarkMode/LeftBlueSnail.svg';
import squiggleYellowLight from '../assets/pages/about/shared/doodles/SvigalYellow.svg';
import squiggleYellowDark from '../assets/pages/about/DarkMode/RightSwigly(Blue).svg';
import squigglePurpleLight from '../assets/pages/about/shared/doodles/SpigalPurple.svg';
import squigglePurpleDark from '../assets/pages/about/DarkMode/LeftSwigly(Pink).svg';
import spiralArrowLight from '../assets/pages/about/shared/doodles/SpiralArrow(AboutUs).svg';
import spiralArrowDark from '../assets/pages/about/DarkMode/SpiralArrow.svg';
import blobLeftLight from '../assets/pages/about/shared/doodles/LeftDoubleBlob(Purple,yellow.svg';
import blobLeftDark from '../assets/pages/about/DarkMode/Pink.svg';
import blobRightLight from '../assets/pages/about/shared/doodles/RightDoubleBlob(Purple,Yellow).svg';
import blobRightDark from '../assets/pages/about/DarkMode/BlueInPinkLayer.svg';
import storySwooshLight from '../assets/pages/about/story/DashYellowUnderStory.svg';
import storySwooshDark from '../assets/pages/about/DarkMode/BleuSWOOSH.svg';
import journeySolidLight from '../assets/pages/about/journey/BigMiddleSolidLine.svg';
import journeySolidDark from '../assets/pages/about/DarkMode/SolidCenterLine.svg';
import journeyDashedLight from '../assets/pages/about/journey/BigMiddleDashLine.svg';
import journeyDashedDark from '../assets/pages/about/DarkMode/DashedCenterLine.svg';
import journeyGlowLight from '../assets/pages/about/journey/BigMiddleLinear.svg';
import journeyGlowDark from '../assets/pages/about/DarkMode/MiddleGLow.svg';
import valueCreatorsLight from '../assets/pages/about/core-values/BuildForEventCreators.svg';
import valueCreatorsDark from '../assets/pages/about/DarkMode/BuildForEventCreators.svg';
import valueCambodiaLight from '../assets/pages/about/core-values/InspiredByCambodia.svg';
import valueCambodiaDark from '../assets/pages/about/DarkMode/InspiredByCambodia.svg';
import valueSimpleLight from '../assets/pages/about/core-values/SimpleNPowerful.svg';
import valueSimpleDark from '../assets/pages/about/DarkMode/Simple&Powerful.svg';
import valueEveryoneLight from '../assets/pages/about/core-values/ForEveryoneEveryWhere.svg';
import valueEveryoneDark from '../assets/pages/about/DarkMode/ForEveryoneAnywhere.svg';
import featureBackdropLight from '../assets/pages/about/design-present-inspire/BackForDesignPresentInspire.svg';
import featureBackdropDark from '../assets/pages/about/DarkMode/DesingPresentInspire.svg';
import featurePinEtchLight from '../assets/pages/about/design-present-inspire/PinCardBackground.svg';
import featurePinEtchDark from '../assets/pages/about/DarkMode/HangingCardBackground.svg';
import visionFrameLight from '../assets/pages/about/vision-mission/OurVisionFrame+OurMission.svg';
import visionFrameDark from '../assets/pages/about/DarkMode/OurMissionFrame.svg';
import cardPurpleFrameLight from '../assets/pages/about/people/cards/purple/PurpleFram.svg';
import cardPurpleFrameDark from '../assets/pages/about/DarkMode/PinkFrame.svg';
import cardPurpleBgLight from '../assets/pages/about/people/cards/purple/prupleBg.svg';
import cardPurpleBgDark from '../assets/pages/about/DarkMode/PinkCardBg.svg';
import cardPurpleBlobLight from '../assets/pages/about/people/cards/purple/PurpleBlob.svg';
import cardPurpleBlobDark from '../assets/pages/about/DarkMode/PinkPictureBG.svg';
import cardYellowFrameLight from '../assets/pages/about/people/cards/yellow/CardFrame(Yellow)..svg';
import cardYellowFrameDark from '../assets/pages/about/DarkMode/BlueFrame.svg';
import cardYellowBgLight from '../assets/pages/about/people/cards/yellow/CardBG(Yellow).svg';
import cardYellowBgDark from '../assets/pages/about/DarkMode/BlueCardbg.svg';
import cardYellowBlobLight from '../assets/pages/about/people/cards/yellow/BlobBehindPicture(Yellow)..svg';
import cardYellowBlobDark from '../assets/pages/about/DarkMode/BluePictureBg.svg';
import ctaWaveLight from '../assets/pages/about/cta/PurpleWave(Bottom).svg';
import ctaWaveDark from '../assets/pages/about/DarkMode/BlobBottomElements/BlobBg(Pink).svg';
import ctaLine33Light from '../assets/pages/about/misc/bottom-blob/Line 33.svg';
import ctaLine33Dark from '../assets/pages/about/DarkMode/BlobBottomElements/Line 33.svg';
import ctaLine34Light from '../assets/pages/about/misc/bottom-blob/Line 34.svg';
import ctaLine34Dark from '../assets/pages/about/DarkMode/BlobBottomElements/Line 34.svg';
import ctaLine35Light from '../assets/pages/about/misc/bottom-blob/Line 35.svg';
import ctaLine35Dark from '../assets/pages/about/DarkMode/BlobBottomElements/Line 35.svg';
import ctaImage106Light from '../assets/pages/about/misc/bottom-blob/image 106.svg';
import ctaImage106Dark from '../assets/pages/about/DarkMode/BlobBottomElements/image 106.svg';
import ctaImage110Light from '../assets/pages/about/misc/bottom-blob/image 110.svg';
import ctaImage110Dark from '../assets/pages/about/DarkMode/BlobBottomElements/image 110.svg';
import ctaImage111Light from '../assets/pages/about/misc/bottom-blob/image 111.svg';
import ctaImage111Dark from '../assets/pages/about/DarkMode/BlobBottomElements/image 111.svg';

export const darkAssets = {
  [light0]: dark0,
  [light1]: dark1,
  [light2]: dark2,
  [light3]: dark3,
  [light4]: dark4,
  [light5]: dark5,
  [light6]: dark6,
  [light7]: dark7,
  [light8]: dark8,
  [light9]: dark9,
  [light10]: dark10,
  [light11]: dark11,
  [light12]: dark12,
  [light13]: dark13,
  [light14]: dark14,
  [light15]: dark15,
  [light16]: dark16,
  [light17]: dark17,
  [light18]: dark18,
  [light19]: dark19,
  [light20]: dark20,
  [light21]: dark21,
  [light22]: dark22,
  [light23]: dark23,
  [light24]: dark24,
  [light25]: dark25,
  [light26]: dark26,
  [light27]: dark27,
  [light28]: dark28,
  [light29]: dark29,
  [light30]: dark30,
  [light31]: dark31,
  [light32]: dark32,
  [light33]: dark33,
  [light34]: dark34,
  [light35]: dark35,

  // --- About page ---
  [heroYellowFrameLight]: heroYellowFrameDark,
  [heroPurpleFrameLight]: heroPurpleFrameDark,
  [heroRightSolidLight]: heroRightSolidDark,
  [heroLeftDashedLight]: heroLeftDashedDark,
  [heroLeftSolidLight]: heroLeftSolidDark,
  [snailOneLight]: snailOneDark,
  [snailTwoLight]: snailTwoDark,
  [squiggleYellowLight]: squiggleYellowDark,
  [squigglePurpleLight]: squigglePurpleDark,
  [spiralArrowLight]: spiralArrowDark,
  [blobLeftLight]: blobLeftDark,
  [blobRightLight]: blobRightDark,
  [storySwooshLight]: storySwooshDark,
  [journeySolidLight]: journeySolidDark,
  [journeyDashedLight]: journeyDashedDark,
  [journeyGlowLight]: journeyGlowDark,
  [valueCreatorsLight]: valueCreatorsDark,
  [valueCambodiaLight]: valueCambodiaDark,
  [valueSimpleLight]: valueSimpleDark,
  [valueEveryoneLight]: valueEveryoneDark,
  [featureBackdropLight]: featureBackdropDark,
  [featurePinEtchLight]: featurePinEtchDark,
  [visionFrameLight]: visionFrameDark,
  [cardPurpleFrameLight]: cardPurpleFrameDark,
  [cardPurpleBgLight]: cardPurpleBgDark,
  [cardPurpleBlobLight]: cardPurpleBlobDark,
  [cardYellowFrameLight]: cardYellowFrameDark,
  [cardYellowBgLight]: cardYellowBgDark,
  [cardYellowBlobLight]: cardYellowBlobDark,
  [ctaWaveLight]: ctaWaveDark,
  [ctaLine33Light]: ctaLine33Dark,
  [ctaLine34Light]: ctaLine34Dark,
  [ctaLine35Light]: ctaLine35Dark,
  [ctaImage106Light]: ctaImage106Dark,
  [ctaImage110Light]: ctaImage110Dark,
  [ctaImage111Light]: ctaImage111Dark,
};

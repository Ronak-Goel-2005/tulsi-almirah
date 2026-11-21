import { collectionPath } from './collections';
import { productPath } from '../lib/catalogue';

export type GuideLanguage = 'en' | 'hi';

interface GuideSection {
  heading: string;
  copy: string;
  links?: readonly { label: string; href: string }[];
}

interface Guide {
  locale: 'en-IN' | 'hi-IN';
  title: string;
  heading: string;
  description: string;
  intro: string;
  sections: readonly GuideSection[];
}

export const guides: Record<GuideLanguage, Guide> = {
  en: {
    locale: 'en-IN',
    title: 'How to Choose a Steel Almirah | Tulsi Almirah, Shamli',
    heading: 'How to choose a steel almirah',
    description: 'Compare steel almirah sizes, door layouts and mirrors. Learn what to measure and what to ask before ordering from Tulsi Almirah in Shamli.',
    intro: 'Use this guide to shortlist a model, check that it fits and prepare your questions for the Tulsi Almirah showroom in Hind, Shamli.',
    sections: [
      {
        heading: 'Measure the space and the way in',
        copy: 'Measure the available width, depth and height. Leave enough space in front for the doors to open without hitting a bed or another piece of furniture. Measure narrow doorways, stairs and tight turns on the way in. Compare your measurements with the model’s listed dimensions.',
      },
      {
        heading: 'Compare door counts and interior layouts',
        copy: 'Start with a 36- or 42-inch two-door model for a narrower wall. If you have room for a 48-inch model, compare the 48 Hero’s side shelves and the 48 King’s separate upper compartment. Check the inside photos to see how much space is set aside for hanging clothes or folded stacks.',
        links: [
          { label: 'Two-door steel almirahs', href: collectionPath('two-door-steel-almirahs') },
          { label: 'Three-door steel almirahs', href: collectionPath('three-door-steel-almirahs') },
        ],
      },
      {
        heading: 'Decide where you need a mirror and drawers',
        copy: 'If the almirah will double as your dressing area, check the mirror position and leave enough room to stand in front of it. Compare the drawers on the 42 Dressing with the shelves and hanging space on the 48 Classic.',
        links: [
          { label: 'Steel almirahs with mirrors', href: collectionPath('mirrored-steel-almirahs') },
          { label: '42 Dressing model', href: productPath('42-dressing') },
          { label: '48 Classic model', href: productPath('48-classic') },
        ],
      },
      {
        heading: 'Ask for a quote and check fitting options',
        copy: 'Share the model name or catalogue code and ask for the current price, available colours and delivery options. For a custom order or wall fitting, share the available width, depth and height and a photo of the space. Ask the showroom to confirm the dimensions and fitting before you order.',
      },
    ],
  },
  hi: {
    locale: 'hi-IN',
    title: 'स्टील की अलमारी कैसे चुनें | तुलसी अलमारी, शामली',
    heading: 'स्टील की अलमारी कैसे चुनें',
    description: 'स्टील की अलमारी का साइज़, दरवाज़ों की संख्या और शीशे वाले मॉडल की तुलना करें। ऑर्डर से पहले क्या नापें और क्या पूछें, जानें।',
    intro: 'इस गाइड से अपनी जगह के हिसाब से अलमारी चुनें और हिंड, शामली के तुलसी अलमारी शोरूम से बात करने से पहले अपने सवाल तैयार करें।',
    sections: [
      {
        heading: 'जगह और आने-जाने का रास्ता नापें',
        copy: 'जहाँ अलमारी रखनी है, वहाँ की चौड़ाई, गहराई और ऊँचाई नापें। सामने इतनी जगह रखें कि दरवाज़े पलंग या दूसरे फर्नीचर से टकराए बिना खुल सकें। जिन दरवाज़ों, सीढ़ियों और तंग मोड़ों से अलमारी अंदर जाएगी, उन्हें भी नापें। फिर अपने नाप की तुलना मॉडल के दिए गए साइज़ से करें।',
      },
      {
        heading: 'दरवाज़ों और अंदर की बनावट की तुलना करें',
        copy: 'दीवार पर कम जगह है तो 36 या 42 इंच चौड़ी दो दरवाज़ों वाली अलमारी देखें। अगर 48 इंच की जगह है तो 48 हीरो की बगल वाली शेल्फ़ और 48 किंग के अलग से खुलने वाले ऊपरी खाने की तुलना करें। अंदर की तस्वीरों में देखें कि कपड़े टाँगने और तह करके रखने की कितनी जगह है।',
        links: [
          { label: 'दो दरवाज़ों वाली स्टील की अलमारियाँ', href: collectionPath('two-door-steel-almirahs') },
          { label: 'तीन दरवाज़ों वाली स्टील की अलमारियाँ', href: collectionPath('three-door-steel-almirahs') },
        ],
      },
      {
        heading: 'शीशे और दराज़ की जगह देखें',
        copy: 'अगर इसी अलमारी के सामने तैयार होंगे तो शीशे की जगह देखें और सामने खड़े होने के लिए पर्याप्त जगह रखें। 42 ड्रेसिंग की दराज़ों की तुलना 48 क्लासिक की शेल्फ़ और कपड़े टाँगने की जगह से करें।',
        links: [
          { label: 'शीशे वाली स्टील की अलमारियाँ', href: collectionPath('mirrored-steel-almirahs') },
          { label: '42 ड्रेसिंग मॉडल', href: productPath('42-dressing') },
          { label: '48 क्लासिक मॉडल', href: productPath('48-classic') },
        ],
      },
      {
        heading: 'कीमत और फिटिंग के बारे में पूछें',
        copy: 'मॉडल का नाम या कैटलॉग कोड बताकर मौजूदा कीमत, उपलब्ध रंग और डिलीवरी के बारे में पूछें। अपने नाप की अलमारी या दीवार पर फिटिंग के लिए जगह की चौड़ाई, गहराई और ऊँचाई के साथ एक तस्वीर भेजें। ऑर्डर से पहले शोरूम से साइज़ और फिटिंग की पुष्टि करें।',
      },
    ],
  },
};

export function guidePath(language: GuideLanguage): string {
  return `/guides/steel-almirah/${language}/`;
}

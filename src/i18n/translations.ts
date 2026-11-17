import { LanguageCode } from '../types/school';

interface Dictionary {
  nav: {
    home: string;
    about: string;
    academics: string;
    admissions: string;
    teachers: string;
    notices: string;
    events: string;
    gallery: string;
    facilities: string;
    contact: string;
    portalLogin: string;
    campusMenu: string;
  };
  hero: {
    kicker: string;
    headline: string;
    subheadline: string;
    primaryCta: string;
    secondaryCta: string;
  };
  sections: {
    statsTitle: string;
    programsTitle: string;
    whyChooseTitle: string;
    noticesEventsTitle: string;
    principalTitle: string;
    galleryTitle: string;
    contactTitle: string;
    viewAllNotices: string;
    viewAllEvents: string;
    exploreAcademics: string;
    openGallery: string;
  };
  portal: {
    demoBanner: string;
    resetDemo: string;
    switchRole: string;
    publicSite: string;
    notifications: string;
    noNotifications: string;
    markAllRead: string;
    calendarMode: string;
    language: string;
  };
}

export const TRANSLATIONS: Record<LanguageCode, Dictionary> = {
  en: {
    nav: {
      home: 'Home',
      about: 'About',
      academics: 'Academics',
      admissions: 'Admissions',
      teachers: 'Faculty',
      notices: 'Notices',
      events: 'Events',
      gallery: 'Gallery',
      facilities: 'Facilities',
      contact: 'Contact',
      portalLogin: 'Portal Login',
      campusMenu: 'Campus',
    },
    hero: {
      kicker: 'Grade 1 to Grade 12 · NEB & National Curriculum',
      headline: 'Structured, thoughtful education built for curious learners.',
      subheadline:
        'Uniting public school transparency with dedicated daily portals for students, teachers, parents, and school administrators.',
      primaryCta: 'Apply for Admission',
      secondaryCta: 'Explore Portals',
    },
    sections: {
      statsTitle: 'School at a glance',
      programsTitle: 'Academic programs & campus facilities',
      whyChooseTitle: 'Why families choose our academy',
      noticesEventsTitle: 'Latest notices & upcoming events',
      principalTitle: 'From the Principal’s desk',
      galleryTitle: 'Campus life & facilities gallery',
      contactTitle: 'Visit or contact the school office',
      viewAllNotices: 'All Notices',
      viewAllEvents: 'All Events',
      exploreAcademics: 'Curriculum Overview',
      openGallery: 'View Full Gallery',
    },
    portal: {
      demoBanner: 'Frontend Demo Workspace · Sample local data only',
      resetDemo: 'Reset Demo Data',
      switchRole: 'Switch Role',
      publicSite: 'Public Website',
      notifications: 'Notifications',
      noNotifications: 'All notifications read.',
      markAllRead: 'Mark all read',
      calendarMode: 'Calendar',
      language: 'Language',
    },
  },
  np: {
    nav: {
      home: 'गृहपृष्ठ',
      about: 'परिचय',
      academics: 'शैक्षिक कार्यक्रम',
      admissions: 'भर्ना',
      teachers: 'शिक्षक',
      notices: 'सूचनाहरू',
      events: 'कार्यक्रमहरू',
      gallery: 'ग्यालेरी',
      facilities: 'सुविधाहरू',
      contact: 'सम्पर्क',
      portalLogin: 'पोर्टल लगइन',
      campusMenu: 'क्याम्पस',
    },
    hero: {
      kicker: 'कक्षा १ देखि १२ सम्म · राष्ट्रिय पाठ्यक्रम',
      headline: 'जिज्ञासु विद्यार्थीहरूका लागि व्यवस्थित र गुणस्तरीय शिक्षा।',
      subheadline:
        'विद्यार्थी, शिक्षक, अभिभावक र विद्यालय प्रशासनका लागि एकीकृत डिजिटल पोर्टल तथा सार्वजनिक विद्यालय वेबसाइट।',
      primaryCta: 'भर्ना आवेदन दिनुहोस्',
      secondaryCta: 'पोर्टल हेर्नुहोस्',
    },
    sections: {
      statsTitle: 'विद्यालयको झलक',
      programsTitle: 'शैक्षिक कार्यक्रम तथा सुविधाहरू',
      whyChooseTitle: 'हाम्रो विद्यालय किन छान्ने?',
      noticesEventsTitle: 'ताजा सूचना तथा आगामी कार्यक्रमहरू',
      principalTitle: 'प्रधानाध्यापकको सन्देश',
      galleryTitle: 'विद्यालय जीवन र ग्यालेरी',
      contactTitle: 'विद्यालय प्रशासनसँग सम्पर्क गर्नुहोस्',
      viewAllNotices: 'सबै सूचना',
      viewAllEvents: 'सबै कार्यक्रम',
      exploreAcademics: 'पाठ्यक्रम विवरण',
      openGallery: 'ग्यालेरी हेर्नुहोस्',
    },
    portal: {
      demoBanner: 'डेमो कार्यक्षेत्र · नमुना स्थानीय डेटा मात्र',
      resetDemo: 'डेटा रिसेट',
      switchRole: 'भूमिका परिवर्तन',
      publicSite: 'मुख्य वेबसाइट',
      notifications: 'सूचनाहरू',
      noNotifications: 'सबै सूचना पढिसकिएको छ।',
      markAllRead: 'सबै पढेको चिन्ह लगाउनुहोस्',
      calendarMode: 'पात्रो',
      language: 'भाषा',
    },
  },
};

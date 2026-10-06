import { SITE_URL } from './site';
/**
 * TallSkill — central branding & company configuration.
 * Every page, email, receipt and admin panel must import from here.
 * DO NOT hardcode company info elsewhere.
 */

export const BRAND = {
  name: 'TallSkill',
  // Cache-bust — bump when the logo asset is replaced so browsers refetch.
  logoUrl: '/tallskill-logo.png?v=1',
  logoAlt: 'TallSkill',
  primary: '#6C2BFF',
  gold: '#FFD54A',
  // Aspect ratio of the square TallSkill monogram.
  logoAspect: 1,
};

export const COMPANY = {
  legalName: 'PRIZE LEAGUE LTD',
  companyNumber: '17338919',
  incorporatedOn: '14 July 2026',
  companyType: 'Private company limited by shares',
  jurisdiction: 'England and Wales',
  registeredOffice: {
    line1: '118 Windsor Road',
    line2: 'London',
    country: 'England',
    postcode: 'E7 0RB',
    countryFull: 'United Kingdom',
  },
  website: SITE_URL,
  // Legacy operator mailboxes retained until TallSkill contacts are confirmed; override via env.
  emails: {
    general: process.env.REACT_APP_GENERAL_EMAIL || 'info@prizeleague.co.uk',
    support: process.env.REACT_APP_SUPPORT_EMAIL || 'support@prizeleague.co.uk',
  },
};

// Address block formatted for postal + legal displays.
export const REGISTERED_ADDRESS_ONE_LINE =
  '118 Windsor Road, London, England, E7 0RB, United Kingdom';

// Legal footer statement — MUST appear in site footer.
export const LEGAL_FOOTER =
  'TallSkill is operated by PRIZE LEAGUE LTD, a company registered in ' +
  'England and Wales under company number 17338919. Registered office: ' +
  '118 Windsor Road, London, England, E7 0RB, United Kingdom.';

// Default free postal entry address (super-admin editable via /admin/company-settings).
export const POSTAL_ENTRY = {
  header: 'Free Postal Entry',
  legalName: 'PRIZE LEAGUE LTD',
  line1: '118 Windsor Road',
  line2: 'London',
  country: 'England',
  postcode: 'E7 0RB',
  countryFull: 'United Kingdom',
};

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

// TallSkill's Indian legal entity is not yet incorporated. Do NOT fill in a company number,
// CIN, GST, PAN or address until it exists; configure via env / admin Company Settings.
const PENDING = 'TallSkill legal entity pending incorporation';

export const COMPANY = {
  legalName: process.env.REACT_APP_LEGAL_OPERATOR_NAME || PENDING,
  companyNumber: '',
  incorporatedOn: '',
  companyType: '',
  jurisdiction: 'India (pending incorporation)',
  registeredOffice: { line1: '', line2: '', country: 'India', postcode: '', countryFull: 'India' },
  website: SITE_URL,
  emails: {
    general: process.env.REACT_APP_GENERAL_EMAIL || '',
    support: process.env.REACT_APP_SUPPORT_EMAIL || '',
  },
};

export const REGISTERED_ADDRESS_ONE_LINE = '';

export const LEGAL_FOOTER =
  'TallSkill legal operator details are pending incorporation and Indian legal review.';

// UK free postal entry route — not used by TallSkill India.
export const POSTAL_ENTRY = {
  header: 'Free Postal Entry',
  legalName: COMPANY.legalName,
  line1: '',
  line2: '',
  country: '',
  postcode: '',
  countryFull: '',
};

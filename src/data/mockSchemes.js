export const mockSchemes = [
  {
    id: 'pmay-g',
    name: 'Pradhan Mantri Awas Yojana (Gramin)',
    summary: 'Financial assistance to build a pucca house for rural households without one.',
    maxIncome: 15000,
    states: ['all'],
    occupations: ['all'],
    categories: ['all'],
    documents: ['Aadhaar card', 'Bank passbook', 'Land/residence proof', 'Caste certificate (if applicable)'],
    steps: [
      'Check your name in the Awaas+ list at your gram panchayat office',
      'Fill Form via Common Service Centre (CSC) or PMAY-G portal',
      'Submit documents for verification',
      'Geo-tagged photo of construction is required at each installment stage'
    ],
    applyLink: 'https://pmayg.nic.in/'
  },
  {
    id: 'nsap',
    name: 'National Social Assistance Programme (Old Age Pension)',
    summary: 'Monthly pension for citizens above 60 years from BPL households.',
    maxIncome: 10000,
    states: ['all'],
    occupations: ['all'],
    categories: ['all'],
    documents: ['Age proof', 'BPL card', 'Aadhaar card', 'Bank account details'],
    steps: [
      'Visit the nearest Common Service Centre or block office',
      'Fill the NSAP application form',
      'Submit age and income proof',
      'Pension is credited directly to your bank account monthly'
    ],
    applyLink: 'https://nsap.nic.in/'
  },
  {
    id: 'pmkisan',
    name: 'PM-KISAN',
    summary: 'Direct income support of ₹6,000/year for eligible farmer families.',
    maxIncome: 200000,
    states: ['all'],
    occupations: ['farmer', 'agriculture'],
    categories: ['all'],
    documents: ['Aadhaar card', 'Land ownership papers', 'Bank passbook'],
    steps: [
      'Register on the PM-KISAN portal or via CSC',
      'Enter land records and bank details',
      'State authority verifies land ownership',
      'Funds disbursed in three installments per year'
    ],
    applyLink: 'https://pmkisan.gov.in/'
  },
  {
    id: 'ujjwala',
    name: 'Pradhan Mantri Ujjwala Yojana',
    summary: 'Free LPG connection for women from below-poverty-line households.',
    maxIncome: 12000,
    states: ['all'],
    occupations: ['all'],
    categories: ['women', 'all'],
    documents: ['Aadhaar card', 'BPL ration card', 'Bank account details'],
    steps: [
      'Visit your nearest LPG distributor with documents',
      'Fill the Ujjwala application form (KYC)',
      'Verification by the distributor',
      'Free connection issued, first refill often subsidised'
    ],
    applyLink: 'https://pmuy.gov.in/'
  },
  {
    id: 'sukanya',
    name: 'Sukanya Samriddhi Yojana',
    summary: 'Savings scheme for the education and marriage expenses of a girl child.',
    maxIncome: 1000000,
    states: ['all'],
    occupations: ['all'],
    categories: ['women', 'all'],
    documents: ['Girl child birth certificate', 'Guardian Aadhaar/ID proof', 'Address proof'],
    steps: [
      'Visit any post office or authorised bank branch',
      'Open account with minimum ₹250 deposit',
      'Deposit annually until the girl turns 15',
      'Account matures 21 years from opening'
    ],
    applyLink: 'https://www.nsiindia.gov.in/'
  }
]

export function matchSchemes({ income, occupation, category }) {
  const incomeNum = Number(income) || 0
  return mockSchemes.filter((scheme) => {
    const incomeOk = incomeNum > 0 ? incomeNum <= scheme.maxIncome : true
    const occOk = scheme.occupations.includes('all') || scheme.occupations.includes(occupation)
    const catOk = scheme.categories.includes('all') || scheme.categories.includes(category)
    return incomeOk && occOk && catOk
  })
}

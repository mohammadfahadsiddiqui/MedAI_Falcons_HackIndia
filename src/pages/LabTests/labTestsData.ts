// ── Lab Test Catalog Data ────────────────────────────────────────────────────

export interface CatalogTest {
    id: string;
    name: string;
    category: string;
    icon: string;
    price: number;
    originalPrice: number;
    turnaround: string;
    sampleType: string;
    fasting: boolean;
    popular: boolean;
    description: string;
}

export interface TestPackage {
    id: string;
    name: string;
    icon: string;
    price: number;
    originalPrice: number;
    testsCount: number;
    description: string;
    includes: string[];
    recommended: string;
    badge?: string;
}

export const TEST_CATEGORIES = [
    'All', 'Blood', 'Diabetes', 'Heart', 'Liver', 'Kidney', 'Thyroid',
    'Hormones', 'Vitamins', 'Infection', 'Cancer Markers', 'Urine', 'Allergy',
] as const;

export const CATALOG_TESTS: CatalogTest[] = [
    // ── BLOOD ──
    { id: 'cbc', name: 'Complete Blood Count (CBC)', category: 'Blood', icon: '🩸', price: 299, originalPrice: 499, turnaround: '4–6 hrs', sampleType: 'Blood', fasting: false, popular: true, description: 'Measures RBC, WBC, hemoglobin, hematocrit, and platelets.' },
    { id: 'esr', name: 'ESR (Erythrocyte Sedimentation Rate)', category: 'Blood', icon: '🩸', price: 149, originalPrice: 249, turnaround: '4 hrs', sampleType: 'Blood', fasting: false, popular: false, description: 'Detects inflammation, infection, and autoimmune conditions.' },
    { id: 'pbt', name: 'Peripheral Blood Smear', category: 'Blood', icon: '🩸', price: 199, originalPrice: 349, turnaround: '6 hrs', sampleType: 'Blood', fasting: false, popular: false, description: 'Evaluates blood cell morphology and detects blood disorders.' },
    { id: 'bloodgroup', name: 'Blood Group & Rh Typing', category: 'Blood', icon: '🩸', price: 99, originalPrice: 199, turnaround: '2 hrs', sampleType: 'Blood', fasting: false, popular: true, description: 'Determines ABO blood group and Rh factor.' },
    { id: 'pt', name: 'Prothrombin Time (PT/INR)', category: 'Blood', icon: '🩸', price: 249, originalPrice: 399, turnaround: '4 hrs', sampleType: 'Blood', fasting: false, popular: false, description: 'Tests blood clotting ability and monitors anticoagulant therapy.' },
    { id: 'dimer', name: 'D-Dimer Test', category: 'Blood', icon: '🩸', price: 799, originalPrice: 1200, turnaround: '6 hrs', sampleType: 'Blood', fasting: false, popular: false, description: 'Rules out blood clots, DVT, and pulmonary embolism.' },

    // ── DIABETES ──
    { id: 'fbs', name: 'Fasting Blood Sugar (FBS)', category: 'Diabetes', icon: '🍬', price: 99, originalPrice: 199, turnaround: '3 hrs', sampleType: 'Blood', fasting: true, popular: true, description: 'Measures blood glucose after 8–12 hours fasting.' },
    { id: 'ppbs', name: 'Post-Prandial Blood Sugar (PPBS)', category: 'Diabetes', icon: '🍬', price: 99, originalPrice: 199, turnaround: '3 hrs', sampleType: 'Blood', fasting: false, popular: false, description: 'Blood glucose measured 2 hours after a meal.' },
    { id: 'hba1c', name: 'HbA1c (Glycated Hemoglobin)', category: 'Diabetes', icon: '🍬', price: 349, originalPrice: 599, turnaround: '4 hrs', sampleType: 'Blood', fasting: false, popular: true, description: 'Average blood glucose over the past 2–3 months; key for diabetes management.' },
    { id: 'rbs', name: 'Random Blood Sugar (RBS)', category: 'Diabetes', icon: '🍬', price: 79, originalPrice: 149, turnaround: '2 hrs', sampleType: 'Blood', fasting: false, popular: false, description: 'Quick glucose test done at any time, no fasting required.' },
    { id: 'insulin', name: 'Fasting Insulin Level', category: 'Diabetes', icon: '🍬', price: 599, originalPrice: 899, turnaround: '6 hrs', sampleType: 'Blood', fasting: true, popular: false, description: 'Checks insulin resistance and pancreatic function.' },
    { id: 'ogtt', name: 'Oral Glucose Tolerance Test (OGTT)', category: 'Diabetes', icon: '🍬', price: 249, originalPrice: 399, turnaround: '3 hrs', sampleType: 'Blood', fasting: true, popular: false, description: 'Diagnoses gestational diabetes and pre-diabetes.' },

    // ── HEART ──
    { id: 'lipid', name: 'Lipid Profile (Full)', category: 'Heart', icon: '❤️', price: 399, originalPrice: 699, turnaround: '5 hrs', sampleType: 'Blood', fasting: true, popular: true, description: 'Total cholesterol, LDL, HDL, VLDL, and triglycerides.' },
    { id: 'trop', name: 'Troponin I (Cardiac)', category: 'Heart', icon: '❤️', price: 899, originalPrice: 1499, turnaround: '4 hrs', sampleType: 'Blood', fasting: false, popular: false, description: 'Detects heart muscle damage; used in chest pain/heart attack diagnosis.' },
    { id: 'crp', name: 'C-Reactive Protein (CRP)', category: 'Heart', icon: '❤️', price: 349, originalPrice: 599, turnaround: '4 hrs', sampleType: 'Blood', fasting: false, popular: false, description: 'Marker of inflammation; elevated in cardiovascular risk.' },
    { id: 'homocys', name: 'Homocysteine', category: 'Heart', icon: '❤️', price: 799, originalPrice: 1299, turnaround: '6 hrs', sampleType: 'Blood', fasting: true, popular: false, description: 'Elevated levels increase risk of heart disease and stroke.' },
    { id: 'bnp', name: 'NT-proBNP (Heart Failure Marker)', category: 'Heart', icon: '❤️', price: 1499, originalPrice: 2499, turnaround: '6 hrs', sampleType: 'Blood', fasting: false, popular: false, description: 'Diagnoses and monitors heart failure severity.' },

    // ── LIVER ──
    { id: 'lft', name: 'Liver Function Test (LFT)', category: 'Liver', icon: '🫀', price: 499, originalPrice: 799, turnaround: '5 hrs', sampleType: 'Blood', fasting: false, popular: true, description: 'SGOT, SGPT, ALP, bilirubin, albumin, and total protein.' },
    { id: 'hbsag', name: 'HBsAg (Hepatitis B Antigen)', category: 'Liver', icon: '🫀', price: 299, originalPrice: 499, turnaround: '4 hrs', sampleType: 'Blood', fasting: false, popular: true, description: 'Detects active Hepatitis B virus infection.' },
    { id: 'hcv', name: 'Anti-HCV (Hepatitis C)', category: 'Liver', icon: '🫀', price: 349, originalPrice: 599, turnaround: '4 hrs', sampleType: 'Blood', fasting: false, popular: false, description: 'Screens for Hepatitis C virus antibodies.' },
    { id: 'ggt', name: 'GGT (Gamma-Glutamyl Transferase)', category: 'Liver', icon: '🫀', price: 199, originalPrice: 349, turnaround: '4 hrs', sampleType: 'Blood', fasting: false, popular: false, description: 'Sensitive marker for liver disease and alcohol-related damage.' },

    // ── KIDNEY ──
    { id: 'kft', name: 'Kidney Function Test (KFT/RFT)', category: 'Kidney', icon: '🫘', price: 449, originalPrice: 749, turnaround: '5 hrs', sampleType: 'Blood', fasting: false, popular: true, description: 'Creatinine, urea, uric acid, and electrolytes (Na, K, Cl).' },
    { id: 'crea', name: 'Serum Creatinine', category: 'Kidney', icon: '🫘', price: 149, originalPrice: 249, turnaround: '3 hrs', sampleType: 'Blood', fasting: false, popular: false, description: 'Key marker for kidney filtration function.' },
    { id: 'uricacid', name: 'Uric Acid', category: 'Kidney', icon: '🫘', price: 149, originalPrice: 249, turnaround: '3 hrs', sampleType: 'Blood', fasting: false, popular: false, description: 'Elevated levels cause gout and kidney stones.' },
    { id: 'microalb', name: 'Microalbumin (Urine)', category: 'Kidney', icon: '🫘', price: 299, originalPrice: 499, turnaround: '4 hrs', sampleType: 'Urine', fasting: false, popular: false, description: 'Early indicator of kidney damage in diabetics.' },

    // ── THYROID ──
    { id: 'tsh', name: 'TSH (Thyroid Stimulating Hormone)', category: 'Thyroid', icon: '🦋', price: 299, originalPrice: 499, turnaround: '5 hrs', sampleType: 'Blood', fasting: false, popular: true, description: 'Primary screening test for thyroid function.' },
    { id: 'ft3ft4', name: 'Free T3 & Free T4', category: 'Thyroid', icon: '🦋', price: 499, originalPrice: 799, turnaround: '5 hrs', sampleType: 'Blood', fasting: false, popular: false, description: 'Active thyroid hormones; diagnoses hypo/hyperthyroidism.' },
    { id: 'thyroid3', name: 'Thyroid Profile (TSH + T3 + T4)', category: 'Thyroid', icon: '🦋', price: 599, originalPrice: 999, turnaround: '6 hrs', sampleType: 'Blood', fasting: false, popular: true, description: 'Complete thyroid function panel.' },
    { id: 'tpo', name: 'Anti-TPO Antibodies', category: 'Thyroid', icon: '🦋', price: 699, originalPrice: 1099, turnaround: '6 hrs', sampleType: 'Blood', fasting: false, popular: false, description: 'Detects autoimmune thyroid disease (Hashimoto\'s, Graves\').' },

    // ── HORMONES ──
    { id: 'testosterone', name: 'Testosterone (Total)', category: 'Hormones', icon: '⚡', price: 599, originalPrice: 999, turnaround: '6 hrs', sampleType: 'Blood', fasting: false, popular: false, description: 'Assesses male reproductive health and hormone levels.' },
    { id: 'estrogen', name: 'Estradiol (E2)', category: 'Hormones', icon: '⚡', price: 599, originalPrice: 999, turnaround: '6 hrs', sampleType: 'Blood', fasting: false, popular: false, description: 'Key female sex hormone; evaluates fertility and menopause.' },
    { id: 'lhfsh', name: 'LH & FSH (Fertility Hormones)', category: 'Hormones', icon: '⚡', price: 799, originalPrice: 1299, turnaround: '6 hrs', sampleType: 'Blood', fasting: false, popular: false, description: 'Evaluates ovarian reserve and male fertility.' },
    { id: 'prolactin', name: 'Prolactin', category: 'Hormones', icon: '⚡', price: 449, originalPrice: 749, turnaround: '5 hrs', sampleType: 'Blood', fasting: false, popular: false, description: 'Elevated in pituitary disorders and infertility causes.' },
    { id: 'cortisol', name: 'Cortisol (Serum)', category: 'Hormones', icon: '⚡', price: 549, originalPrice: 899, turnaround: '5 hrs', sampleType: 'Blood', fasting: false, popular: false, description: 'Stress hormone; assesses adrenal function.' },

    // ── VITAMINS ──
    { id: 'vitd', name: 'Vitamin D (25-OH)', category: 'Vitamins', icon: '☀️', price: 799, originalPrice: 1299, turnaround: '6 hrs', sampleType: 'Blood', fasting: false, popular: true, description: 'Detects Vitamin D deficiency — extremely common in South Asia.' },
    { id: 'vitb12', name: 'Vitamin B12', category: 'Vitamins', icon: '☀️', price: 599, originalPrice: 999, turnaround: '5 hrs', sampleType: 'Blood', fasting: false, popular: true, description: 'Deficiency causes fatigue, nerve damage, and anemia.' },
    { id: 'iron', name: 'Iron Studies (Fe, TIBC, Ferritin)', category: 'Vitamins', icon: '☀️', price: 699, originalPrice: 1099, turnaround: '6 hrs', sampleType: 'Blood', fasting: false, popular: false, description: 'Complete iron status panel; diagnoses iron-deficiency anemia.' },
    { id: 'folate', name: 'Folate (Folic Acid)', category: 'Vitamins', icon: '☀️', price: 499, originalPrice: 799, turnaround: '5 hrs', sampleType: 'Blood', fasting: false, popular: false, description: 'Critical in pregnancy; deficiency causes neural tube defects.' },
    { id: 'vita', name: 'Vitamin A (Retinol)', category: 'Vitamins', icon: '☀️', price: 599, originalPrice: 999, turnaround: '6 hrs', sampleType: 'Blood', fasting: false, popular: false, description: 'Assesses vision health and immune function.' },

    // ── INFECTION ──
    { id: 'widal', name: 'Widal Test (Typhoid)', category: 'Infection', icon: '🦠', price: 199, originalPrice: 349, turnaround: '4 hrs', sampleType: 'Blood', fasting: false, popular: true, description: 'Detects Salmonella typhi antibodies for typhoid fever.' },
    { id: 'dengue', name: 'Dengue NS1 Antigen + IgM/IgG', category: 'Infection', icon: '🦠', price: 799, originalPrice: 1299, turnaround: '4 hrs', sampleType: 'Blood', fasting: false, popular: true, description: 'Rapid dengue fever detection panel.' },
    { id: 'malaria', name: 'Malaria Antigen (RDT + Smear)', category: 'Infection', icon: '🦠', price: 249, originalPrice: 399, turnaround: '3 hrs', sampleType: 'Blood', fasting: false, popular: false, description: 'Rapid malaria parasite detection.' },
    { id: 'hiv', name: 'HIV 1 & 2 Antibody Test', category: 'Infection', icon: '🦠', price: 299, originalPrice: 499, turnaround: '4 hrs', sampleType: 'Blood', fasting: false, popular: false, description: 'Confidential HIV screening test.' },
    { id: 'covid', name: 'COVID-19 RT-PCR', category: 'Infection', icon: '🦠', price: 499, originalPrice: 799, turnaround: '12 hrs', sampleType: 'Swab', fasting: false, popular: false, description: 'Gold standard PCR test for active COVID-19 infection.' },
    { id: 'crphs', name: 'High-Sensitivity CRP (hsCRP)', category: 'Infection', icon: '🦠', price: 499, originalPrice: 799, turnaround: '5 hrs', sampleType: 'Blood', fasting: false, popular: false, description: 'Detects low-grade chronic inflammation and infection.' },

    // ── CANCER MARKERS ──
    { id: 'psa', name: 'PSA (Prostate Specific Antigen)', category: 'Cancer Markers', icon: '🔬', price: 699, originalPrice: 1099, turnaround: '6 hrs', sampleType: 'Blood', fasting: false, popular: false, description: 'Prostate cancer screening; also elevated in BPH.' },
    { id: 'cea', name: 'CEA (Carcinoembryonic Antigen)', category: 'Cancer Markers', icon: '🔬', price: 799, originalPrice: 1299, turnaround: '6 hrs', sampleType: 'Blood', fasting: false, popular: false, description: 'Tumor marker for colorectal, lung, and breast cancer monitoring.' },
    { id: 'afp', name: 'AFP (Alpha-Fetoprotein)', category: 'Cancer Markers', icon: '🔬', price: 699, originalPrice: 1099, turnaround: '6 hrs', sampleType: 'Blood', fasting: false, popular: false, description: 'Liver cancer and testicular cancer marker.' },
    { id: 'ca125', name: 'CA-125 (Ovarian Cancer Marker)', category: 'Cancer Markers', icon: '🔬', price: 899, originalPrice: 1499, turnaround: '6 hrs', sampleType: 'Blood', fasting: false, popular: false, description: 'Ovarian cancer screening and monitoring.' },
    { id: 'ca199', name: 'CA 19-9 (Pancreatic Marker)', category: 'Cancer Markers', icon: '🔬', price: 899, originalPrice: 1499, turnaround: '6 hrs', sampleType: 'Blood', fasting: false, popular: false, description: 'Pancreatic and biliary tract cancer marker.' },

    // ── URINE ──
    { id: 'urine', name: 'Urine Routine & Microscopy', category: 'Urine', icon: '💧', price: 99, originalPrice: 199, turnaround: '3 hrs', sampleType: 'Urine', fasting: false, popular: true, description: 'Physical, chemical, and microscopic examination of urine.' },
    { id: 'urine24', name: '24-Hour Urine Protein', category: 'Urine', icon: '💧', price: 299, originalPrice: 499, turnaround: '6 hrs', sampleType: 'Urine', fasting: false, popular: false, description: 'Quantifies protein loss — key for kidney disease monitoring.' },
    { id: 'uce', name: 'Urine Culture & Sensitivity', category: 'Urine', icon: '💧', price: 499, originalPrice: 799, turnaround: '48 hrs', sampleType: 'Urine', fasting: false, popular: false, description: 'Identifies UTI-causing bacteria and best antibiotic treatment.' },

    // ── ALLERGY ──
    { id: 'ige', name: 'Total IgE (Allergy Screen)', category: 'Allergy', icon: '🌸', price: 499, originalPrice: 799, turnaround: '6 hrs', sampleType: 'Blood', fasting: false, popular: false, description: 'Elevated in allergic conditions, asthma, and parasitic infections.' },
    { id: 'rast', name: 'Food Allergy Panel (20 allergens)', category: 'Allergy', icon: '🌸', price: 2499, originalPrice: 3999, turnaround: '24 hrs', sampleType: 'Blood', fasting: false, popular: false, description: 'IgE antibodies to common food allergens — wheat, milk, eggs, nuts, etc.' },
    { id: 'pollen', name: 'Inhalant Allergy Panel', category: 'Allergy', icon: '🌸', price: 1999, originalPrice: 3499, turnaround: '24 hrs', sampleType: 'Blood', fasting: false, popular: false, description: 'Tests for dust mite, pollen, pet dander, and mold allergies.' },
];

export const TEST_PACKAGES: TestPackage[] = [
    {
        id: 'pkg-basic', name: 'Basic Health Checkup', icon: '🌟', price: 699, originalPrice: 1499, testsCount: 7,
        badge: 'POPULAR', recommended: 'Annual screening for adults',
        description: 'Essential health screening — perfect for your yearly checkup.',
        includes: ['CBC', 'Blood Sugar (Fasting)', 'Lipid Profile', 'Urine Routine', 'KFT', 'LFT', 'TSH'],
    },
    {
        id: 'pkg-comprehensive', name: 'Comprehensive Health Package', icon: '💎', price: 1499, originalPrice: 3499, testsCount: 16,
        badge: 'BEST VALUE', recommended: 'Adults 30+ years',
        description: 'Our most thorough health package covering all major organ systems.',
        includes: ['CBC + ESR', 'Blood Group', 'FBS + HbA1c', 'Lipid Profile', 'LFT', 'KFT', 'Urine Routine', 'Thyroid Profile (T3+T4+TSH)', 'Vitamin D', 'Vitamin B12', 'Iron Studies', 'CRP', 'ECG (at centre)', 'Chest X-Ray', 'Eye Checkup', 'Doctor Consultation'],
    },
    {
        id: 'pkg-diabetes', name: 'Diabetes Management Panel', icon: '🍬', price: 799, originalPrice: 1699, testsCount: 7,
        badge: 'DIABETIC CARE', recommended: 'Diabetics — every 3 months',
        description: 'Complete diabetes monitoring package recommended every 3 months.',
        includes: ['HbA1c', 'Fasting Blood Sugar', 'Post-Prandial Sugar', 'Fasting Insulin', 'Microalbumin (Urine)', 'KFT', 'Lipid Profile'],
    },
    {
        id: 'pkg-cardiac', name: 'Cardiac Risk Assessment', icon: '❤️', price: 999, originalPrice: 2199, testsCount: 8,
        badge: 'HEART HEALTH', recommended: 'Adults with family history of heart disease',
        description: 'Comprehensive cardiovascular risk panel for early detection.',
        includes: ['Lipid Profile (Full)', 'hsCRP (High Sensitivity)', 'Homocysteine', 'Troponin I', 'NT-proBNP', 'ECG', 'Fasting Blood Sugar', 'HbA1c'],
    },
    {
        id: 'pkg-thyroid', name: 'Thyroid Complete Panel', icon: '🦋', price: 899, originalPrice: 1799, testsCount: 5,
        badge: 'THYROID CARE', recommended: 'Women of all ages, fatigue/weight concerns',
        description: 'Full thyroid assessment including antibodies for autoimmune detection.',
        includes: ['TSH', 'Free T3', 'Free T4', 'Anti-TPO Antibodies', 'Anti-Thyroglobulin Antibodies'],
    },
    {
        id: 'pkg-fertility', name: 'Fertility Hormone Panel', icon: '👶', price: 1299, originalPrice: 2699, testsCount: 8,
        badge: 'FERTILITY', recommended: 'Couples planning pregnancy',
        description: 'Comprehensive fertility assessment for both men and women.',
        includes: ['LH & FSH', 'Estradiol (E2)', 'Testosterone', 'Prolactin', 'AMH (Ovarian Reserve)', 'Progesterone', 'Thyroid Profile', 'Vitamin D'],
    },
    {
        id: 'pkg-vitamin', name: 'Vitamin & Nutrition Panel', icon: '☀️', price: 1199, originalPrice: 2499, testsCount: 6,
        badge: 'WELLNESS', recommended: 'Fatigue, hair loss, bone pain',
        description: 'Identifies nutritional deficiencies — the #1 cause of unexplained fatigue.',
        includes: ['Vitamin D (25-OH)', 'Vitamin B12', 'Vitamin A', 'Folate (B9)', 'Iron + Ferritin', 'Calcium (Serum)'],
    },
    {
        id: 'pkg-cancer', name: 'Cancer Marker Screening', icon: '🔬', price: 2499, originalPrice: 4999, testsCount: 7,
        badge: 'PREVENTIVE', recommended: 'Adults 40+ with family history',
        description: 'Early cancer marker screening for high-risk individuals.',
        includes: ['PSA (for men)', 'CA-125 (for women)', 'CEA', 'AFP', 'CA 19-9', 'Beta-2 Microglobulin', 'CBC'],
    },
    {
        id: 'pkg-women', name: 'Women\'s Wellness Package', icon: '👩‍⚕️', price: 1799, originalPrice: 3799, testsCount: 14,
        badge: 'WOMEN\'S HEALTH', recommended: 'Women 25+ years',
        description: 'Comprehensive health panel designed for women\'s unique health needs.',
        includes: ['CBC', 'Thyroid Profile', 'Vitamin D + B12', 'Iron Studies', 'Estradiol', 'FSH + LH', 'Prolactin', 'Calcium', 'Blood Sugar', 'Lipid Profile', 'LFT', 'KFT', 'Urine Routine', 'Pap Smear'],
    },
];

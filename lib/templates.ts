export interface TestField {
  name: string;
  unit: string;
  normalRange: string;
}

export interface LabTemplate {
  id: string;
  name: string;
  fields: TestField[];
}

export const LAB_TEMPLATES: LabTemplate[] = [
  {
    id: 'cbc',
    name: 'Complete Blood Count (CBC)',
    fields: [
      { name: 'Hemoglobin', unit: 'g/dL', normalRange: '13.0 - 17.0' },
      { name: 'RBC Count', unit: 'mill/cumm', normalRange: '4.5 - 5.5' },
      { name: 'WBC Count', unit: 'cells/cumm', normalRange: '4000 - 11000' },
      { name: 'Platelet Count', unit: 'lakhs/cumm', normalRange: '1.5 - 4.5' },
      { name: 'Hematocrit (PCV)', unit: '%', normalRange: '40 - 50' },
    ],
  },
  {
    id: 'hba1c',
    name: 'HbA1c',
    fields: [
      { name: 'Glycosylated Hemoglobin (HbA1c)', unit: '%', normalRange: '4.0 - 5.6' },
      { name: 'Estimated Average Glucose (eAG)', unit: 'mg/dL', normalRange: '70 - 126' },
    ],
  },
  {
    id: 'lipid',
    name: 'Lipid Profile',
    fields: [
      { name: 'Total Cholesterol', unit: 'mg/dL', normalRange: '< 200' },
      { name: 'HDL Cholesterol', unit: 'mg/dL', normalRange: '> 40' },
      { name: 'LDL Cholesterol', unit: 'mg/dL', normalRange: '< 100' },
      { name: 'Triglycerides', unit: 'mg/dL', normalRange: '< 150' },
      { name: 'VLDL Cholesterol', unit: 'mg/dL', normalRange: '2 - 30' },
    ],
  },
  {
    id: 'lft',
    name: 'Liver Function Test (LFT)',
    fields: [
      { name: 'Total Bilirubin', unit: 'mg/dL', normalRange: '0.2 - 1.2' },
      { name: 'Direct Bilirubin', unit: 'mg/dL', normalRange: '< 0.3' },
      { name: 'SGOT (AST)', unit: 'U/L', normalRange: '5 - 40' },
      { name: 'SGPT (ALT)', unit: 'U/L', normalRange: '7 - 56' },
      { name: 'Alkaline Phosphatase', unit: 'U/L', normalRange: '44 - 147' },
      { name: 'Total Protein', unit: 'g/dL', normalRange: '6.0 - 8.3' },
      { name: 'Albumin', unit: 'g/dL', normalRange: '3.4 - 5.4' },
    ],
  },
  {
    id: 'kft',
    name: 'Kidney Function Test (KFT)',
    fields: [
      { name: 'Blood Urea Nitrogen (BUN)', unit: 'mg/dL', normalRange: '7 - 20' },
      { name: 'Serum Creatinine', unit: 'mg/dL', normalRange: '0.6 - 1.2' },
      { name: 'Uric Acid', unit: 'mg/dL', normalRange: '3.5 - 7.2' },
      { name: 'Calcium', unit: 'mg/dL', normalRange: '8.5 - 10.2' },
      { name: 'Phosphorus', unit: 'mg/dL', normalRange: '2.5 - 4.5' },
    ],
  },
  {
    id: 'thyroid',
    name: 'Thyroid Profile',
    fields: [
      { name: 'Total T3', unit: 'ng/dL', normalRange: '80 - 200' },
      { name: 'Total T4', unit: 'ug/dL', normalRange: '5.1 - 14.1' },
      { name: 'TSH', unit: 'uIU/mL', normalRange: '0.27 - 4.2' },
    ],
  },
  {
    id: 'bsf',
    name: 'Blood Sugar (Fasting)',
    fields: [
      { name: 'Fasting Blood Sugar', unit: 'mg/dL', normalRange: '70 - 100' },
    ],
  },
  {
    id: 'bspp',
    name: 'Blood Sugar (Post Prandial)',
    fields: [
      { name: 'Post Prandial Blood Sugar', unit: 'mg/dL', normalRange: '< 140' },
    ],
  },
  {
    id: 'vitd',
    name: 'Vitamin D',
    fields: [
      { name: '25-OH Vitamin D', unit: 'ng/mL', normalRange: '30 - 100' },
    ],
  },
  {
    id: 'vitb12',
    name: 'Vitamin B12',
    fields: [
      { name: 'Vitamin B12', unit: 'pg/mL', normalRange: '211 - 911' },
    ],
  },
];

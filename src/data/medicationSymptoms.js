const SYMPTOM_TYPE_MAP = {
  '두통': ['HEADACHE'],
  '발열': ['FEVER'],
  '기침': ['COUGH'],
  '인후통': ['SORE_THROAT'],
  '콧물': ['RUNNY_NOSE'],
  '코막힘': ['NASAL_CONGESTION'],
  '콧물·코막힘': ['RUNNY_NOSE', 'NASAL_CONGESTION'],
  '복통': ['ABDOMINAL_PAIN'],
  '소화불량': ['INDIGESTION'],
  '속쓰림': ['HEARTBURN'],
  '소화불량·속쓰림': ['INDIGESTION', 'HEARTBURN'],
  '설사': ['DIARRHEA'],
  '변비': ['CONSTIPATION'],
  '메스꺼움': ['NAUSEA_OR_VOMITING'],
  '구토': ['NAUSEA_OR_VOMITING'],
  '구토/메스꺼움': ['NAUSEA_OR_VOMITING'],
  '근육통': ['MUSCLE_PAIN'],
  '생리통': ['MENSTRUAL_CRAMPS'],
  '치통': ['TOOTHACHE'],
  '알레르기': ['ALLERGY'],
  '피부 가려움': ['ITCHY_SKIN'],
  '가려움': ['ITCHY_SKIN'],
  '몸살': ['BODY_ACHES'],
  '어지러움': ['DIZZINESS'],
  '오한': ['CHILLS'],
}

const MEDICATION_SYMPTOM_TYPE_SET = new Set(Object.values(SYMPTOM_TYPE_MAP).flat())

export function toMedicationSymptomTypes(symptoms) {
  return [...new Set(symptoms.flatMap((symptom) => SYMPTOM_TYPE_MAP[symptom] ?? []))]
}

export function findUnsupportedMedicationSymptoms(symptoms) {
  return symptoms.filter((symptom) => !SYMPTOM_TYPE_MAP[symptom])
}

export function isMedicationSymptomType(value) {
  return MEDICATION_SYMPTOM_TYPE_SET.has(value)
}

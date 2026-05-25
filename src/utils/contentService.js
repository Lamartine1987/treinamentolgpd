import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { unitsData as initialUnitsData } from '../data/questions';

const COURSE_DOC_REF = doc(db, 'content', 'course');

export const fetchCourseContent = async () => {
  try {
    const docSnap = await getDoc(COURSE_DOC_REF);
    if (docSnap.exists()) {
      return docSnap.data().units;
    } else {
      // Semeia o banco de dados inicial se não existir
      await setDoc(COURSE_DOC_REF, { units: initialUnitsData });
      return initialUnitsData;
    }
  } catch (error) {
    console.error("Error fetching course content:", error);
    return initialUnitsData; // Fallback para não quebrar o app offline
  }
};

export const saveCourseContent = async (newUnits) => {
  try {
    await updateDoc(COURSE_DOC_REF, { units: newUnits });
  } catch (error) {
    console.error("Error saving course content:", error);
    throw error;
  }
};

export const computeAllStages = (units) => {
  if (!units) return [];
  let globalIndex = 0;
  const flatStages = [];
  units.forEach((unit) => {
    if (!unit.stages) return;
    unit.stages.forEach((stage, sIdx) => {
      flatStages.push({
        ...stage,
        globalIndex: globalIndex++,
        unitId: unit.id,
        unitTitle: unit.title,
        unitObjective: unit.objective,
        unitIntroText: unit.introText,
        isFirstInUnit: sIdx === 0,
        isLastInUnit: sIdx === unit.stages.length - 1
      });
    });
  });
  return flatStages;
};

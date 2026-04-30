import type { TubeModel } from '@/types/tone-stack';

/**
 * Vacuum tube reference data derived from Duncan Amps TDSL database.
 * Used by the DSP engine for accurate tube stage modeling and by the UI
 * for displaying tube specifications in the amp detail views.
 *
 * Source data: /public/tubes/*.md, /public/models/*.md
 */

export const tube12AX7: TubeModel = {
  id: 'tube-12ax7',
  designation: '12AX7',
  type: 'preamp-triode',
  description: 'High-gain dual triode — the standard preamp tube in virtually all guitar amplifiers. Also known as ECC83.',
  substitutes: ['ECC83', '7025', '5751', '12AX7A', 'CV4004'],
  ratings: {
    heaterVoltage: 6.3,
    heaterCurrent: 0.3,
    maxPlateVoltage: 300,
    maxHeaterCathodeVoltage: 100,
    maxPlateWatts: 1.8,
    maxCathodeCurrent: 12,
  },
  applicationData: [
    {
      class: 'Triode',
      plateVoltage: 100,
      gridVoltage: -1,
      plateCurrent: 0.5,
      plateResistance: 80000,
      transconductance: 1.25,
      notes: 'Low-voltage operation',
    },
    {
      class: 'Triode',
      plateVoltage: 250,
      gridVoltage: -2,
      plateCurrent: 1.2,
      plateResistance: 62500,
      transconductance: 1.6,
      notes: 'Standard operating point',
    },
  ],
};

export const tube12AU7: TubeModel = {
  id: 'tube-12au7',
  designation: '12AU7',
  type: 'preamp-triode',
  description: 'Medium-gain dual triode used in phase inverters and reverb drivers. Lower gain than 12AX7 with better linearity.',
  substitutes: ['ECC82', '5814', '5963', 'CV4003'],
  ratings: {
    heaterVoltage: 6.3,
    heaterCurrent: 0.3,
    maxPlateVoltage: 300,
    maxHeaterCathodeVoltage: 100,
    maxPlateWatts: 2.75,
    maxCathodeCurrent: 20,
  },
  applicationData: [
    {
      class: 'Triode',
      plateVoltage: 250,
      gridVoltage: -8.5,
      plateCurrent: 10.5,
      plateResistance: 7700,
      transconductance: 2.2,
      notes: 'Standard operating point',
    },
  ],
};

export const tube12BH7: TubeModel = {
  id: 'tube-12bh7',
  designation: '12BH7',
  type: 'preamp-triode',
  description: 'High-current dual triode used in power amp driver stages and phase inverters. Higher plate dissipation than 12AU7.',
  substitutes: ['12BH7A'],
  ratings: {
    heaterVoltage: 6.3,
    heaterCurrent: 0.3,
    maxPlateVoltage: 450,
    maxHeaterCathodeVoltage: 200,
    maxPlateWatts: 3.5,
    maxCathodeCurrent: 20,
  },
  applicationData: [
    {
      class: 'Triode',
      plateVoltage: 250,
      gridVoltage: -10,
      plateCurrent: 11.5,
      plateResistance: 5300,
      transconductance: 3.1,
      notes: 'Standard operating point',
    },
  ],
};

export const tubeEL34: TubeModel = {
  id: 'tube-el34',
  designation: 'EL34',
  type: 'power-pentode',
  description: 'Power pentode — the signature tube of Marshall and many British amps. Rich harmonic content with aggressive midrange breakup.',
  substitutes: ['6CA7', 'KT77'],
  ratings: {
    heaterVoltage: 6.3,
    heaterCurrent: 1.5,
    maxPlateVoltage: 800,
    maxScreenVoltage: 500,
    maxHeaterCathodeVoltage: 100,
    maxPlateWatts: 25,
    maxScreenWatts: 8,
    maxCathodeCurrent: 150,
  },
  applicationData: [
    {
      class: 'A S/E',
      plateVoltage: 250,
      screenVoltage: 265,
      gridVoltage: -14.5,
      plateCurrent: 70,
      screenCurrent: 10,
      plateResistance: 15000,
      transconductance: 11,
      outputPower: 11,
      thd: 10,
      notes: 'Single-ended Class A',
    },
    {
      class: 'AB1 P/P',
      plateVoltage: 375,
      screenVoltage: 400,
      gridVoltage: -38,
      plateCurrent: 60,
      screenCurrent: 8.8,
      loadImpedance: 4000,
      outputPower: 45,
      thd: 6,
      notes: 'Push-pull, shared Rg2 = 1000 ohms',
    },
    {
      class: 'AB1 P/P',
      plateVoltage: 450,
      screenVoltage: 375,
      gridVoltage: -36,
      plateCurrent: 60,
      screenCurrent: 8.0,
      loadImpedance: 5000,
      outputPower: 58,
      thd: 6,
      notes: 'Push-pull high voltage, shared Rg2 = 750 ohms',
    },
  ],
};

export const tubeEL84: TubeModel = {
  id: 'tube-el84',
  designation: 'EL84',
  type: 'power-pentode',
  description: 'Compact power pentode — the heart of Vox AC15/AC30 and many smaller amps. Sweet, chimey breakup with pronounced harmonics.',
  substitutes: ['6BQ5', '7189', 'N709'],
  ratings: {
    heaterVoltage: 6.3,
    heaterCurrent: 0.76,
    maxPlateVoltage: 300,
    maxScreenVoltage: 300,
    maxHeaterCathodeVoltage: 100,
    maxPlateWatts: 12,
    maxScreenWatts: 2,
    maxCathodeCurrent: 65,
  },
  applicationData: [
    {
      class: 'A S/E',
      plateVoltage: 250,
      screenVoltage: 250,
      gridVoltage: -7.3,
      plateCurrent: 48,
      screenCurrent: 5.5,
      plateResistance: 38000,
      transconductance: 11,
      cathodeResistance: 135,
      loadImpedance: 5200,
      outputPower: 5.7,
      thd: 10,
      notes: 'Single-ended Class A',
    },
    {
      class: 'AB1 P/P',
      plateVoltage: 300,
      screenVoltage: 300,
      gridVoltage: -14.7,
      plateCurrent: 15,
      screenCurrent: 1.6,
      loadImpedance: 8000,
      outputPower: 17,
      thd: 10,
      notes: 'Push-pull Class AB1',
    },
  ],
};

export const tube6L6: TubeModel = {
  id: 'tube-6l6',
  designation: '6L6',
  type: 'power-beam-tetrode',
  description: 'Beam power tetrode — the American power tube. Clean headroom with tight low end, used in Fender, Mesa Boogie, and Peavey amps.',
  substitutes: ['6L6GC', '6L6GT', '5881', 'KT66'],
  ratings: {
    heaterVoltage: 6.3,
    heaterCurrent: 0.9,
    maxPlateVoltage: 360,
    maxScreenVoltage: 270,
    maxPlateWatts: 19,
    maxScreenWatts: 2.5,
  },
  applicationData: [
    {
      class: 'A S/E',
      plateVoltage: 350,
      screenVoltage: 250,
      gridVoltage: -18,
      plateCurrent: 54,
      screenCurrent: 2.5,
      plateResistance: 33000,
      transconductance: 5.2,
      cathodeResistance: 300,
      loadImpedance: 4200,
      outputPower: 11,
      thd: 15,
      notes: 'Single-ended Class A',
    },
    {
      class: 'AB2 P/P',
      plateVoltage: 360,
      screenVoltage: 270,
      gridVoltage: -22.5,
      plateCurrent: 69,
      screenCurrent: 8,
      loadImpedance: 6600,
      outputPower: 26.5,
      thd: 1.8,
      notes: 'Push-pull Class AB2',
    },
  ],
};

export const tubeKT88: TubeModel = {
  id: 'tube-kt88',
  designation: 'KT88',
  type: 'power-beam-tetrode',
  description: 'High-power beam tetrode — massive headroom and tight bass response. Used in high-end amps like Diezel VH4 and hi-fi amplifiers.',
  substitutes: ['6550', '6550A', 'KT90'],
  ratings: {
    heaterVoltage: 6.3,
    heaterCurrent: 1.6,
    maxPlateVoltage: 800,
    maxScreenVoltage: 600,
    maxHeaterCathodeVoltage: 200,
    maxPlateWatts: 42,
    maxScreenWatts: 8,
    maxCathodeCurrent: 230,
  },
  applicationData: [
    {
      class: 'AB1 P/P',
      plateVoltage: 553,
      screenVoltage: 300,
      plateCurrent: 64,
      screenCurrent: 1.7,
      cathodeResistance: 460,
      loadImpedance: 9000,
      outputPower: 50,
      thd: 3.0,
      notes: 'Push-pull, B+ = 560V',
    },
    {
      class: 'AB1 UL 40%',
      plateVoltage: 553,
      gridVoltage: -75,
      plateCurrent: 50,
      loadImpedance: 4500,
      outputPower: 100,
      thd: 2.0,
      notes: 'Ultralinear 40% taps',
    },
  ],
};

export const tubeModels: TubeModel[] = [
  tube12AX7,
  tube12AU7,
  tube12BH7,
  tubeEL34,
  tubeEL84,
  tube6L6,
  tubeKT88,
];

/** Lookup a tube model by designation (e.g., '12AX7', 'EL34'). */
export function getTubeByDesignation(designation: string): TubeModel | undefined {
  return tubeModels.find(
    (t) => t.designation.toLowerCase() === designation.toLowerCase(),
  );
}

/** Get all power tubes (pentodes and beam tetrodes). */
export function getPowerTubes(): TubeModel[] {
  return tubeModels.filter(
    (t) => t.type === 'power-pentode' || t.type === 'power-beam-tetrode',
  );
}

/** Get all preamp tubes. */
export function getPreampTubes(): TubeModel[] {
  return tubeModels.filter((t) => t.type === 'preamp-triode');
}

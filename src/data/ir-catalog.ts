import type { MicType } from '@/types/cabinet'

export interface IREntry {
  /** File path relative to /public */
  path: string
  /** Mic type category for the cabinet processor */
  micType: MicType
  /** Mic model name for display */
  micModel: string
  /** Position description */
  position: 'center' | 'offaxis' | 'edge' | 'mix'
  /** Variant label for multiple captures at same position */
  variant?: string
}

export interface CabinetIRSet {
  cabinetId: string
  defaultIR: string
  irs: IREntry[]
}

export const cabinetIRCatalog: CabinetIRSet[] = [
  // ── Winston 4x12 (Marshall) ──
  {
    cabinetId: 'cab-winston-4x12',
    defaultIR: '/IR/Marshall JCM800.wav',
    irs: [
      { path: '/IR/Marshall JCM800.wav', micType: 'dynamic', micModel: 'SM57', position: 'center', variant: 'JCM800' },
      { path: '/IR/Marshall DSL 2000.wav', micType: 'dynamic', micModel: 'SM57', position: 'center', variant: 'DSL2000' },
      { path: '/IR/Marshall JTM45.wav', micType: 'dynamic', micModel: 'SM57', position: 'center', variant: 'JTM45' },
      { path: '/IR/Marshall G15R.wav', micType: 'dynamic', micModel: 'SM57', position: 'center', variant: 'G15R' },
      { path: '/IR/Marshall JCM2000 SM57.wav', micType: 'dynamic', micModel: 'SM57', position: 'center', variant: 'JCM2000' },
      { path: '/IR/Marshall JCM2000 SM57 off Axis.wav', micType: 'dynamic', micModel: 'SM57', position: 'offaxis', variant: 'JCM2000' },
      { path: '/IR/Marshall JCM2000 SM57 II.wav', micType: 'dynamic', micModel: 'SM57', position: 'center', variant: 'JCM2000-II' },
      { path: '/IR/Marshall JCM2000 SM57 off Axis II.wav', micType: 'dynamic', micModel: 'SM57', position: 'offaxis', variant: 'JCM2000-II' },
      { path: '/IR/Marshall Plexi SM57.wav', micType: 'dynamic', micModel: 'SM57', position: 'center', variant: 'Plexi' },
      { path: '/IR/Marshall Plexi SM57 off Axis.wav', micType: 'dynamic', micModel: 'SM57', position: 'offaxis', variant: 'Plexi' },
      { path: '/IR/Marshall Plexi SM57 II.wav', micType: 'dynamic', micModel: 'SM57', position: 'center', variant: 'Plexi-II' },
      { path: '/IR/Marshall Plexi SM57 off Axis II.wav', micType: 'dynamic', micModel: 'SM57', position: 'offaxis', variant: 'Plexi-II' },
      { path: '/IR/Plexi Lead Channel.wav', micType: 'dynamic', micModel: 'SM57', position: 'center', variant: 'Plexi Lead' },
      { path: '/IR/Plexi Lead Channel off Axis.wav', micType: 'dynamic', micModel: 'SM57', position: 'offaxis', variant: 'Plexi Lead' },
      { path: '/IR/[Cabs] HiWat100.wav', micType: 'dynamic', micModel: 'SM57', position: 'center', variant: 'Hiwatt 100' },
      // G12T-75 speaker captures
      { path: '/IR/Marshall G12 1 SM57 3.wav', micType: 'dynamic', micModel: 'SM57', position: 'center', variant: 'G12 Pos3' },
      { path: '/IR/Marshall G12 1 SM57 4.wav', micType: 'dynamic', micModel: 'SM57', position: 'center', variant: 'G12 Pos4' },
      { path: '/IR/Marshall G12 4 SM57 5.wav', micType: 'dynamic', micModel: 'SM57', position: 'center', variant: 'G12-4 Pos5' },
      { path: '/IR/Marshall G12 4 SM57 6.wav', micType: 'dynamic', micModel: 'SM57', position: 'center', variant: 'G12-4 Pos6' },
      { path: '/IR/Marshall G12 4 SM58 1.wav', micType: 'dynamic', micModel: 'SM58', position: 'center', variant: 'G12-4 SM58-1' },
      { path: '/IR/Marshall G12 4 SM58 2.wav', micType: 'dynamic', micModel: 'SM58', position: 'center', variant: 'G12-4 SM58-2' },
      // 4x12 EQ presets
      { path: '/IR/4x12 British_EQ.wav', micType: 'dynamic', micModel: 'SM57', position: 'mix', variant: 'British EQ' },
      { path: '/IR/4x12 Metal British_EQ.wav', micType: 'dynamic', micModel: 'SM57', position: 'mix', variant: 'Metal British EQ' },
      { path: '/IR/4x12 M65_EQ.wav', micType: 'dynamic', micModel: 'SM57', position: 'mix', variant: 'M65 EQ' },
    ],
  },

  // ── Winston 4x12V (Marshall V30) ──
  {
    cabinetId: 'cab-winston-4x12v',
    defaultIR: '/IR/Marshall V30 2 SM57 1.wav',
    irs: [
      { path: '/IR/Marshall V30 2 SM57 1.wav', micType: 'dynamic', micModel: 'SM57', position: 'center', variant: 'V30-2 Pos1' },
      { path: '/IR/Marshall V30 2 SM57 2.wav', micType: 'dynamic', micModel: 'SM57', position: 'center', variant: 'V30-2 Pos2' },
      { path: '/IR/Marshall V30 2 SM57 3.wav', micType: 'dynamic', micModel: 'SM57', position: 'center', variant: 'V30-2 Pos3' },
      { path: '/IR/Marshall V30 2 SM57 4.wav', micType: 'dynamic', micModel: 'SM57', position: 'offaxis', variant: 'V30-2 Pos4' },
      { path: '/IR/Marshall V30 2 SM57 5.wav', micType: 'dynamic', micModel: 'SM57', position: 'offaxis', variant: 'V30-2 Pos5' },
      { path: '/IR/Marshall V30 2 SM57 6.wav', micType: 'dynamic', micModel: 'SM57', position: 'offaxis', variant: 'V30-2 Pos6' },
      { path: '/IR/Marshall V30 2 SM58 1.wav', micType: 'dynamic', micModel: 'SM58', position: 'center', variant: 'V30-2 SM58-1' },
      { path: '/IR/Marshall V30 2 SM58 2.wav', micType: 'dynamic', micModel: 'SM58', position: 'center', variant: 'V30-2 SM58-2' },
      { path: '/IR/Marshall V30 3 SM57 1.wav', micType: 'dynamic', micModel: 'SM57', position: 'center', variant: 'V30-3 Pos1' },
      { path: '/IR/Marshall V30 3 SM57 2.wav', micType: 'dynamic', micModel: 'SM57', position: 'center', variant: 'V30-3 Pos2' },
      { path: '/IR/Marshall V30 3 SM57 3.wav', micType: 'dynamic', micModel: 'SM57', position: 'offaxis', variant: 'V30-3 Pos3' },
      { path: '/IR/Marshall V30 3 SM58 1.wav', micType: 'dynamic', micModel: 'SM58', position: 'center', variant: 'V30-3 SM58-1' },
      { path: '/IR/21 4x12 Celestion Vint30W - SM57on.wav', micType: 'dynamic', micModel: 'SM57', position: 'center', variant: 'Celestion V30' },
      { path: '/IR/21 4x12 Celestion Vint30W - SM57off.wav', micType: 'dynamic', micModel: 'SM57', position: 'offaxis', variant: 'Celestion V30' },
      { path: '/IR/21 4x12 Celestion Vint30W - BD421.wav', micType: 'dynamic', micModel: 'MD421', position: 'center', variant: 'Celestion V30' },
      { path: '/IR/21 4x12 Celestion Vint30W - U67.wav', micType: 'condenser', micModel: 'U67', position: 'center', variant: 'Celestion V30' },
    ],
  },

  // ── Winston 2x12V ──
  {
    cabinetId: 'cab-winston-2x12v',
    defaultIR: '/IR/YA MES 212 V30 Mix 01.wav',
    irs: [
      { path: '/IR/YA MES 212 V30 Mix 01.wav', micType: 'dynamic', micModel: 'SM57', position: 'mix', variant: 'Mix 01' },
      { path: '/IR/YA MES 212 V30 Mix 02.wav', micType: 'dynamic', micModel: 'SM57', position: 'mix', variant: 'Mix 02' },
      { path: '/IR/YA MES 212 V30 Mix 03.wav', micType: 'dynamic', micModel: 'SM57', position: 'mix', variant: 'Mix 03' },
      { path: '/IR/YA MES 212 V30 Mix 10.wav', micType: 'dynamic', micModel: 'SM57', position: 'mix', variant: 'Mix 10' },
      { path: '/IR/YA MES 212 V30 Mix 12.wav', micType: 'dynamic', micModel: 'SM57', position: 'mix', variant: 'Mix 12' },
    ],
  },

  // ── Fuzzy 4x12 (Orange) ──
  {
    cabinetId: 'cab-fuzzy-4x12',
    defaultIR: '/IR/4x12 British_EQ.wav',
    irs: [
      { path: '/IR/4x12 British_EQ.wav', micType: 'dynamic', micModel: 'SM57', position: 'mix', variant: 'British EQ' },
      { path: '/IR/4x12 Metal British_EQ.wav', micType: 'dynamic', micModel: 'SM57', position: 'mix', variant: 'Metal British EQ' },
      { path: '/IR/4x12 Gazoline_EQ.wav', micType: 'dynamic', micModel: 'SM57', position: 'mix', variant: 'Gazoline EQ' },
      { path: '/IR/4x12 MFB_EQ.wav', micType: 'dynamic', micModel: 'SM57', position: 'mix', variant: 'MFB EQ' },
    ],
  },

  // ── Fuzzy 2x12 ──
  {
    cabinetId: 'cab-fuzzy-2x12',
    defaultIR: '/IR/2x12 Boutique_EQ.wav',
    irs: [
      { path: '/IR/2x12 Boutique_EQ.wav', micType: 'dynamic', micModel: 'SM57', position: 'mix', variant: 'Boutique EQ' },
      { path: '/IR/2x12 VC 30_EQ.wav', micType: 'dynamic', micModel: 'SM57', position: 'mix', variant: 'VC 30 EQ' },
    ],
  },

  // ── US Steel 4x12 (Mesa Boogie) ──
  {
    cabinetId: 'cab-us-steel-4x12',
    defaultIR: '/IR/22 4x12 Mesa Boogie - SM57on.wav',
    irs: [
      { path: '/IR/22 4x12 Mesa Boogie - SM57on.wav', micType: 'dynamic', micModel: 'SM57', position: 'center' },
      { path: '/IR/22 4x12 Mesa Boogie - SM57off.wav', micType: 'dynamic', micModel: 'SM57', position: 'offaxis' },
      { path: '/IR/22 4x12 Mesa Boogie - BD421.wav', micType: 'dynamic', micModel: 'MD421', position: 'center' },
      { path: '/IR/22 4x12 Mesa Boogie - U67.wav', micType: 'condenser', micModel: 'U67', position: 'center' },
      { path: '/IR/4x12 American_EQ.wav', micType: 'dynamic', micModel: 'SM57', position: 'mix', variant: 'American EQ' },
      { path: '/IR/4x12 Metal American_EQ.wav', micType: 'dynamic', micModel: 'SM57', position: 'mix', variant: 'Metal American EQ' },
    ],
  },

  // ── Twanger 1x12 (Fender) ──
  {
    cabinetId: 'cab-twanger-1',
    defaultIR: '/IR/06 1x12 1953 Fender Deluxe - SM57on.wav',
    irs: [
      { path: '/IR/06 1x12 1953 Fender Deluxe - SM57on.wav', micType: 'dynamic', micModel: 'SM57', position: 'center', variant: '53 Deluxe' },
      { path: '/IR/06 1x12 1953 Fender Deluxe - SM57off.wav', micType: 'dynamic', micModel: 'SM57', position: 'offaxis', variant: '53 Deluxe' },
      { path: '/IR/06 1x12 1953 Fender Deluxe - BD421.wav', micType: 'dynamic', micModel: 'MD421', position: 'center', variant: '53 Deluxe' },
      { path: '/IR/06 1x12 1953 Fender Deluxe - U67.wav', micType: 'condenser', micModel: 'U67', position: 'center', variant: '53 Deluxe' },
      { path: '/IR/07 1x12 1964 Fen Blackface - SM57on.wav', micType: 'dynamic', micModel: 'SM57', position: 'center', variant: 'Blackface' },
      { path: '/IR/07 1x12 1964 Fen Blackface - SM57off.wav', micType: 'dynamic', micModel: 'SM57', position: 'offaxis', variant: 'Blackface' },
      { path: '/IR/07 1x12 1964 Fen Blackface - BD421.wav', micType: 'dynamic', micModel: 'MD421', position: 'center', variant: 'Blackface' },
      { path: '/IR/07 1x12 1964 Fen Blackface - U67.wav', micType: 'condenser', micModel: 'U67', position: 'center', variant: 'Blackface' },
      { path: '/IR/1x12 American.wav', micType: 'dynamic', micModel: 'SM57', position: 'mix', variant: 'American' },
      { path: '/IR/1x12 Boutique_EQ.wav', micType: 'dynamic', micModel: 'SM57', position: 'mix', variant: 'Boutique EQ' },
      { path: '/IR/1x12 British_EQ.wav', micType: 'dynamic', micModel: 'SM57', position: 'mix', variant: 'British EQ' },
    ],
  },

  // ── Twanger Twin 2x12 (Fender Twin Reverb) ──
  {
    cabinetId: 'cab-twanger-twin-2x12',
    defaultIR: '/IR/11 2x12 1965 Fender Twin - SM57on.wav',
    irs: [
      { path: '/IR/11 2x12 1965 Fender Twin - SM57on.wav', micType: 'dynamic', micModel: 'SM57', position: 'center' },
      { path: '/IR/11 2x12 1965 Fender Twin - SM57off.wav', micType: 'dynamic', micModel: 'SM57', position: 'offaxis' },
      { path: '/IR/11 2x12 1965 Fender Twin - BD421.wav', micType: 'dynamic', micModel: 'MD421', position: 'center' },
      { path: '/IR/11 2x12 1965 Fender Twin - U67.wav', micType: 'condenser', micModel: 'U67', position: 'center' },
      { path: '/IR/Fender 68-Vibrolux SM57.wav', micType: 'dynamic', micModel: 'SM57', position: 'center', variant: 'Vibrolux' },
      { path: '/IR/Fender 68-Vibrolux SM57 off Axis.wav', micType: 'dynamic', micModel: 'SM57', position: 'offaxis', variant: 'Vibrolux' },
      { path: '/IR/Fender 68-Vibrolux AT4050.wav', micType: 'condenser', micModel: 'AT4050', position: 'center', variant: 'Vibrolux' },
      { path: '/IR/Fender 68-Vibrolux NeumannUi87.wav', micType: 'condenser', micModel: 'U87', position: 'center', variant: 'Vibrolux' },
      { path: '/IR/Fender SuperChamp SM57.wav', micType: 'dynamic', micModel: 'SM57', position: 'center', variant: 'SuperChamp' },
      { path: '/IR/Fender SuperChamp SM57 off Axis.wav', micType: 'dynamic', micModel: 'SM57', position: 'offaxis', variant: 'SuperChamp' },
      { path: '/IR/Fender SuperChamp AT4050.wav', micType: 'condenser', micModel: 'AT4050', position: 'center', variant: 'SuperChamp' },
      { path: '/IR/Fender SuperChamp Neumann U-87.wav', micType: 'condenser', micModel: 'U87', position: 'center', variant: 'SuperChamp' },
      { path: '/IR/2x12 American_EQ.wav', micType: 'dynamic', micModel: 'SM57', position: 'mix', variant: 'American EQ' },
      { path: '/IR/2x12 Blackface_EQ.wav', micType: 'dynamic', micModel: 'SM57', position: 'mix', variant: 'Blackface EQ' },
      { path: '/IR/2x12 Painapple_EQ.wav', micType: 'dynamic', micModel: 'SM57', position: 'mix', variant: 'Painapple EQ' },
    ],
  },

  // ── Twanger Blackface 1x12 (Fender Deluxe Reverb) ──
  {
    cabinetId: 'cab-twanger-blackface-1x12',
    defaultIR: '/IR/07 1x12 1964 Fen Blackface - SM57on.wav',
    irs: [
      { path: '/IR/07 1x12 1964 Fen Blackface - SM57on.wav', micType: 'dynamic', micModel: 'SM57', position: 'center' },
      { path: '/IR/07 1x12 1964 Fen Blackface - SM57off.wav', micType: 'dynamic', micModel: 'SM57', position: 'offaxis' },
      { path: '/IR/07 1x12 1964 Fen Blackface - BD421.wav', micType: 'dynamic', micModel: 'MD421', position: 'center' },
      { path: '/IR/07 1x12 1964 Fen Blackface - U67.wav', micType: 'condenser', micModel: 'U67', position: 'center' },
      { path: '/IR/1x12 British II_EQ.wav', micType: 'dynamic', micModel: 'SM57', position: 'mix', variant: 'British II EQ' },
    ],
  },

  // ── Twanger Bassman 4x10 ──
  {
    cabinetId: 'cab-twanger-bassman-4x10',
    defaultIR: '/IR/16 4x10 1959 Fen Bassman - SM57on.wav',
    irs: [
      { path: '/IR/16 4x10 1959 Fen Bassman - SM57on.wav', micType: 'dynamic', micModel: 'SM57', position: 'center' },
      { path: '/IR/16 4x10 1959 Fen Bassman - SM57off.wav', micType: 'dynamic', micModel: 'SM57', position: 'offaxis' },
      { path: '/IR/16 4x10 1959 Fen Bassman - BD421.wav', micType: 'dynamic', micModel: 'MD421', position: 'center' },
      { path: '/IR/16 4x10 1959 Fen Bassman - U67.wav', micType: 'condenser', micModel: 'U67', position: 'center' },
      { path: '/IR/4x10 American_EQ.wav', micType: 'dynamic', micModel: 'SM57', position: 'mix', variant: 'American EQ' },
      { path: '/IR/4x10 Metal German_EQ.wav', micType: 'dynamic', micModel: 'SM57', position: 'mix', variant: 'Metal German EQ' },
    ],
  },

  // ── Chimera 2x12 (Vox AC30) ──
  {
    cabinetId: 'cab-chimera-2x12',
    defaultIR: '/IR/14 2x12 1967 Vox AC30 - SM57on.wav',
    irs: [
      { path: '/IR/14 2x12 1967 Vox AC30 - SM57on.wav', micType: 'dynamic', micModel: 'SM57', position: 'center' },
      { path: '/IR/14 2x12 1967 Vox AC30 - SM57off.wav', micType: 'dynamic', micModel: 'SM57', position: 'offaxis' },
      { path: '/IR/14 2x12 1967 Vox AC30 - BD421.wav', micType: 'dynamic', micModel: 'MD421', position: 'center' },
      { path: '/IR/14 2x12 1967 Vox AC30 - U67.wav', micType: 'condenser', micModel: 'U67', position: 'center' },
      { path: '/IR/08 1x12 1960 Vox AC15 - SM57on.wav', micType: 'dynamic', micModel: 'SM57', position: 'center', variant: 'AC15' },
      { path: '/IR/08 1x12 1960 Vox AC15 - SM57off.wav', micType: 'dynamic', micModel: 'SM57', position: 'offaxis', variant: 'AC15' },
      { path: '/IR/08 1x12 1960 Vox AC15 - BD421.wav', micType: 'dynamic', micModel: 'MD421', position: 'center', variant: 'AC15' },
      { path: '/IR/08 1x12 1960 Vox AC15 - U67.wav', micType: 'condenser', micModel: 'U67', position: 'center', variant: 'AC15' },
      { path: '/IR/2x12 VC 30_EQ.wav', micType: 'dynamic', micModel: 'SM57', position: 'mix', variant: 'VC 30 EQ' },
    ],
  },

  // ── Hiwatt 4x12 ──
  {
    cabinetId: 'cab-hiwatt-4x12',
    defaultIR: '/IR/[Cabs] HiWat100.wav',
    irs: [
      { path: '/IR/[Cabs] HiWat100.wav', micType: 'dynamic', micModel: 'SM57', position: 'center' },
      { path: '/IR/4x12 British_EQ.wav', micType: 'dynamic', micModel: 'SM57', position: 'mix', variant: 'British EQ' },
    ],
  },

  // ── Matchless 2x12 ──
  {
    cabinetId: 'cab-matchless-2x12',
    defaultIR: '/IR/12 2x12 1995 Matchless - SM57on.wav',
    irs: [
      { path: '/IR/12 2x12 1995 Matchless - SM57on.wav', micType: 'dynamic', micModel: 'SM57', position: 'center' },
      { path: '/IR/12 2x12 1995 Matchless - SM57off.wav', micType: 'dynamic', micModel: 'SM57', position: 'offaxis' },
      { path: '/IR/12 2x12 1995 Matchless - BD421.wav', micType: 'dynamic', micModel: 'MD421', position: 'center' },
      { path: '/IR/12 2x12 1995 Matchless - U67.wav', micType: 'condenser', micModel: 'U67', position: 'center' },
    ],
  },
]


/**
 * Standalone IR library — impulse responses not tied to a specific cabinet.
 * These can be loaded by users as custom IRs or used for A/B comparison.
 * Organized by cabinet type and source.
 */
export interface StandaloneIR {
  path: string
  name: string
  cabinetType: string
  micModel: string
  micType: MicType
  position: 'center' | 'offaxis' | 'edge' | 'mix'
}

export const standaloneIRLibrary: StandaloneIR[] = [
  // Supro
  { path: '/IR/01 1x6 Supro S6616 - SM57on.wav', name: 'Supro S6616 SM57', cabinetType: '1x6', micModel: 'SM57', micType: 'dynamic', position: 'center' },
  { path: '/IR/01 1x6 Supro S6616 - SM57off.wav', name: 'Supro S6616 SM57 Off', cabinetType: '1x6', micModel: 'SM57', micType: 'dynamic', position: 'offaxis' },
  { path: '/IR/01 1x6 Supro S6616 - BD421.wav', name: 'Supro S6616 MD421', cabinetType: '1x6', micModel: 'MD421', micType: 'dynamic', position: 'center' },
  { path: '/IR/01 1x6 Supro S6616 - U67.wav', name: 'Supro S6616 U67', cabinetType: '1x6', micModel: 'U67', micType: 'condenser', position: 'center' },
  // Fender Tweed 1x8
  { path: '/IR/02 1x8 1961 Fender Tweed - SM57on.wav', name: 'Fender Tweed 1x8 SM57', cabinetType: '1x8', micModel: 'SM57', micType: 'dynamic', position: 'center' },
  { path: '/IR/02 1x8 1961 Fender Tweed - BD421.wav', name: 'Fender Tweed 1x8 MD421', cabinetType: '1x8', micModel: 'MD421', micType: 'dynamic', position: 'center' },
  { path: '/IR/02 1x8 1961 Fender Tweed - U67.wav', name: 'Fender Tweed 1x8 U67', cabinetType: '1x8', micModel: 'U67', micType: 'condenser', position: 'center' },
  // Gibson 1x10
  { path: '/IR/03 1x10 Gibson - SM57on.wav', name: 'Gibson 1x10 SM57', cabinetType: '1x10', micModel: 'SM57', micType: 'dynamic', position: 'center' },
  { path: '/IR/03 1x10 Gibson - BD421.wav', name: 'Gibson 1x10 MD421', cabinetType: '1x10', micModel: 'MD421', micType: 'dynamic', position: 'center' },
  { path: '/IR/03 1x10 Gibson - U67.wav', name: 'Gibson 1x10 U67', cabinetType: '1x10', micModel: 'U67', micType: 'condenser', position: 'center' },
  // Gretsch 1x10
  { path: '/IR/04 1x10 Gretsch 6156 - SM57on.wav', name: 'Gretsch 6156 SM57', cabinetType: '1x10', micModel: 'SM57', micType: 'dynamic', position: 'center' },
  { path: '/IR/04 1x10 Gretsch 6156 - BD421.wav', name: 'Gretsch 6156 MD421', cabinetType: '1x10', micModel: 'MD421', micType: 'dynamic', position: 'center' },
  { path: '/IR/04 1x10 Gretsch 6156 - U67.wav', name: 'Gretsch 6156 U67', cabinetType: '1x10', micModel: 'U67', micType: 'condenser', position: 'center' },
  // Line6 1x12
  { path: '/IR/05 1x12 Line6 - SM57on.wav', name: 'Line6 1x12 SM57', cabinetType: '1x12', micModel: 'SM57', micType: 'dynamic', position: 'center' },
  { path: '/IR/05 1x12 Line6 - BD421.wav', name: 'Line6 1x12 MD421', cabinetType: '1x12', micModel: 'MD421', micType: 'dynamic', position: 'center' },
  { path: '/IR/05 1x12 Line6 - U67.wav', name: 'Line6 1x12 U67', cabinetType: '1x12', micModel: 'U67', micType: 'condenser', position: 'center' },
  // Roland Jazz Chorus 2x12
  { path: '/IR/13 2x12 Roland Jazz Ch - SM57on.wav', name: 'Roland JC 2x12 SM57', cabinetType: '2x12', micModel: 'SM57', micType: 'dynamic', position: 'center' },
  { path: '/IR/13 2x12 Roland Jazz Ch - BD421.wav', name: 'Roland JC 2x12 MD421', cabinetType: '2x12', micModel: 'MD421', micType: 'dynamic', position: 'center' },
  { path: '/IR/13 2x12 Roland Jazz Ch - U67.wav', name: 'Roland JC 2x12 U67', cabinetType: '2x12', micModel: 'U67', micType: 'condenser', position: 'center' },
  // Silvertone 2x12
  { path: '/IR/24 2x12 1967 Silvertone - SM57on.wav', name: 'Silvertone 2x12 SM57', cabinetType: '2x12', micModel: 'SM57', micType: 'dynamic', position: 'center' },
  { path: '/IR/24 2x12 1967 Silvertone - BD421.wav', name: 'Silvertone 2x12 MD421', cabinetType: '2x12', micModel: 'MD421', micType: 'dynamic', position: 'center' },
  { path: '/IR/24 2x12 1967 Silvertone - U67.wav', name: 'Silvertone 2x12 U67', cabinetType: '2x12', micModel: 'U67', micType: 'condenser', position: 'center' },
  // Supro Thunderbolt 1x15
  { path: '/IR/23 1x15 Supro Thunderbolt - SM57on.wav', name: 'Supro Thunderbolt SM57', cabinetType: '1x15', micModel: 'SM57', micType: 'dynamic', position: 'center' },
  { path: '/IR/23 1x15 Supro Thunderbolt - BD421.wav', name: 'Supro Thunderbolt MD421', cabinetType: '1x15', micModel: 'MD421', micType: 'dynamic', position: 'center' },
  { path: '/IR/23 1x15 Supro Thunderbolt - U67.wav', name: 'Supro Thunderbolt U67', cabinetType: '1x15', micModel: 'U67', micType: 'condenser', position: 'center' },
  // Marshall 4x12 vintage captures
  { path: '/IR/18 4x12 1967 Marshall 20W - SM57on.wav', name: 'Marshall 67 20W SM57', cabinetType: '4x12', micModel: 'SM57', micType: 'dynamic', position: 'center' },
  { path: '/IR/18 4x12 1967 Marshall 20W - BD421.wav', name: 'Marshall 67 20W MD421', cabinetType: '4x12', micModel: 'MD421', micType: 'dynamic', position: 'center' },
  { path: '/IR/18 4x12 1967 Marshall 20W - U67.wav', name: 'Marshall 67 20W U67', cabinetType: '4x12', micModel: 'U67', micType: 'condenser', position: 'center' },
  { path: '/IR/19 4x12 1968 Marshall 25W - SM57on.wav', name: 'Marshall 68 25W SM57', cabinetType: '4x12', micModel: 'SM57', micType: 'dynamic', position: 'center' },
  { path: '/IR/19 4x12 1968 Marshall 25W - BD421.wav', name: 'Marshall 68 25W MD421', cabinetType: '4x12', micModel: 'MD421', micType: 'dynamic', position: 'center' },
  { path: '/IR/20 4x12 1978 Marshall 70W - SM57on.wav', name: 'Marshall 78 70W SM57', cabinetType: '4x12', micModel: 'SM57', micType: 'dynamic', position: 'center' },
  { path: '/IR/20 4x12 1978 Marshall 70W - BD421.wav', name: 'Marshall 78 70W MD421', cabinetType: '4x12', micModel: 'MD421', micType: 'dynamic', position: 'center' },
  // Fender Mini Twin 2x2
  { path: '/IR/09 2x2 Fender Mini Twin - SM57on.wav', name: 'Fender Mini Twin SM57', cabinetType: '2x2', micModel: 'SM57', micType: 'dynamic', position: 'center' },
  { path: '/IR/09 2x2 Fender Mini Twin - U67.wav', name: 'Fender Mini Twin U67', cabinetType: '2x2', micModel: 'U67', micType: 'condenser', position: 'center' },
]

/** Lookup a cabinet's IR set by cabinet ID. */
export function getCabinetIRs(cabinetId: string): CabinetIRSet | undefined {
  return cabinetIRCatalog.find((c) => c.cabinetId === cabinetId)
}

/** Find the best matching IR for a cabinet + mic type + position combo. */
export function findBestIR(
  cabinetId: string,
  micType: MicType,
  position: 'center' | 'offaxis' | 'edge' | 'mix',
): IREntry | undefined {
  const set = getCabinetIRs(cabinetId)
  if (!set) return undefined

  // Exact match first
  const exact = set.irs.find(
    (ir) => ir.micType === micType && ir.position === position && !ir.variant,
  )
  if (exact) return exact

  // Same mic type, any position
  const sameMic = set.irs.find((ir) => ir.micType === micType && !ir.variant)
  if (sameMic) return sameMic

  // Any match without variant
  return set.irs.find((ir) => !ir.variant) ?? set.irs[0]
}

/** Get all standalone IRs for a given cabinet type (e.g., '4x12', '2x12'). */
export function getStandaloneIRsByType(cabinetType: string): StandaloneIR[] {
  return standaloneIRLibrary.filter((ir) => ir.cabinetType === cabinetType)
}

/** Get all unique cabinet types available in the standalone IR library. */
export function getAvailableCabinetTypes(): string[] {
  const types = new Set(standaloneIRLibrary.map((ir) => ir.cabinetType))
  return Array.from(types).sort()
}

/** Count total IRs available for a cabinet (mapped + standalone). */
export function getTotalIRCount(cabinetId: string): number {
  const set = getCabinetIRs(cabinetId)
  return set ? set.irs.length : 0
}

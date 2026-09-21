export interface SynonymEntry {
  term: string;
  canonical: string;
}

export interface DisciplineEntry {
  keyword: string;
  discipline: string;
}

export interface UnitEntry {
  aliases: string[];
  canonical: string;
}

export const FIXTURE_SYNONYMS: SynonymEntry[] = [
  { term: 'Hydro', canonical: 'Hydrotest' },
  { term: 'F/R/P', canonical: 'Fabrication / Rework / Punch' },
  { term: 'NDT', canonical: 'Non-destructive testing' },
  { term: 'UT', canonical: 'Ultrasonic Testing' },
  { term: 'RT', canonical: 'Radiography Testing' },
  { term: 'MPT', canonical: 'Magnetic Particle Testing' },
  { term: 'Golden joint', canonical: 'Tie-in Weld' },
  { term: 'PCC', canonical: 'Plain Cement Concrete' },
  { term: 'RCC', canonical: 'Reinforced Cement Concrete' },
  { term: 'Holiday test', canonical: 'Coating Integrity Test' },
  { term: 'Dewatering', canonical: 'Trench Pumping' },
];

export const FIXTURE_DISCIPLINES: DisciplineEntry[] = [
  { keyword: 'Spool', discipline: 'Piping' },
  { keyword: 'Weld', discipline: 'Welding' },
  { keyword: 'Joint', discipline: 'Welding' },
  { keyword: 'Trench', discipline: 'Civil' },
  { keyword: 'Excavate', discipline: 'Civil' },
  { keyword: 'Backfill', discipline: 'Civil' },
  { keyword: 'Coating', discipline: 'Coating' },
  { keyword: 'Lowering', discipline: 'Mechanical' },
  { keyword: 'Stringing', discipline: 'Piping' },
  { keyword: 'Hydrotest', discipline: 'Testing' },
];

export const FIXTURE_UNITS: UnitEntry[] = [
  { aliases: ['mtr', 'm', 'meter', 'metre', 'meters'], canonical: 'metre' },
  { aliases: ['km', 'kilometre', 'kilometer', 'kms'], canonical: 'kilometre' },
  { aliases: ['spool', 'spools', 'spl'], canonical: 'spool' },
  { aliases: ['joint', 'joints', 'jt'], canonical: 'joint' },
  { aliases: ['cum', 'm3', 'cu.m'], canonical: 'cubic metre' },
];

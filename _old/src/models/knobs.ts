export type Knob = number | string | boolean;

export interface Knobs {
  [name: string]: Knob[];
}

export interface StoredKnobs {
  [name: string]: Knob;
}

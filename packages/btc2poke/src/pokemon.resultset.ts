export interface PokemonResultset {
  readonly id: number | null;
  readonly name: string;
  readonly types: string[];
  readonly img: string;
}
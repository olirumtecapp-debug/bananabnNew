import type { TableTheme } from "@/lib/storage";

export interface TableSwatch {
  id: TableTheme;
  name: string;
  description: string;
  felt: string;
  gold: string;
  paper: string;
}

/** Fonte única de temas de mesa reutilizada pelo ThemePicker (TopBar) e ThemeGallery (menu). */
export const TABLE_THEMES: TableSwatch[] = [
  { id: "classic", name: "Cassino Clássico", description: "Feltro verde e dourado tradicional.", felt: "oklch(0.28 0.06 155)", gold: "oklch(0.82 0.14 82)", paper: "oklch(0.97 0.02 90)" },
  { id: "bordo",   name: "Royal Bordô",      description: "Vinho profundo com toques dourados.",  felt: "oklch(0.32 0.11 18)",  gold: "oklch(0.85 0.11 88)", paper: "oklch(0.97 0.02 85)" },
  { id: "safari",  name: "Safári Areia",     description: "Tons quentes de deserto e caramelo.",  felt: "oklch(0.44 0.08 65)",  gold: "oklch(0.72 0.16 55)", paper: "oklch(0.96 0.03 80)" },
  { id: "ocean",   name: "Oceano Noturno",   description: "Azul profundo com prata suave.",       felt: "oklch(0.32 0.08 220)", gold: "oklch(0.88 0.02 230)", paper: "oklch(0.96 0.02 220)" },
  { id: "pastel",  name: "Festa Pastel",     description: "Rosa e lavanda para clima festivo.",   felt: "oklch(0.44 0.10 340)", gold: "oklch(0.78 0.16 20)", paper: "oklch(0.98 0.01 340)" },
];

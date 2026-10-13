// Catálogo inicial para registrar equipos sin tener que escribir la marca.
// Incluye las marcas que ya usa TechStock y las más habituales del mercado.
export const MARCAS_EQUIPOS = [
  "Acer",
  "Adata",
  "Aiwa",
  "Amazon",
  "Apple",
  "Asus",
  "Beats",
  "BenQ",
  "Black Shark",
  "Bose",
  "Canon",
  "Cooler Master",
  "Dell",
  "DJI",
  "Epson",
  "Fitbit",
  "Garmin",
  "Google",
  "Honor",
  "Huawei",
  "HyperX",
  "JBL",
  "Kingston",
  "Lenovo",
  "LG",
  "Logitech",
  "Microsoft",
  "Motorola",
  "MSI",
  "Nintendo",
  "Nokia",
  "Nothing",
  "OnePlus",
  "Oppo",
  "Panasonic",
  "Philips",
  "PlayStation",
  "Poco",
  "Razer",
  "Realme",
  "Redmi",
  "Roku",
  "Samsung",
  "Sennheiser",
  "Sharp",
  "Sony",
  "TCL",
  "TP-Link",
  "Ubiquiti",
  "Vivo",
  "Xiaomi",
  "Xbox",
  "ZTE",
  "Otra",
] as const;

export const MARCAS_CELULARES = [
  "Apple", "Asus", "Black Shark", "Google", "Honor", "Huawei", "LG", "Motorola",
  "Nokia", "Nothing", "OnePlus", "Oppo", "Poco", "Realme", "Redmi", "Samsung",
  "Sony", "TCL", "Vivo", "Xiaomi", "ZTE", "Otra",
] as const;

export const MARCAS_NOTEBOOKS = [
  "Acer", "Apple", "Asus", "Dell", "Gigabyte", "HP", "Huawei", "Lenovo", "LG",
  "Microsoft", "MSI", "Razer", "Samsung", "Xiaomi", "Otra",
] as const;

export const MARCAS_SMARTWATCH = ["Apple", "Samsung", "Huawei", "Xiaomi", "Garmin", "Honor", "Amazfit", "Fitbit", "Google", "Motorola", "OnePlus", "Oppo", "Otra"] as const;

export const MODELOS_POR_MARCA: Record<string, string[]> = {
  Apple: [
    "iPhone 11", "iPhone 11 Pro", "iPhone 12", "iPhone 12 Pro", "iPhone 13", "iPhone 13 Pro",
    "iPhone 14", "iPhone 14 Pro", "iPhone 15", "iPhone 15 Pro", "iPhone 16", "iPhone 16 Pro",
    "iPhone 17", "iPad 10ª generación", "iPad Air", "iPad Pro", "MacBook Air", "MacBook Pro",
    "Apple Watch Series", "Apple Watch SE", "Apple Watch Ultra", "AirPods", "Otro modelo",
  ],
  Samsung: [
    "Galaxy A14", "Galaxy A15", "Galaxy A24", "Galaxy A25", "Galaxy A34", "Galaxy A54",
    "Galaxy S21", "Galaxy S22", "Galaxy S23", "Galaxy S24", "Galaxy S25", "Galaxy Note 20",
    "Galaxy Z Flip", "Galaxy Z Fold", "Galaxy Tab A", "Galaxy Tab S", "Galaxy Watch", "Galaxy Buds", "Otro modelo",
  ],
  Xiaomi: [
    "Redmi Note 10", "Redmi Note 11", "Redmi Note 12", "Redmi Note 13", "Redmi Note 14",
    "Redmi 12", "Redmi 13", "Poco X3", "Poco X5", "Poco X6", "Poco F5", "Xiaomi 12", "Xiaomi 13", "Xiaomi 14", "Otro modelo",
  ],
  Google: ["Pixel 6", "Pixel 6a", "Pixel 7", "Pixel 7a", "Pixel 8", "Pixel 8a", "Pixel 9", "Pixel 9 Pro", "Otro modelo"],
  Motorola: ["Moto G20", "Moto G30", "Moto G40", "Moto G50", "Moto G60", "Moto G84", "Edge 30", "Edge 40", "Razr", "Otro modelo"],
  Huawei: ["P30", "P40", "P50", "P60", "Mate 20", "Mate 30", "Mate 50", "Nova 9", "Nova 11", "Watch GT", "Otro modelo"],
  Oppo: ["A54", "A57", "A78", "Reno 5", "Reno 7", "Reno 10", "Find X5", "Find X6", "Otro modelo"],
  Vivo: ["Y20", "Y21", "Y33", "Y55", "V21", "V23", "V25", "V27", "X80", "X90", "Otro modelo"],
  OnePlus: ["Nord", "Nord N10", "Nord N20", "Nord CE", "7T", "8T", "9 Pro", "10 Pro", "11", "12", "Otro modelo"],
  Realme: ["C21", "C25", "C35", "C55", "8", "9 Pro", "10", "11 Pro", "GT", "Otro modelo"],
  ZTE: ["Blade A31", "Blade A51", "Blade A52", "Blade A72", "Blade V40", "Axon 30", "Axon 40", "Otro modelo"],
  Lenovo: ["ThinkPad", "IdeaPad", "Legion", "Yoga", "Tab M10", "Tab P11", "Otro modelo"],
  Asus: ["Zenfone", "ROG Phone", "VivoBook", "ZenBook", "TUF Gaming", "ROG Strix", "Otro modelo"],
  Dell: ["Inspiron", "Latitude", "XPS", "Vostro", "Precision", "G Series", "Otro modelo"],
  HP: ["Pavilion", "EliteBook", "ProBook", "Envy", "Omen", "Victus", "Otro modelo"],
  Acer: ["Aspire", "Swift", "Nitro", "Predator", "Chromebook", "TravelMate", "Otro modelo"],
  Sony: ["Xperia 1", "Xperia 5", "Xperia 10", "PlayStation 4", "PlayStation 5", "WH-1000XM", "Otro modelo"],
  Nintendo: ["Switch", "Switch Lite", "Switch OLED", "3DS", "Wii U", "Otro modelo"],
  Microsoft: ["Xbox One", "Xbox Series S", "Xbox Series X", "Surface Pro", "Surface Laptop", "Otro modelo"],
  PlayStation: ["PS4", "PS4 Slim", "PS4 Pro", "PS5", "PS5 Slim", "PS5 Pro", "Otro modelo"],
  Xbox: ["Xbox One S", "Xbox One X", "Xbox Series S", "Xbox Series X", "Otro modelo"],
};

export const MODELOS_CELULARES_POR_MARCA: Record<string, string[]> = {
  Apple: ["iPhone 13", "iPhone 13 Pro", "iPhone 13 Pro Max", "iPhone 14", "iPhone 14 Pro", "iPhone 14 Pro Max", "iPhone 15", "iPhone 15 Pro", "iPhone 15 Pro Max", "iPhone 16", "iPhone 16 Pro", "iPhone 16 Pro Max", "iPhone 17", "iPhone 17 Pro", "iPhone 17 Pro Max", "iPhone Air", "iPhone 18", "iPhone 18 Pro", "iPhone 18 Pro Max", "iPhone SE", "Otro modelo"],
  Samsung: [
    "Galaxy S22", "Galaxy S22+", "Galaxy S22 Ultra", "Galaxy S23", "Galaxy S23+", "Galaxy S23 Ultra", "Galaxy S24", "Galaxy S24+", "Galaxy S24 Ultra", "Galaxy S24 FE", "Galaxy S25", "Galaxy S25+", "Galaxy S25 Ultra", "Galaxy S25 FE", "Galaxy S26", "Galaxy S26+", "Galaxy S26 Ultra", "Galaxy S26 FE",
    "Galaxy A24", "Galaxy A25", "Galaxy A26", "Galaxy A27", "Galaxy A34", "Galaxy A35", "Galaxy A36", "Galaxy A37", "Galaxy A54", "Galaxy A55", "Galaxy A56", "Galaxy A57",
    "Galaxy Z Flip3", "Galaxy Z Flip4", "Galaxy Z Flip5", "Galaxy Z Flip6", "Galaxy Z Flip7", "Galaxy Z Flip8", "Galaxy Z Fold4", "Galaxy Z Fold5", "Galaxy Z Fold6", "Galaxy Z Fold7", "Galaxy Z Fold8", "Otro modelo"
  ],
  Xiaomi: [
    "Redmi Note 13 Pro", "Redmi Note 13 Pro+ 5G", "Redmi Note 14 Pro", "Redmi Note 14 Pro+ 5G", "Redmi Note 15 Pro", "Redmi Note 15 Pro+ 5G", "Redmi Note 16 Pro", "Redmi Note 16 Pro+ 5G", "Redmi Note 17 Pro", "Redmi Note 17 Pro+ 5G",
    "Xiaomi 14", "Xiaomi 14 Pro", "Xiaomi 14 Ultra", "Xiaomi 15", "Xiaomi 15 Pro", "Xiaomi 15 Ultra", "Xiaomi 16", "Xiaomi 16 Pro", "Xiaomi 16 Ultra", "Xiaomi 17", "Xiaomi 17 Pro", "Xiaomi 17 Ultra",
    "Xiaomi 14T", "Xiaomi 14T Pro", "Xiaomi 15T", "Xiaomi 15T Pro", "Xiaomi 16T", "Xiaomi 16T Pro", "Xiaomi 17T", "Xiaomi 17T Pro", "Otro modelo"
  ],
  Google: ["Pixel 9", "Pixel 9 Pro", "Pixel 9 Pro XL", "Pixel 10", "Pixel 10 Pro", "Pixel 10 Pro XL", "Pixel 11", "Pixel 11 Pro", "Pixel 11 Pro XL", "Otro modelo"],
  Motorola: ["Edge 60 Fusion", "Edge 60", "Edge 60 Pro", "Edge 60 Ultra", "Edge 70 Fusion", "Edge 70", "Edge 70 Pro", "Edge 70 Ultra", "Razr 60", "Razr 60 Ultra", "Razr 70", "Otro modelo"],
  Huawei: ["P60 Pro", "Pura 70", "Pura 70 Pro", "Pura 70 Ultra", "Pura 80", "Pura 80 Pro", "Pura 80 Ultra", "Nova 14", "Nova 14 Pro", "Nova 15", "Nova 15 Pro", "Mate 70", "Mate 80", "Otro modelo"],
  Honor: ["400 Lite", "400", "400 Pro", "Magic5 Pro", "Magic7 Lite", "Magic7 Pro", "Magic8 Lite", "Magic8 Pro", "Otro modelo"],
  Oppo: ["A5 Pro", "Reno 14F 5G", "Reno 14", "Reno 14 Pro", "Find X8", "Find X9 Pro", "Otro modelo"],
  Vivo: ["Y29", "Y39", "V50", "V60", "X200", "X200 Pro", "Otro modelo"],
  OnePlus: ["Nord 5", "Nord CE5", "OnePlus 13", "OnePlus 13R", "OnePlus 15", "OnePlus 15R", "Otro modelo"],
  Realme: ["C75", "C85", "14 Pro", "14 Pro+", "GT 7", "GT 7T", "Otro modelo"],
  Nothing: ["Phone (3)", "Phone (3a)", "Phone (3a) Pro", "Phone (4a)", "Otro modelo"],
  Sony: ["Xperia 1 VII", "Xperia 1 VIII", "Xperia 10 VII", "Otro modelo"],
  ZTE: ["Blade A75", "Blade V70", "Axon 50", "Axon 60", "Otro modelo"],
  TCL: ["50 Pro NXTPAPER", "60 SE", "60 NXTPAPER", "Otro modelo"],
  Nokia: ["G42", "G60", "X30", "C32", "Otro modelo"],
  LG: ["K52", "K62", "Velvet", "Wing", "Otro modelo"],
  Asus: ["Zenfone 11 Ultra", "Zenfone 12 Ultra", "ROG Phone 8", "ROG Phone 9", "Otro modelo"],
  "Black Shark": ["Black Shark 5", "Black Shark 6", "Black Shark 7", "Otro modelo"],
  Poco: ["Poco F7", "Poco F8", "Poco X7", "Poco X8 Pro", "Otro modelo"],
  Redmi: ["Redmi 15", "Redmi Note 15", "Redmi Note 15 Pro", "Redmi Note 15 Pro+ 5G", "Otro modelo"],
};

export const MODELOS_NOTEBOOKS_POR_MARCA: Record<string, string[]> = {
  Acer: ["Aspire Lite", "Aspire 5", "Swift Go", "Swift X", "Nitro V 15", "Nitro 16", "Predator Helios Neo 16", "TravelMate", "Otro modelo"],
  Apple: ["MacBook Neo", "MacBook Air 13", "MacBook Air 15", "MacBook Pro 14", "MacBook Pro 16", "Otro modelo"],
  Asus: ["Vivobook 15", "Vivobook S 15", "Zenbook 14", "Zenbook S 16", "TUF Gaming A15", "TUF Gaming A16", "ROG Zephyrus G14", "ROG Zephyrus G16", "ROG Strix G16", "Otro modelo"],
  Dell: ["Inspiron 14", "Inspiron 15", "Latitude 3420", "Latitude 5440", "Vostro 3405", "XPS 13", "XPS 15", "G15 5515", "G16", "Precision", "Otro modelo"],
  Gigabyte: ["AORUS 15G", "AORUS 15", "AORUS 16", "G5", "G6", "AERO 14", "Otro modelo"],
  HP: ["Pavilion 14", "Pavilion 15", "Victus 15", "Victus 16", "OMEN 14", "OMEN 16", "Envy 14", "Envy 16", "EliteBook", "ProBook", "Otro modelo"],
  Huawei: ["MateBook D 14", "MateBook D 16", "MateBook 14", "MateBook X Pro", "Otro modelo"],
  Lenovo: ["IdeaPad 3", "IdeaPad Slim 5", "ThinkBook 14", "ThinkBook P16 Gen 2", "ThinkPad E14", "ThinkPad T14", "Legion 5", "Legion 5 Pro", "Legion Slim 5", "LOQ 15", "Yoga Slim 7", "Otro modelo"],
  LG: ["Gram 14", "Gram 16", "Gram 17", "Ultra PC", "Otro modelo"],
  Microsoft: ["Surface Laptop", "Surface Laptop Studio", "Surface Pro", "Otro modelo"],
  MSI: ["Modern 14", "Prestige 14", "Katana 15", "Cyborg 15", "Thin 15", "Raider GE68", "Vector 16", "Stealth 16", "Otro modelo"],
  Razer: ["Blade 14", "Blade 15", "Blade 16", "Blade 18", "Otro modelo"],
  Samsung: ["Galaxy Book4", "Galaxy Book4 Pro", "Galaxy Book4 Ultra", "Galaxy Book5", "Otro modelo"],
  Xiaomi: ["RedmiBook 15", "Mi Notebook Pro", "Xiaomi Book Pro", "Otro modelo"],
};

export const MODELOS_SMARTWATCH_POR_MARCA: Record<string, string[]> = {
  Apple: ["Apple Watch SE 2", "Apple Watch SE 3", "Apple Watch Series 9", "Apple Watch Series 10", "Apple Watch Series 11", "Apple Watch Ultra 2", "Apple Watch Ultra 3", "Otro modelo"],
  Samsung: ["Galaxy Watch6", "Galaxy Watch6 Classic", "Galaxy Watch7", "Galaxy Watch8 40mm", "Galaxy Watch8 44mm", "Galaxy Watch8 Classic", "Galaxy Watch9", "Galaxy Watch Ultra", "Galaxy Watch Ultra2", "Otro modelo"],
  Huawei: ["Watch Fit 3", "Watch Fit 4", "Watch Fit 4 Pro", "Watch GT 4", "Watch GT 5", "Watch GT 6", "Watch GT 6 Pro", "Watch GT 7 Pro", "Watch 5", "Band 11", "Otro modelo"],
  Xiaomi: ["Redmi Watch 5 Active", "Redmi Watch 5 Lite", "Redmi Watch 6", "Redmi Watch 6 Lite", "Watch S3", "Watch S4", "Watch S5", "Xiaomi Smart Band 9", "Xiaomi Smart Band 10", "Otro modelo"],
  Garmin: ["Forerunner 165", "Forerunner 265", "Forerunner 965", "Venu 3", "Venu 4", "vívoactive 5", "Instinct 2 Solar", "Instinct 3", "Fenix 8", "Otro modelo"],
  Honor: ["Choice Watch", "Choice Watch 2", "Watch 4", "Watch 5", "Watch 6", "Band 9", "Otro modelo"],
  Amazfit: ["Active", "Active 2", "Balance", "Bip 5", "GTR 4", "GTR 5", "GTS 4", "T-Rex 3", "Otro modelo"],
  Fitbit: ["Versa 4", "Sense 2", "Charge 6", "Inspire 3", "Luxe", "Otro modelo"],
  Google: ["Pixel Watch 2", "Pixel Watch 3", "Pixel Watch 4", "Otro modelo"],
  Motorola: ["Moto Watch 40", "Moto Watch 70", "Moto Watch 100", "Moto Watch 200", "Otro modelo"],
  OnePlus: ["OnePlus Watch 2", "OnePlus Watch 2R", "OnePlus Watch 3", "Otro modelo"],
  Oppo: ["Watch X", "Watch X2", "Watch Free", "Otro modelo"],
};

export const MODELOS_GENERICOS = ["Modelo no especificado", "Otro modelo"];
export const ALMACENAMIENTOS = ["No aplica", "32 GB", "64 GB", "128 GB", "256 GB", "512 GB", "1 TB", "2 TB", "Otro"];
export const RAMS = ["No aplica", "2 GB", "3 GB", "4 GB", "6 GB", "8 GB", "12 GB", "16 GB", "24 GB", "32 GB", "64 GB", "Otro"];

export function detectarEspecificaciones(texto: string) {
  const normalizado = texto.toLowerCase();
  const almacenamiento = normalizado.match(/\b(32|64|128|256|512)\s*gb\b|\b(1|2)\s*tb\b/i);
  const memoria = normalizado.match(/\b(2|3|4|6|8|12|16|24|32|64)\s*(?:gb\s*)?(?:ram|gb)\b/i);
  const formato = normalizado.match(/\b(2|3|4|6|8|12|16|24|32|64)\s*\/\s*(32|64|128|256|512)\b/);
  return {
    almacenamiento: almacenamiento ? `${almacenamiento[1] ?? almacenamiento[2]} ${almacenamiento[1] ? "GB" : "TB"}` : formato ? `${formato[2]} GB` : "",
    ram: memoria ? `${memoria[1]} GB` : formato ? `${formato[1]} GB` : "",
  };
}

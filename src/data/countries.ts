// GENERADO POR scripts/build-country-data.mjs - no editar a mano.
// Fuentes: world-atlas (Natural Earth 1:50m) + world-countries (ISO 3166).

/** Continentes que entran en el recuento de 195 países. */
export type Continent = "africa" | "america" | "asia" | "europe" | "oceania";

/** Incluye además regiones sin países contables (territorios antárticos). */
export type Region = "africa" | "america" | "antarctica" | "asia" | "europe" | "oceania";

export interface CountryMeta {
  /** ISO 3166-1 alpha-2 */
  code: string;
  /** Nombre en español */
  name: string;
  nameEn: string;
  region: Region;
  subregion: string | null;
  /** Si suma al total de 195 países */
  countable: boolean;
  flag: string;
}

/** Clave = id de la geometría en el TopoJSON (ISO 3166-1 numérico). */
export const COUNTRIES: Record<string, CountryMeta> = {
  "100": {
    "code": "BG",
    "name": "Bulgaria",
    "nameEn": "Bulgaria",
    "region": "europe",
    "subregion": "Southeast Europe",
    "countable": true,
    "flag": "🇧🇬"
  },
  "104": {
    "code": "MM",
    "name": "Myanmar",
    "nameEn": "Myanmar",
    "region": "asia",
    "subregion": "South-Eastern Asia",
    "countable": true,
    "flag": "🇲🇲"
  },
  "108": {
    "code": "BI",
    "name": "Burundi",
    "nameEn": "Burundi",
    "region": "africa",
    "subregion": "Eastern Africa",
    "countable": true,
    "flag": "🇧🇮"
  },
  "112": {
    "code": "BY",
    "name": "Bielorrusia",
    "nameEn": "Belarus",
    "region": "europe",
    "subregion": "Eastern Europe",
    "countable": true,
    "flag": "🇧🇾"
  },
  "116": {
    "code": "KH",
    "name": "Camboya",
    "nameEn": "Cambodia",
    "region": "asia",
    "subregion": "South-Eastern Asia",
    "countable": true,
    "flag": "🇰🇭"
  },
  "120": {
    "code": "CM",
    "name": "Camerún",
    "nameEn": "Cameroon",
    "region": "africa",
    "subregion": "Middle Africa",
    "countable": true,
    "flag": "🇨🇲"
  },
  "124": {
    "code": "CA",
    "name": "Canadá",
    "nameEn": "Canada",
    "region": "america",
    "subregion": "North America",
    "countable": true,
    "flag": "🇨🇦"
  },
  "132": {
    "code": "CV",
    "name": "Cabo Verde",
    "nameEn": "Cape Verde",
    "region": "africa",
    "subregion": "Western Africa",
    "countable": true,
    "flag": "🇨🇻"
  },
  "136": {
    "code": "KY",
    "name": "Islas Caimán",
    "nameEn": "Cayman Islands",
    "region": "america",
    "subregion": "Caribbean",
    "countable": false,
    "flag": "🇰🇾"
  },
  "140": {
    "code": "CF",
    "name": "República Centroafricana",
    "nameEn": "Central African Republic",
    "region": "africa",
    "subregion": "Middle Africa",
    "countable": true,
    "flag": "🇨🇫"
  },
  "144": {
    "code": "LK",
    "name": "Sri Lanka",
    "nameEn": "Sri Lanka",
    "region": "asia",
    "subregion": "Southern Asia",
    "countable": true,
    "flag": "🇱🇰"
  },
  "148": {
    "code": "TD",
    "name": "Chad",
    "nameEn": "Chad",
    "region": "africa",
    "subregion": "Middle Africa",
    "countable": true,
    "flag": "🇹🇩"
  },
  "152": {
    "code": "CL",
    "name": "Chile",
    "nameEn": "Chile",
    "region": "america",
    "subregion": "South America",
    "countable": true,
    "flag": "🇨🇱"
  },
  "156": {
    "code": "CN",
    "name": "China",
    "nameEn": "China",
    "region": "asia",
    "subregion": "Eastern Asia",
    "countable": true,
    "flag": "🇨🇳"
  },
  "158": {
    "code": "TW",
    "name": "Taiwán",
    "nameEn": "Taiwan",
    "region": "asia",
    "subregion": "Eastern Asia",
    "countable": false,
    "flag": "🇹🇼"
  },
  "170": {
    "code": "CO",
    "name": "Colombia",
    "nameEn": "Colombia",
    "region": "america",
    "subregion": "South America",
    "countable": true,
    "flag": "🇨🇴"
  },
  "174": {
    "code": "KM",
    "name": "Comoras",
    "nameEn": "Comoros",
    "region": "africa",
    "subregion": "Eastern Africa",
    "countable": true,
    "flag": "🇰🇲"
  },
  "178": {
    "code": "CG",
    "name": "Congo",
    "nameEn": "Republic of the Congo",
    "region": "africa",
    "subregion": "Middle Africa",
    "countable": true,
    "flag": "🇨🇬"
  },
  "180": {
    "code": "CD",
    "name": "Congo (Rep. Dem.)",
    "nameEn": "DR Congo",
    "region": "africa",
    "subregion": "Middle Africa",
    "countable": true,
    "flag": "🇨🇩"
  },
  "184": {
    "code": "CK",
    "name": "Islas Cook",
    "nameEn": "Cook Islands",
    "region": "oceania",
    "subregion": "Polynesia",
    "countable": false,
    "flag": "🇨🇰"
  },
  "188": {
    "code": "CR",
    "name": "Costa Rica",
    "nameEn": "Costa Rica",
    "region": "america",
    "subregion": "Central America",
    "countable": true,
    "flag": "🇨🇷"
  },
  "191": {
    "code": "HR",
    "name": "Croacia",
    "nameEn": "Croatia",
    "region": "europe",
    "subregion": "Southeast Europe",
    "countable": true,
    "flag": "🇭🇷"
  },
  "192": {
    "code": "CU",
    "name": "Cuba",
    "nameEn": "Cuba",
    "region": "america",
    "subregion": "Caribbean",
    "countable": true,
    "flag": "🇨🇺"
  },
  "196": {
    "code": "CY",
    "name": "Chipre",
    "nameEn": "Cyprus",
    "region": "europe",
    "subregion": "Southern Europe",
    "countable": true,
    "flag": "🇨🇾"
  },
  "203": {
    "code": "CZ",
    "name": "Chequia",
    "nameEn": "Czechia",
    "region": "europe",
    "subregion": "Central Europe",
    "countable": true,
    "flag": "🇨🇿"
  },
  "204": {
    "code": "BJ",
    "name": "Benín",
    "nameEn": "Benin",
    "region": "africa",
    "subregion": "Western Africa",
    "countable": true,
    "flag": "🇧🇯"
  },
  "208": {
    "code": "DK",
    "name": "Dinamarca",
    "nameEn": "Denmark",
    "region": "europe",
    "subregion": "Northern Europe",
    "countable": true,
    "flag": "🇩🇰"
  },
  "212": {
    "code": "DM",
    "name": "Dominica",
    "nameEn": "Dominica",
    "region": "america",
    "subregion": "Caribbean",
    "countable": true,
    "flag": "🇩🇲"
  },
  "214": {
    "code": "DO",
    "name": "República Dominicana",
    "nameEn": "Dominican Republic",
    "region": "america",
    "subregion": "Caribbean",
    "countable": true,
    "flag": "🇩🇴"
  },
  "218": {
    "code": "EC",
    "name": "Ecuador",
    "nameEn": "Ecuador",
    "region": "america",
    "subregion": "South America",
    "countable": true,
    "flag": "🇪🇨"
  },
  "222": {
    "code": "SV",
    "name": "El Salvador",
    "nameEn": "El Salvador",
    "region": "america",
    "subregion": "Central America",
    "countable": true,
    "flag": "🇸🇻"
  },
  "226": {
    "code": "GQ",
    "name": "Guinea Ecuatorial",
    "nameEn": "Equatorial Guinea",
    "region": "africa",
    "subregion": "Middle Africa",
    "countable": true,
    "flag": "🇬🇶"
  },
  "231": {
    "code": "ET",
    "name": "Etiopía",
    "nameEn": "Ethiopia",
    "region": "africa",
    "subregion": "Eastern Africa",
    "countable": true,
    "flag": "🇪🇹"
  },
  "232": {
    "code": "ER",
    "name": "Eritrea",
    "nameEn": "Eritrea",
    "region": "africa",
    "subregion": "Eastern Africa",
    "countable": true,
    "flag": "🇪🇷"
  },
  "233": {
    "code": "EE",
    "name": "Estonia",
    "nameEn": "Estonia",
    "region": "europe",
    "subregion": "Northern Europe",
    "countable": true,
    "flag": "🇪🇪"
  },
  "234": {
    "code": "FO",
    "name": "Islas Faroe",
    "nameEn": "Faroe Islands",
    "region": "europe",
    "subregion": "Northern Europe",
    "countable": false,
    "flag": "🇫🇴"
  },
  "238": {
    "code": "FK",
    "name": "Islas Malvinas",
    "nameEn": "Falkland Islands",
    "region": "america",
    "subregion": "South America",
    "countable": false,
    "flag": "🇫🇰"
  },
  "239": {
    "code": "GS",
    "name": "Islas Georgias del Sur y Sandwich del Sur",
    "nameEn": "South Georgia",
    "region": "antarctica",
    "subregion": null,
    "countable": false,
    "flag": "🇬🇸"
  },
  "242": {
    "code": "FJ",
    "name": "Fiyi",
    "nameEn": "Fiji",
    "region": "oceania",
    "subregion": "Melanesia",
    "countable": true,
    "flag": "🇫🇯"
  },
  "246": {
    "code": "FI",
    "name": "Finlandia",
    "nameEn": "Finland",
    "region": "europe",
    "subregion": "Northern Europe",
    "countable": true,
    "flag": "🇫🇮"
  },
  "248": {
    "code": "AX",
    "name": "Alandia",
    "nameEn": "Åland Islands",
    "region": "europe",
    "subregion": "Northern Europe",
    "countable": false,
    "flag": "🇦🇽"
  },
  "250": {
    "code": "FR",
    "name": "Francia",
    "nameEn": "France",
    "region": "europe",
    "subregion": "Western Europe",
    "countable": true,
    "flag": "🇫🇷"
  },
  "258": {
    "code": "PF",
    "name": "Polinesia Francesa",
    "nameEn": "French Polynesia",
    "region": "oceania",
    "subregion": "Polynesia",
    "countable": false,
    "flag": "🇵🇫"
  },
  "260": {
    "code": "TF",
    "name": "Tierras Australes y Antárticas Francesas",
    "nameEn": "French Southern and Antarctic Lands",
    "region": "antarctica",
    "subregion": null,
    "countable": false,
    "flag": "🇹🇫"
  },
  "262": {
    "code": "DJ",
    "name": "Djibouti",
    "nameEn": "Djibouti",
    "region": "africa",
    "subregion": "Eastern Africa",
    "countable": true,
    "flag": "🇩🇯"
  },
  "266": {
    "code": "GA",
    "name": "Gabón",
    "nameEn": "Gabon",
    "region": "africa",
    "subregion": "Middle Africa",
    "countable": true,
    "flag": "🇬🇦"
  },
  "268": {
    "code": "GE",
    "name": "Georgia",
    "nameEn": "Georgia",
    "region": "asia",
    "subregion": "Western Asia",
    "countable": true,
    "flag": "🇬🇪"
  },
  "270": {
    "code": "GM",
    "name": "Gambia",
    "nameEn": "Gambia",
    "region": "africa",
    "subregion": "Western Africa",
    "countable": true,
    "flag": "🇬🇲"
  },
  "275": {
    "code": "PS",
    "name": "Palestina",
    "nameEn": "Palestine",
    "region": "asia",
    "subregion": "Western Asia",
    "countable": true,
    "flag": "🇵🇸"
  },
  "276": {
    "code": "DE",
    "name": "Alemania",
    "nameEn": "Germany",
    "region": "europe",
    "subregion": "Western Europe",
    "countable": true,
    "flag": "🇩🇪"
  },
  "288": {
    "code": "GH",
    "name": "Ghana",
    "nameEn": "Ghana",
    "region": "africa",
    "subregion": "Western Africa",
    "countable": true,
    "flag": "🇬🇭"
  },
  "296": {
    "code": "KI",
    "name": "Kiribati",
    "nameEn": "Kiribati",
    "region": "oceania",
    "subregion": "Micronesia",
    "countable": true,
    "flag": "🇰🇮"
  },
  "300": {
    "code": "GR",
    "name": "Grecia",
    "nameEn": "Greece",
    "region": "europe",
    "subregion": "Southern Europe",
    "countable": true,
    "flag": "🇬🇷"
  },
  "304": {
    "code": "GL",
    "name": "Groenlandia",
    "nameEn": "Greenland",
    "region": "america",
    "subregion": "North America",
    "countable": false,
    "flag": "🇬🇱"
  },
  "308": {
    "code": "GD",
    "name": "Grenada",
    "nameEn": "Grenada",
    "region": "america",
    "subregion": "Caribbean",
    "countable": true,
    "flag": "🇬🇩"
  },
  "316": {
    "code": "GU",
    "name": "Guam",
    "nameEn": "Guam",
    "region": "oceania",
    "subregion": "Micronesia",
    "countable": false,
    "flag": "🇬🇺"
  },
  "320": {
    "code": "GT",
    "name": "Guatemala",
    "nameEn": "Guatemala",
    "region": "america",
    "subregion": "Central America",
    "countable": true,
    "flag": "🇬🇹"
  },
  "324": {
    "code": "GN",
    "name": "Guinea",
    "nameEn": "Guinea",
    "region": "africa",
    "subregion": "Western Africa",
    "countable": true,
    "flag": "🇬🇳"
  },
  "328": {
    "code": "GY",
    "name": "Guyana",
    "nameEn": "Guyana",
    "region": "america",
    "subregion": "South America",
    "countable": true,
    "flag": "🇬🇾"
  },
  "332": {
    "code": "HT",
    "name": "Haití",
    "nameEn": "Haiti",
    "region": "america",
    "subregion": "Caribbean",
    "countable": true,
    "flag": "🇭🇹"
  },
  "334": {
    "code": "HM",
    "name": "Islas Heard y McDonald",
    "nameEn": "Heard Island and McDonald Islands",
    "region": "antarctica",
    "subregion": null,
    "countable": false,
    "flag": "🇭🇲"
  },
  "336": {
    "code": "VA",
    "name": "Ciudad del Vaticano",
    "nameEn": "Vatican City",
    "region": "europe",
    "subregion": "Southern Europe",
    "countable": true,
    "flag": "🇻🇦"
  },
  "340": {
    "code": "HN",
    "name": "Honduras",
    "nameEn": "Honduras",
    "region": "america",
    "subregion": "Central America",
    "countable": true,
    "flag": "🇭🇳"
  },
  "344": {
    "code": "HK",
    "name": "Hong Kong",
    "nameEn": "Hong Kong",
    "region": "asia",
    "subregion": "Eastern Asia",
    "countable": false,
    "flag": "🇭🇰"
  },
  "348": {
    "code": "HU",
    "name": "Hungría",
    "nameEn": "Hungary",
    "region": "europe",
    "subregion": "Central Europe",
    "countable": true,
    "flag": "🇭🇺"
  },
  "352": {
    "code": "IS",
    "name": "Islandia",
    "nameEn": "Iceland",
    "region": "europe",
    "subregion": "Northern Europe",
    "countable": true,
    "flag": "🇮🇸"
  },
  "356": {
    "code": "IN",
    "name": "India",
    "nameEn": "India",
    "region": "asia",
    "subregion": "Southern Asia",
    "countable": true,
    "flag": "🇮🇳"
  },
  "360": {
    "code": "ID",
    "name": "Indonesia",
    "nameEn": "Indonesia",
    "region": "asia",
    "subregion": "South-Eastern Asia",
    "countable": true,
    "flag": "🇮🇩"
  },
  "364": {
    "code": "IR",
    "name": "Iran",
    "nameEn": "Iran",
    "region": "asia",
    "subregion": "Southern Asia",
    "countable": true,
    "flag": "🇮🇷"
  },
  "368": {
    "code": "IQ",
    "name": "Irak",
    "nameEn": "Iraq",
    "region": "asia",
    "subregion": "Western Asia",
    "countable": true,
    "flag": "🇮🇶"
  },
  "372": {
    "code": "IE",
    "name": "Irlanda",
    "nameEn": "Ireland",
    "region": "europe",
    "subregion": "Northern Europe",
    "countable": true,
    "flag": "🇮🇪"
  },
  "376": {
    "code": "IL",
    "name": "Israel",
    "nameEn": "Israel",
    "region": "asia",
    "subregion": "Western Asia",
    "countable": true,
    "flag": "🇮🇱"
  },
  "380": {
    "code": "IT",
    "name": "Italia",
    "nameEn": "Italy",
    "region": "europe",
    "subregion": "Southern Europe",
    "countable": true,
    "flag": "🇮🇹"
  },
  "384": {
    "code": "CI",
    "name": "Costa de Marfil",
    "nameEn": "Ivory Coast",
    "region": "africa",
    "subregion": "Western Africa",
    "countable": true,
    "flag": "🇨🇮"
  },
  "388": {
    "code": "JM",
    "name": "Jamaica",
    "nameEn": "Jamaica",
    "region": "america",
    "subregion": "Caribbean",
    "countable": true,
    "flag": "🇯🇲"
  },
  "392": {
    "code": "JP",
    "name": "Japón",
    "nameEn": "Japan",
    "region": "asia",
    "subregion": "Eastern Asia",
    "countable": true,
    "flag": "🇯🇵"
  },
  "398": {
    "code": "KZ",
    "name": "Kazajistán",
    "nameEn": "Kazakhstan",
    "region": "asia",
    "subregion": "Central Asia",
    "countable": true,
    "flag": "🇰🇿"
  },
  "400": {
    "code": "JO",
    "name": "Jordania",
    "nameEn": "Jordan",
    "region": "asia",
    "subregion": "Western Asia",
    "countable": true,
    "flag": "🇯🇴"
  },
  "404": {
    "code": "KE",
    "name": "Kenia",
    "nameEn": "Kenya",
    "region": "africa",
    "subregion": "Eastern Africa",
    "countable": true,
    "flag": "🇰🇪"
  },
  "408": {
    "code": "KP",
    "name": "Corea del Norte",
    "nameEn": "North Korea",
    "region": "asia",
    "subregion": "Eastern Asia",
    "countable": true,
    "flag": "🇰🇵"
  },
  "410": {
    "code": "KR",
    "name": "Corea del Sur",
    "nameEn": "South Korea",
    "region": "asia",
    "subregion": "Eastern Asia",
    "countable": true,
    "flag": "🇰🇷"
  },
  "414": {
    "code": "KW",
    "name": "Kuwait",
    "nameEn": "Kuwait",
    "region": "asia",
    "subregion": "Western Asia",
    "countable": true,
    "flag": "🇰🇼"
  },
  "417": {
    "code": "KG",
    "name": "Kirguizistán",
    "nameEn": "Kyrgyzstan",
    "region": "asia",
    "subregion": "Central Asia",
    "countable": true,
    "flag": "🇰🇬"
  },
  "418": {
    "code": "LA",
    "name": "Laos",
    "nameEn": "Laos",
    "region": "asia",
    "subregion": "South-Eastern Asia",
    "countable": true,
    "flag": "🇱🇦"
  },
  "422": {
    "code": "LB",
    "name": "Líbano",
    "nameEn": "Lebanon",
    "region": "asia",
    "subregion": "Western Asia",
    "countable": true,
    "flag": "🇱🇧"
  },
  "426": {
    "code": "LS",
    "name": "Lesotho",
    "nameEn": "Lesotho",
    "region": "africa",
    "subregion": "Southern Africa",
    "countable": true,
    "flag": "🇱🇸"
  },
  "428": {
    "code": "LV",
    "name": "Letonia",
    "nameEn": "Latvia",
    "region": "europe",
    "subregion": "Northern Europe",
    "countable": true,
    "flag": "🇱🇻"
  },
  "430": {
    "code": "LR",
    "name": "Liberia",
    "nameEn": "Liberia",
    "region": "africa",
    "subregion": "Western Africa",
    "countable": true,
    "flag": "🇱🇷"
  },
  "434": {
    "code": "LY",
    "name": "Libia",
    "nameEn": "Libya",
    "region": "africa",
    "subregion": "Northern Africa",
    "countable": true,
    "flag": "🇱🇾"
  },
  "438": {
    "code": "LI",
    "name": "Liechtenstein",
    "nameEn": "Liechtenstein",
    "region": "europe",
    "subregion": "Western Europe",
    "countable": true,
    "flag": "🇱🇮"
  },
  "440": {
    "code": "LT",
    "name": "Lituania",
    "nameEn": "Lithuania",
    "region": "europe",
    "subregion": "Northern Europe",
    "countable": true,
    "flag": "🇱🇹"
  },
  "442": {
    "code": "LU",
    "name": "Luxemburgo",
    "nameEn": "Luxembourg",
    "region": "europe",
    "subregion": "Western Europe",
    "countable": true,
    "flag": "🇱🇺"
  },
  "446": {
    "code": "MO",
    "name": "Macao",
    "nameEn": "Macau",
    "region": "asia",
    "subregion": "Eastern Asia",
    "countable": false,
    "flag": "🇲🇴"
  },
  "450": {
    "code": "MG",
    "name": "Madagascar",
    "nameEn": "Madagascar",
    "region": "africa",
    "subregion": "Eastern Africa",
    "countable": true,
    "flag": "🇲🇬"
  },
  "454": {
    "code": "MW",
    "name": "Malawi",
    "nameEn": "Malawi",
    "region": "africa",
    "subregion": "Eastern Africa",
    "countable": true,
    "flag": "🇲🇼"
  },
  "458": {
    "code": "MY",
    "name": "Malasia",
    "nameEn": "Malaysia",
    "region": "asia",
    "subregion": "South-Eastern Asia",
    "countable": true,
    "flag": "🇲🇾"
  },
  "462": {
    "code": "MV",
    "name": "Maldivas",
    "nameEn": "Maldives",
    "region": "asia",
    "subregion": "Southern Asia",
    "countable": true,
    "flag": "🇲🇻"
  },
  "466": {
    "code": "ML",
    "name": "Mali",
    "nameEn": "Mali",
    "region": "africa",
    "subregion": "Western Africa",
    "countable": true,
    "flag": "🇲🇱"
  },
  "470": {
    "code": "MT",
    "name": "Malta",
    "nameEn": "Malta",
    "region": "europe",
    "subregion": "Southern Europe",
    "countable": true,
    "flag": "🇲🇹"
  },
  "478": {
    "code": "MR",
    "name": "Mauritania",
    "nameEn": "Mauritania",
    "region": "africa",
    "subregion": "Western Africa",
    "countable": true,
    "flag": "🇲🇷"
  },
  "480": {
    "code": "MU",
    "name": "Mauricio",
    "nameEn": "Mauritius",
    "region": "africa",
    "subregion": "Eastern Africa",
    "countable": true,
    "flag": "🇲🇺"
  },
  "484": {
    "code": "MX",
    "name": "México",
    "nameEn": "Mexico",
    "region": "america",
    "subregion": "North America",
    "countable": true,
    "flag": "🇲🇽"
  },
  "492": {
    "code": "MC",
    "name": "Mónaco",
    "nameEn": "Monaco",
    "region": "europe",
    "subregion": "Western Europe",
    "countable": true,
    "flag": "🇲🇨"
  },
  "496": {
    "code": "MN",
    "name": "Mongolia",
    "nameEn": "Mongolia",
    "region": "asia",
    "subregion": "Eastern Asia",
    "countable": true,
    "flag": "🇲🇳"
  },
  "498": {
    "code": "MD",
    "name": "Moldavia",
    "nameEn": "Moldova",
    "region": "europe",
    "subregion": "Eastern Europe",
    "countable": true,
    "flag": "🇲🇩"
  },
  "499": {
    "code": "ME",
    "name": "Montenegro",
    "nameEn": "Montenegro",
    "region": "europe",
    "subregion": "Southeast Europe",
    "countable": true,
    "flag": "🇲🇪"
  },
  "500": {
    "code": "MS",
    "name": "Montserrat",
    "nameEn": "Montserrat",
    "region": "america",
    "subregion": "Caribbean",
    "countable": false,
    "flag": "🇲🇸"
  },
  "504": {
    "code": "MA",
    "name": "Marruecos",
    "nameEn": "Morocco",
    "region": "africa",
    "subregion": "Northern Africa",
    "countable": true,
    "flag": "🇲🇦"
  },
  "508": {
    "code": "MZ",
    "name": "Mozambique",
    "nameEn": "Mozambique",
    "region": "africa",
    "subregion": "Eastern Africa",
    "countable": true,
    "flag": "🇲🇿"
  },
  "512": {
    "code": "OM",
    "name": "Omán",
    "nameEn": "Oman",
    "region": "asia",
    "subregion": "Western Asia",
    "countable": true,
    "flag": "🇴🇲"
  },
  "516": {
    "code": "NA",
    "name": "Namibia",
    "nameEn": "Namibia",
    "region": "africa",
    "subregion": "Southern Africa",
    "countable": true,
    "flag": "🇳🇦"
  },
  "520": {
    "code": "NR",
    "name": "Nauru",
    "nameEn": "Nauru",
    "region": "oceania",
    "subregion": "Micronesia",
    "countable": true,
    "flag": "🇳🇷"
  },
  "524": {
    "code": "NP",
    "name": "Nepal",
    "nameEn": "Nepal",
    "region": "asia",
    "subregion": "Southern Asia",
    "countable": true,
    "flag": "🇳🇵"
  },
  "528": {
    "code": "NL",
    "name": "Países Bajos",
    "nameEn": "Netherlands",
    "region": "europe",
    "subregion": "Western Europe",
    "countable": true,
    "flag": "🇳🇱"
  },
  "531": {
    "code": "CW",
    "name": "Curazao",
    "nameEn": "Curaçao",
    "region": "america",
    "subregion": "Caribbean",
    "countable": false,
    "flag": "🇨🇼"
  },
  "533": {
    "code": "AW",
    "name": "Aruba",
    "nameEn": "Aruba",
    "region": "america",
    "subregion": "Caribbean",
    "countable": false,
    "flag": "🇦🇼"
  },
  "534": {
    "code": "SX",
    "name": "Sint Maarten",
    "nameEn": "Sint Maarten",
    "region": "america",
    "subregion": "Caribbean",
    "countable": false,
    "flag": "🇸🇽"
  },
  "540": {
    "code": "NC",
    "name": "Nueva Caledonia",
    "nameEn": "New Caledonia",
    "region": "oceania",
    "subregion": "Melanesia",
    "countable": false,
    "flag": "🇳🇨"
  },
  "548": {
    "code": "VU",
    "name": "Vanuatu",
    "nameEn": "Vanuatu",
    "region": "oceania",
    "subregion": "Melanesia",
    "countable": true,
    "flag": "🇻🇺"
  },
  "554": {
    "code": "NZ",
    "name": "Nueva Zelanda",
    "nameEn": "New Zealand",
    "region": "oceania",
    "subregion": "Australia and New Zealand",
    "countable": true,
    "flag": "🇳🇿"
  },
  "558": {
    "code": "NI",
    "name": "Nicaragua",
    "nameEn": "Nicaragua",
    "region": "america",
    "subregion": "Central America",
    "countable": true,
    "flag": "🇳🇮"
  },
  "562": {
    "code": "NE",
    "name": "Níger",
    "nameEn": "Niger",
    "region": "africa",
    "subregion": "Western Africa",
    "countable": true,
    "flag": "🇳🇪"
  },
  "566": {
    "code": "NG",
    "name": "Nigeria",
    "nameEn": "Nigeria",
    "region": "africa",
    "subregion": "Western Africa",
    "countable": true,
    "flag": "🇳🇬"
  },
  "570": {
    "code": "NU",
    "name": "Niue",
    "nameEn": "Niue",
    "region": "oceania",
    "subregion": "Polynesia",
    "countable": false,
    "flag": "🇳🇺"
  },
  "574": {
    "code": "NF",
    "name": "Isla de Norfolk",
    "nameEn": "Norfolk Island",
    "region": "oceania",
    "subregion": "Australia and New Zealand",
    "countable": false,
    "flag": "🇳🇫"
  },
  "578": {
    "code": "NO",
    "name": "Noruega",
    "nameEn": "Norway",
    "region": "europe",
    "subregion": "Northern Europe",
    "countable": true,
    "flag": "🇳🇴"
  },
  "580": {
    "code": "MP",
    "name": "Islas Marianas del Norte",
    "nameEn": "Northern Mariana Islands",
    "region": "oceania",
    "subregion": "Micronesia",
    "countable": false,
    "flag": "🇲🇵"
  },
  "583": {
    "code": "FM",
    "name": "Micronesia",
    "nameEn": "Micronesia",
    "region": "oceania",
    "subregion": "Micronesia",
    "countable": true,
    "flag": "🇫🇲"
  },
  "584": {
    "code": "MH",
    "name": "Islas Marshall",
    "nameEn": "Marshall Islands",
    "region": "oceania",
    "subregion": "Micronesia",
    "countable": true,
    "flag": "🇲🇭"
  },
  "585": {
    "code": "PW",
    "name": "Palau",
    "nameEn": "Palau",
    "region": "oceania",
    "subregion": "Micronesia",
    "countable": true,
    "flag": "🇵🇼"
  },
  "586": {
    "code": "PK",
    "name": "Pakistán",
    "nameEn": "Pakistan",
    "region": "asia",
    "subregion": "Southern Asia",
    "countable": true,
    "flag": "🇵🇰"
  },
  "591": {
    "code": "PA",
    "name": "Panamá",
    "nameEn": "Panama",
    "region": "america",
    "subregion": "Central America",
    "countable": true,
    "flag": "🇵🇦"
  },
  "598": {
    "code": "PG",
    "name": "Papúa Nueva Guinea",
    "nameEn": "Papua New Guinea",
    "region": "oceania",
    "subregion": "Melanesia",
    "countable": true,
    "flag": "🇵🇬"
  },
  "600": {
    "code": "PY",
    "name": "Paraguay",
    "nameEn": "Paraguay",
    "region": "america",
    "subregion": "South America",
    "countable": true,
    "flag": "🇵🇾"
  },
  "604": {
    "code": "PE",
    "name": "Perú",
    "nameEn": "Peru",
    "region": "america",
    "subregion": "South America",
    "countable": true,
    "flag": "🇵🇪"
  },
  "608": {
    "code": "PH",
    "name": "Filipinas",
    "nameEn": "Philippines",
    "region": "asia",
    "subregion": "South-Eastern Asia",
    "countable": true,
    "flag": "🇵🇭"
  },
  "612": {
    "code": "PN",
    "name": "Islas Pitcairn",
    "nameEn": "Pitcairn Islands",
    "region": "oceania",
    "subregion": "Polynesia",
    "countable": false,
    "flag": "🇵🇳"
  },
  "616": {
    "code": "PL",
    "name": "Polonia",
    "nameEn": "Poland",
    "region": "europe",
    "subregion": "Central Europe",
    "countable": true,
    "flag": "🇵🇱"
  },
  "620": {
    "code": "PT",
    "name": "Portugal",
    "nameEn": "Portugal",
    "region": "europe",
    "subregion": "Southern Europe",
    "countable": true,
    "flag": "🇵🇹"
  },
  "624": {
    "code": "GW",
    "name": "Guinea-Bisáu",
    "nameEn": "Guinea-Bissau",
    "region": "africa",
    "subregion": "Western Africa",
    "countable": true,
    "flag": "🇬🇼"
  },
  "626": {
    "code": "TL",
    "name": "Timor Oriental",
    "nameEn": "Timor-Leste",
    "region": "asia",
    "subregion": "South-Eastern Asia",
    "countable": true,
    "flag": "🇹🇱"
  },
  "630": {
    "code": "PR",
    "name": "Puerto Rico",
    "nameEn": "Puerto Rico",
    "region": "america",
    "subregion": "Caribbean",
    "countable": false,
    "flag": "🇵🇷"
  },
  "634": {
    "code": "QA",
    "name": "Catar",
    "nameEn": "Qatar",
    "region": "asia",
    "subregion": "Western Asia",
    "countable": true,
    "flag": "🇶🇦"
  },
  "642": {
    "code": "RO",
    "name": "Rumania",
    "nameEn": "Romania",
    "region": "europe",
    "subregion": "Southeast Europe",
    "countable": true,
    "flag": "🇷🇴"
  },
  "643": {
    "code": "RU",
    "name": "Rusia",
    "nameEn": "Russia",
    "region": "europe",
    "subregion": "Eastern Europe",
    "countable": true,
    "flag": "🇷🇺"
  },
  "646": {
    "code": "RW",
    "name": "Ruanda",
    "nameEn": "Rwanda",
    "region": "africa",
    "subregion": "Eastern Africa",
    "countable": true,
    "flag": "🇷🇼"
  },
  "652": {
    "code": "BL",
    "name": "San Bartolomé",
    "nameEn": "Saint Barthélemy",
    "region": "america",
    "subregion": "Caribbean",
    "countable": false,
    "flag": "🇧🇱"
  },
  "654": {
    "code": "SH",
    "name": "Santa Elena, Ascensión y Tristán de Acuña",
    "nameEn": "Saint Helena, Ascension and Tristan da Cunha",
    "region": "africa",
    "subregion": "Western Africa",
    "countable": false,
    "flag": "🇸🇭"
  },
  "659": {
    "code": "KN",
    "name": "San Cristóbal y Nieves",
    "nameEn": "Saint Kitts and Nevis",
    "region": "america",
    "subregion": "Caribbean",
    "countable": true,
    "flag": "🇰🇳"
  },
  "660": {
    "code": "AI",
    "name": "Anguilla",
    "nameEn": "Anguilla",
    "region": "america",
    "subregion": "Caribbean",
    "countable": false,
    "flag": "🇦🇮"
  },
  "662": {
    "code": "LC",
    "name": "Santa Lucía",
    "nameEn": "Saint Lucia",
    "region": "america",
    "subregion": "Caribbean",
    "countable": true,
    "flag": "🇱🇨"
  },
  "663": {
    "code": "MF",
    "name": "Saint Martin",
    "nameEn": "Saint Martin",
    "region": "america",
    "subregion": "Caribbean",
    "countable": false,
    "flag": "🇲🇫"
  },
  "666": {
    "code": "PM",
    "name": "San Pedro y Miquelón",
    "nameEn": "Saint Pierre and Miquelon",
    "region": "america",
    "subregion": "North America",
    "countable": false,
    "flag": "🇵🇲"
  },
  "670": {
    "code": "VC",
    "name": "San Vicente y Granadinas",
    "nameEn": "Saint Vincent and the Grenadines",
    "region": "america",
    "subregion": "Caribbean",
    "countable": true,
    "flag": "🇻🇨"
  },
  "674": {
    "code": "SM",
    "name": "San Marino",
    "nameEn": "San Marino",
    "region": "europe",
    "subregion": "Southern Europe",
    "countable": true,
    "flag": "🇸🇲"
  },
  "678": {
    "code": "ST",
    "name": "Santo Tomé y Príncipe",
    "nameEn": "São Tomé and Príncipe",
    "region": "africa",
    "subregion": "Middle Africa",
    "countable": true,
    "flag": "🇸🇹"
  },
  "682": {
    "code": "SA",
    "name": "Arabia Saudí",
    "nameEn": "Saudi Arabia",
    "region": "asia",
    "subregion": "Western Asia",
    "countable": true,
    "flag": "🇸🇦"
  },
  "686": {
    "code": "SN",
    "name": "Senegal",
    "nameEn": "Senegal",
    "region": "africa",
    "subregion": "Western Africa",
    "countable": true,
    "flag": "🇸🇳"
  },
  "688": {
    "code": "RS",
    "name": "Serbia",
    "nameEn": "Serbia",
    "region": "europe",
    "subregion": "Southeast Europe",
    "countable": true,
    "flag": "🇷🇸"
  },
  "690": {
    "code": "SC",
    "name": "Seychelles",
    "nameEn": "Seychelles",
    "region": "africa",
    "subregion": "Eastern Africa",
    "countable": true,
    "flag": "🇸🇨"
  },
  "694": {
    "code": "SL",
    "name": "Sierra Leone",
    "nameEn": "Sierra Leone",
    "region": "africa",
    "subregion": "Western Africa",
    "countable": true,
    "flag": "🇸🇱"
  },
  "702": {
    "code": "SG",
    "name": "Singapur",
    "nameEn": "Singapore",
    "region": "asia",
    "subregion": "South-Eastern Asia",
    "countable": true,
    "flag": "🇸🇬"
  },
  "703": {
    "code": "SK",
    "name": "Eslovaquia",
    "nameEn": "Slovakia",
    "region": "europe",
    "subregion": "Central Europe",
    "countable": true,
    "flag": "🇸🇰"
  },
  "704": {
    "code": "VN",
    "name": "Vietnam",
    "nameEn": "Vietnam",
    "region": "asia",
    "subregion": "South-Eastern Asia",
    "countable": true,
    "flag": "🇻🇳"
  },
  "705": {
    "code": "SI",
    "name": "Eslovenia",
    "nameEn": "Slovenia",
    "region": "europe",
    "subregion": "Central Europe",
    "countable": true,
    "flag": "🇸🇮"
  },
  "706": {
    "code": "SO",
    "name": "Somalia",
    "nameEn": "Somalia",
    "region": "africa",
    "subregion": "Eastern Africa",
    "countable": true,
    "flag": "🇸🇴"
  },
  "710": {
    "code": "ZA",
    "name": "Sudáfrica",
    "nameEn": "South Africa",
    "region": "africa",
    "subregion": "Southern Africa",
    "countable": true,
    "flag": "🇿🇦"
  },
  "716": {
    "code": "ZW",
    "name": "Zimbabue",
    "nameEn": "Zimbabwe",
    "region": "africa",
    "subregion": "Eastern Africa",
    "countable": true,
    "flag": "🇿🇼"
  },
  "724": {
    "code": "ES",
    "name": "España",
    "nameEn": "Spain",
    "region": "europe",
    "subregion": "Southern Europe",
    "countable": true,
    "flag": "🇪🇸"
  },
  "728": {
    "code": "SS",
    "name": "Sudán del Sur",
    "nameEn": "South Sudan",
    "region": "africa",
    "subregion": "Middle Africa",
    "countable": true,
    "flag": "🇸🇸"
  },
  "729": {
    "code": "SD",
    "name": "Sudán",
    "nameEn": "Sudan",
    "region": "africa",
    "subregion": "Northern Africa",
    "countable": true,
    "flag": "🇸🇩"
  },
  "732": {
    "code": "EH",
    "name": "Sahara Occidental",
    "nameEn": "Western Sahara",
    "region": "africa",
    "subregion": "Northern Africa",
    "countable": false,
    "flag": "🇪🇭"
  },
  "740": {
    "code": "SR",
    "name": "Surinam",
    "nameEn": "Suriname",
    "region": "america",
    "subregion": "South America",
    "countable": true,
    "flag": "🇸🇷"
  },
  "748": {
    "code": "SZ",
    "name": "Suazilandia",
    "nameEn": "Eswatini",
    "region": "africa",
    "subregion": "Southern Africa",
    "countable": true,
    "flag": "🇸🇿"
  },
  "752": {
    "code": "SE",
    "name": "Suecia",
    "nameEn": "Sweden",
    "region": "europe",
    "subregion": "Northern Europe",
    "countable": true,
    "flag": "🇸🇪"
  },
  "756": {
    "code": "CH",
    "name": "Suiza",
    "nameEn": "Switzerland",
    "region": "europe",
    "subregion": "Western Europe",
    "countable": true,
    "flag": "🇨🇭"
  },
  "760": {
    "code": "SY",
    "name": "Siria",
    "nameEn": "Syria",
    "region": "asia",
    "subregion": "Western Asia",
    "countable": true,
    "flag": "🇸🇾"
  },
  "762": {
    "code": "TJ",
    "name": "Tayikistán",
    "nameEn": "Tajikistan",
    "region": "asia",
    "subregion": "Central Asia",
    "countable": true,
    "flag": "🇹🇯"
  },
  "764": {
    "code": "TH",
    "name": "Tailandia",
    "nameEn": "Thailand",
    "region": "asia",
    "subregion": "South-Eastern Asia",
    "countable": true,
    "flag": "🇹🇭"
  },
  "768": {
    "code": "TG",
    "name": "Togo",
    "nameEn": "Togo",
    "region": "africa",
    "subregion": "Western Africa",
    "countable": true,
    "flag": "🇹🇬"
  },
  "776": {
    "code": "TO",
    "name": "Tonga",
    "nameEn": "Tonga",
    "region": "oceania",
    "subregion": "Polynesia",
    "countable": true,
    "flag": "🇹🇴"
  },
  "780": {
    "code": "TT",
    "name": "Trinidad y Tobago",
    "nameEn": "Trinidad and Tobago",
    "region": "america",
    "subregion": "Caribbean",
    "countable": true,
    "flag": "🇹🇹"
  },
  "784": {
    "code": "AE",
    "name": "Emiratos Árabes Unidos",
    "nameEn": "United Arab Emirates",
    "region": "asia",
    "subregion": "Western Asia",
    "countable": true,
    "flag": "🇦🇪"
  },
  "788": {
    "code": "TN",
    "name": "Túnez",
    "nameEn": "Tunisia",
    "region": "africa",
    "subregion": "Northern Africa",
    "countable": true,
    "flag": "🇹🇳"
  },
  "792": {
    "code": "TR",
    "name": "Turquía",
    "nameEn": "Türkiye",
    "region": "asia",
    "subregion": "Western Asia",
    "countable": true,
    "flag": "🇹🇷"
  },
  "795": {
    "code": "TM",
    "name": "Turkmenistán",
    "nameEn": "Turkmenistan",
    "region": "asia",
    "subregion": "Central Asia",
    "countable": true,
    "flag": "🇹🇲"
  },
  "796": {
    "code": "TC",
    "name": "Islas Turks y Caicos",
    "nameEn": "Turks and Caicos Islands",
    "region": "america",
    "subregion": "Caribbean",
    "countable": false,
    "flag": "🇹🇨"
  },
  "800": {
    "code": "UG",
    "name": "Uganda",
    "nameEn": "Uganda",
    "region": "africa",
    "subregion": "Eastern Africa",
    "countable": true,
    "flag": "🇺🇬"
  },
  "804": {
    "code": "UA",
    "name": "Ucrania",
    "nameEn": "Ukraine",
    "region": "europe",
    "subregion": "Eastern Europe",
    "countable": true,
    "flag": "🇺🇦"
  },
  "807": {
    "code": "MK",
    "name": "Macedonia del Norte",
    "nameEn": "North Macedonia",
    "region": "europe",
    "subregion": "Southeast Europe",
    "countable": true,
    "flag": "🇲🇰"
  },
  "818": {
    "code": "EG",
    "name": "Egipto",
    "nameEn": "Egypt",
    "region": "africa",
    "subregion": "Northern Africa",
    "countable": true,
    "flag": "🇪🇬"
  },
  "826": {
    "code": "GB",
    "name": "Reino Unido",
    "nameEn": "United Kingdom",
    "region": "europe",
    "subregion": "Northern Europe",
    "countable": true,
    "flag": "🇬🇧"
  },
  "831": {
    "code": "GG",
    "name": "Guernsey",
    "nameEn": "Guernsey",
    "region": "europe",
    "subregion": "Northern Europe",
    "countable": false,
    "flag": "🇬🇬"
  },
  "832": {
    "code": "JE",
    "name": "Jersey",
    "nameEn": "Jersey",
    "region": "europe",
    "subregion": "Northern Europe",
    "countable": false,
    "flag": "🇯🇪"
  },
  "833": {
    "code": "IM",
    "name": "Isla de Man",
    "nameEn": "Isle of Man",
    "region": "europe",
    "subregion": "Northern Europe",
    "countable": false,
    "flag": "🇮🇲"
  },
  "834": {
    "code": "TZ",
    "name": "Tanzania",
    "nameEn": "Tanzania",
    "region": "africa",
    "subregion": "Eastern Africa",
    "countable": true,
    "flag": "🇹🇿"
  },
  "840": {
    "code": "US",
    "name": "Estados Unidos",
    "nameEn": "United States",
    "region": "america",
    "subregion": "North America",
    "countable": true,
    "flag": "🇺🇸"
  },
  "850": {
    "code": "VI",
    "name": "Islas Vírgenes de los Estados Unidos",
    "nameEn": "United States Virgin Islands",
    "region": "america",
    "subregion": "Caribbean",
    "countable": false,
    "flag": "🇻🇮"
  },
  "854": {
    "code": "BF",
    "name": "Burkina Faso",
    "nameEn": "Burkina Faso",
    "region": "africa",
    "subregion": "Western Africa",
    "countable": true,
    "flag": "🇧🇫"
  },
  "858": {
    "code": "UY",
    "name": "Uruguay",
    "nameEn": "Uruguay",
    "region": "america",
    "subregion": "South America",
    "countable": true,
    "flag": "🇺🇾"
  },
  "860": {
    "code": "UZ",
    "name": "Uzbekistán",
    "nameEn": "Uzbekistan",
    "region": "asia",
    "subregion": "Central Asia",
    "countable": true,
    "flag": "🇺🇿"
  },
  "862": {
    "code": "VE",
    "name": "Venezuela",
    "nameEn": "Venezuela",
    "region": "america",
    "subregion": "South America",
    "countable": true,
    "flag": "🇻🇪"
  },
  "876": {
    "code": "WF",
    "name": "Wallis y Futuna",
    "nameEn": "Wallis and Futuna",
    "region": "oceania",
    "subregion": "Polynesia",
    "countable": false,
    "flag": "🇼🇫"
  },
  "882": {
    "code": "WS",
    "name": "Samoa",
    "nameEn": "Samoa",
    "region": "oceania",
    "subregion": "Polynesia",
    "countable": true,
    "flag": "🇼🇸"
  },
  "887": {
    "code": "YE",
    "name": "Yemen",
    "nameEn": "Yemen",
    "region": "asia",
    "subregion": "Western Asia",
    "countable": true,
    "flag": "🇾🇪"
  },
  "894": {
    "code": "ZM",
    "name": "Zambia",
    "nameEn": "Zambia",
    "region": "africa",
    "subregion": "Eastern Africa",
    "countable": true,
    "flag": "🇿🇲"
  },
  "016": {
    "code": "AS",
    "name": "Samoa Americana",
    "nameEn": "American Samoa",
    "region": "oceania",
    "subregion": "Polynesia",
    "countable": false,
    "flag": "🇦🇸"
  },
  "086": {
    "code": "IO",
    "name": "Territorio Británico del Océano Índico",
    "nameEn": "British Indian Ocean Territory",
    "region": "africa",
    "subregion": "Eastern Africa",
    "countable": false,
    "flag": "🇮🇴"
  },
  "060": {
    "code": "BM",
    "name": "Bermudas",
    "nameEn": "Bermuda",
    "region": "america",
    "subregion": "North America",
    "countable": false,
    "flag": "🇧🇲"
  },
  "092": {
    "code": "VG",
    "name": "Islas Vírgenes del Reino Unido",
    "nameEn": "British Virgin Islands",
    "region": "america",
    "subregion": "Caribbean",
    "countable": false,
    "flag": "🇻🇬"
  },
  "090": {
    "code": "SB",
    "name": "Islas Salomón",
    "nameEn": "Solomon Islands",
    "region": "oceania",
    "subregion": "Melanesia",
    "countable": true,
    "flag": "🇸🇧"
  },
  "Kosovo": {
    "code": "XK",
    "name": "Kosovo",
    "nameEn": "Kosovo",
    "region": "europe",
    "subregion": "Southeast Europe",
    "countable": false,
    "flag": "🇽🇰"
  },
  "096": {
    "code": "BN",
    "name": "Brunei",
    "nameEn": "Brunei",
    "region": "asia",
    "subregion": "South-Eastern Asia",
    "countable": true,
    "flag": "🇧🇳"
  },
  "076": {
    "code": "BR",
    "name": "Brasil",
    "nameEn": "Brazil",
    "region": "america",
    "subregion": "South America",
    "countable": true,
    "flag": "🇧🇷"
  },
  "072": {
    "code": "BW",
    "name": "Botswana",
    "nameEn": "Botswana",
    "region": "africa",
    "subregion": "Southern Africa",
    "countable": true,
    "flag": "🇧🇼"
  },
  "070": {
    "code": "BA",
    "name": "Bosnia y Herzegovina",
    "nameEn": "Bosnia and Herzegovina",
    "region": "europe",
    "subregion": "Southeast Europe",
    "countable": true,
    "flag": "🇧🇦"
  },
  "068": {
    "code": "BO",
    "name": "Bolivia",
    "nameEn": "Bolivia",
    "region": "america",
    "subregion": "South America",
    "countable": true,
    "flag": "🇧🇴"
  },
  "064": {
    "code": "BT",
    "name": "Bután",
    "nameEn": "Bhutan",
    "region": "asia",
    "subregion": "Southern Asia",
    "countable": true,
    "flag": "🇧🇹"
  },
  "084": {
    "code": "BZ",
    "name": "Belice",
    "nameEn": "Belize",
    "region": "america",
    "subregion": "Central America",
    "countable": true,
    "flag": "🇧🇿"
  },
  "056": {
    "code": "BE",
    "name": "Bélgica",
    "nameEn": "Belgium",
    "region": "europe",
    "subregion": "Western Europe",
    "countable": true,
    "flag": "🇧🇪"
  },
  "052": {
    "code": "BB",
    "name": "Barbados",
    "nameEn": "Barbados",
    "region": "america",
    "subregion": "Caribbean",
    "countable": true,
    "flag": "🇧🇧"
  },
  "050": {
    "code": "BD",
    "name": "Bangladesh",
    "nameEn": "Bangladesh",
    "region": "asia",
    "subregion": "Southern Asia",
    "countable": true,
    "flag": "🇧🇩"
  },
  "048": {
    "code": "BH",
    "name": "Bahrein",
    "nameEn": "Bahrain",
    "region": "asia",
    "subregion": "Western Asia",
    "countable": true,
    "flag": "🇧🇭"
  },
  "044": {
    "code": "BS",
    "name": "Bahamas",
    "nameEn": "Bahamas",
    "region": "america",
    "subregion": "Caribbean",
    "countable": true,
    "flag": "🇧🇸"
  },
  "031": {
    "code": "AZ",
    "name": "Azerbaiyán",
    "nameEn": "Azerbaijan",
    "region": "asia",
    "subregion": "Western Asia",
    "countable": true,
    "flag": "🇦🇿"
  },
  "040": {
    "code": "AT",
    "name": "Austria",
    "nameEn": "Austria",
    "region": "europe",
    "subregion": "Central Europe",
    "countable": true,
    "flag": "🇦🇹"
  },
  "036": {
    "code": "AU",
    "name": "Australia",
    "nameEn": "Australia",
    "region": "oceania",
    "subregion": "Australia and New Zealand",
    "countable": true,
    "flag": "🇦🇺"
  },
  "051": {
    "code": "AM",
    "name": "Armenia",
    "nameEn": "Armenia",
    "region": "asia",
    "subregion": "Western Asia",
    "countable": true,
    "flag": "🇦🇲"
  },
  "032": {
    "code": "AR",
    "name": "Argentina",
    "nameEn": "Argentina",
    "region": "america",
    "subregion": "South America",
    "countable": true,
    "flag": "🇦🇷"
  },
  "028": {
    "code": "AG",
    "name": "Antigua y Barbuda",
    "nameEn": "Antigua and Barbuda",
    "region": "america",
    "subregion": "Caribbean",
    "countable": true,
    "flag": "🇦🇬"
  },
  "024": {
    "code": "AO",
    "name": "Angola",
    "nameEn": "Angola",
    "region": "africa",
    "subregion": "Middle Africa",
    "countable": true,
    "flag": "🇦🇴"
  },
  "020": {
    "code": "AD",
    "name": "Andorra",
    "nameEn": "Andorra",
    "region": "europe",
    "subregion": "Southern Europe",
    "countable": true,
    "flag": "🇦🇩"
  },
  "012": {
    "code": "DZ",
    "name": "Argelia",
    "nameEn": "Algeria",
    "region": "africa",
    "subregion": "Northern Africa",
    "countable": true,
    "flag": "🇩🇿"
  },
  "008": {
    "code": "AL",
    "name": "Albania",
    "nameEn": "Albania",
    "region": "europe",
    "subregion": "Southeast Europe",
    "countable": true,
    "flag": "🇦🇱"
  },
  "004": {
    "code": "AF",
    "name": "Afganistán",
    "nameEn": "Afghanistan",
    "region": "asia",
    "subregion": "Southern Asia",
    "countable": true,
    "flag": "🇦🇫"
  },
  "010": {
    "code": "AQ",
    "name": "Antártida",
    "nameEn": "Antarctica",
    "region": "antarctica",
    "subregion": null,
    "countable": false,
    "flag": "🇦🇶"
  }
};

/** Índice inverso: alpha-2 -> id de geometría. */
export const GEOMETRY_ID_BY_CODE: Record<string, string> = {
  "BG": "100",
  "MM": "104",
  "BI": "108",
  "BY": "112",
  "KH": "116",
  "CM": "120",
  "CA": "124",
  "CV": "132",
  "KY": "136",
  "CF": "140",
  "LK": "144",
  "TD": "148",
  "CL": "152",
  "CN": "156",
  "TW": "158",
  "CO": "170",
  "KM": "174",
  "CG": "178",
  "CD": "180",
  "CK": "184",
  "CR": "188",
  "HR": "191",
  "CU": "192",
  "CY": "196",
  "CZ": "203",
  "BJ": "204",
  "DK": "208",
  "DM": "212",
  "DO": "214",
  "EC": "218",
  "SV": "222",
  "GQ": "226",
  "ET": "231",
  "ER": "232",
  "EE": "233",
  "FO": "234",
  "FK": "238",
  "GS": "239",
  "FJ": "242",
  "FI": "246",
  "AX": "248",
  "FR": "250",
  "PF": "258",
  "TF": "260",
  "DJ": "262",
  "GA": "266",
  "GE": "268",
  "GM": "270",
  "PS": "275",
  "DE": "276",
  "GH": "288",
  "KI": "296",
  "GR": "300",
  "GL": "304",
  "GD": "308",
  "GU": "316",
  "GT": "320",
  "GN": "324",
  "GY": "328",
  "HT": "332",
  "HM": "334",
  "VA": "336",
  "HN": "340",
  "HK": "344",
  "HU": "348",
  "IS": "352",
  "IN": "356",
  "ID": "360",
  "IR": "364",
  "IQ": "368",
  "IE": "372",
  "IL": "376",
  "IT": "380",
  "CI": "384",
  "JM": "388",
  "JP": "392",
  "KZ": "398",
  "JO": "400",
  "KE": "404",
  "KP": "408",
  "KR": "410",
  "KW": "414",
  "KG": "417",
  "LA": "418",
  "LB": "422",
  "LS": "426",
  "LV": "428",
  "LR": "430",
  "LY": "434",
  "LI": "438",
  "LT": "440",
  "LU": "442",
  "MO": "446",
  "MG": "450",
  "MW": "454",
  "MY": "458",
  "MV": "462",
  "ML": "466",
  "MT": "470",
  "MR": "478",
  "MU": "480",
  "MX": "484",
  "MC": "492",
  "MN": "496",
  "MD": "498",
  "ME": "499",
  "MS": "500",
  "MA": "504",
  "MZ": "508",
  "OM": "512",
  "NA": "516",
  "NR": "520",
  "NP": "524",
  "NL": "528",
  "CW": "531",
  "AW": "533",
  "SX": "534",
  "NC": "540",
  "VU": "548",
  "NZ": "554",
  "NI": "558",
  "NE": "562",
  "NG": "566",
  "NU": "570",
  "NF": "574",
  "NO": "578",
  "MP": "580",
  "FM": "583",
  "MH": "584",
  "PW": "585",
  "PK": "586",
  "PA": "591",
  "PG": "598",
  "PY": "600",
  "PE": "604",
  "PH": "608",
  "PN": "612",
  "PL": "616",
  "PT": "620",
  "GW": "624",
  "TL": "626",
  "PR": "630",
  "QA": "634",
  "RO": "642",
  "RU": "643",
  "RW": "646",
  "BL": "652",
  "SH": "654",
  "KN": "659",
  "AI": "660",
  "LC": "662",
  "MF": "663",
  "PM": "666",
  "VC": "670",
  "SM": "674",
  "ST": "678",
  "SA": "682",
  "SN": "686",
  "RS": "688",
  "SC": "690",
  "SL": "694",
  "SG": "702",
  "SK": "703",
  "VN": "704",
  "SI": "705",
  "SO": "706",
  "ZA": "710",
  "ZW": "716",
  "ES": "724",
  "SS": "728",
  "SD": "729",
  "EH": "732",
  "SR": "740",
  "SZ": "748",
  "SE": "752",
  "CH": "756",
  "SY": "760",
  "TJ": "762",
  "TH": "764",
  "TG": "768",
  "TO": "776",
  "TT": "780",
  "AE": "784",
  "TN": "788",
  "TR": "792",
  "TM": "795",
  "TC": "796",
  "UG": "800",
  "UA": "804",
  "MK": "807",
  "EG": "818",
  "GB": "826",
  "GG": "831",
  "JE": "832",
  "IM": "833",
  "TZ": "834",
  "US": "840",
  "VI": "850",
  "BF": "854",
  "UY": "858",
  "UZ": "860",
  "VE": "862",
  "WF": "876",
  "WS": "882",
  "YE": "887",
  "ZM": "894",
  "AS": "016",
  "IO": "086",
  "BM": "060",
  "VG": "092",
  "SB": "090",
  "XK": "Kosovo",
  "BN": "096",
  "BR": "076",
  "BW": "072",
  "BA": "070",
  "BO": "068",
  "BT": "064",
  "BZ": "084",
  "BE": "056",
  "BB": "052",
  "BD": "050",
  "BH": "048",
  "BS": "044",
  "AZ": "031",
  "AT": "040",
  "AU": "036",
  "AM": "051",
  "AR": "032",
  "AG": "028",
  "AO": "024",
  "AD": "020",
  "DZ": "012",
  "AL": "008",
  "AF": "004",
  "AQ": "010"
};

/** Países del recuento oficial por continente. */
export const COUNTRIES_PER_CONTINENT: Record<Continent, number> = {
  "asia": 47,
  "africa": 54,
  "europe": 45,
  "america": 35,
  "oceania": 14
};

export const WORLD_TOTAL = 195;

export const CONTINENTS = [
  "africa",
  "america",
  "asia",
  "europe",
  "oceania"
] as const;

export function isContinent(region: Region): region is Continent {
  return region in COUNTRIES_PER_CONTINENT;
}

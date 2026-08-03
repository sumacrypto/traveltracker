// GENERADO POR scripts/build-subdivision-data.mjs - no editar a mano.
// Fuente: Natural Earth admin-1 1:10m (dominio público).

export type SubdivisionProjection = "mercator" | "albersUsa";

export interface SubdivisionUnit {
  /** ISO 3166-2, por ejemplo AR-B o US-CA */
  code: string;
  name: string;
  /** Si suma al total del país */
  countable: boolean;
}

/**
 * Índice liviano: solo lo que hace falta para listar y buscar países. Los nombres
 * de cada división vienen dentro del TopoJSON del país, que se pide al abrirlo.
 */
export interface SubdivisionSet {
  /** ISO 3166-1 alpha-2 del país */
  countryCode: string;
  /** Plural para la copy: "estados", "provincias" */
  label: string;
  singular: string;
  /** "Los" o "Las", según el género del plural */
  article: string;
  projection: SubdivisionProjection;
  objectKey: string;
  /** Ruta del TopoJSON dentro de public/ */
  file: string;
  /** Cantidad de unidades que cuentan para el porcentaje */
  total: number;
}

export const SUBDIVISION_SETS: Record<string, SubdivisionSet> = {
  "-1": {
    "countryCode": "-1",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/-1.json",
    "total": 12
  },
  "AD": {
    "countryCode": "AD",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ad.json",
    "total": 7
  },
  "AE": {
    "countryCode": "AE",
    "label": "emiratos",
    "singular": "emirato",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ae.json",
    "total": 9
  },
  "AF": {
    "countryCode": "AF",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/af.json",
    "total": 32
  },
  "AG": {
    "countryCode": "AG",
    "label": "parroquias",
    "singular": "parroquia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ag.json",
    "total": 8
  },
  "AI": {
    "countryCode": "AI",
    "label": "distritos",
    "singular": "distrito",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ai.json",
    "total": 15
  },
  "AL": {
    "countryCode": "AL",
    "label": "condados",
    "singular": "condado",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/al.json",
    "total": 12
  },
  "AM": {
    "countryCode": "AM",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/am.json",
    "total": 11
  },
  "AO": {
    "countryCode": "AO",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ao.json",
    "total": 18
  },
  "AQ": {
    "countryCode": "AQ",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/aq.json",
    "total": 2
  },
  "AR": {
    "countryCode": "AR",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ar.json",
    "total": 24
  },
  "AS": {
    "countryCode": "AS",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/as.json",
    "total": 5
  },
  "AT": {
    "countryCode": "AT",
    "label": "estados",
    "singular": "estado",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/at.json",
    "total": 9
  },
  "AU": {
    "countryCode": "AU",
    "label": "estados",
    "singular": "estado",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/au.json",
    "total": 11
  },
  "AX": {
    "countryCode": "AX",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ax.json",
    "total": 11
  },
  "AZ": {
    "countryCode": "AZ",
    "label": "distritos",
    "singular": "distrito",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/az.json",
    "total": 75
  },
  "BA": {
    "countryCode": "BA",
    "label": "cantones",
    "singular": "cantón",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ba.json",
    "total": 10
  },
  "BB": {
    "countryCode": "BB",
    "label": "parroquias",
    "singular": "parroquia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/bb.json",
    "total": 11
  },
  "BD": {
    "countryCode": "BD",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/bd.json",
    "total": 7
  },
  "BE": {
    "countryCode": "BE",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/be.json",
    "total": 11
  },
  "BF": {
    "countryCode": "BF",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/bf.json",
    "total": 45
  },
  "BG": {
    "countryCode": "BG",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/bg.json",
    "total": 28
  },
  "BH": {
    "countryCode": "BH",
    "label": "gobernaciones",
    "singular": "gobernación",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/bh.json",
    "total": 5
  },
  "BI": {
    "countryCode": "BI",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/bi.json",
    "total": 17
  },
  "BJ": {
    "countryCode": "BJ",
    "label": "departamentos",
    "singular": "departamento",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/bj.json",
    "total": 12
  },
  "BM": {
    "countryCode": "BM",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/bm.json",
    "total": 11
  },
  "BN": {
    "countryCode": "BN",
    "label": "distritos",
    "singular": "distrito",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/bn.json",
    "total": 4
  },
  "BO": {
    "countryCode": "BO",
    "label": "departamentos",
    "singular": "departamento",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/bo.json",
    "total": 9
  },
  "BR": {
    "countryCode": "BR",
    "label": "estados",
    "singular": "estado",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/br.json",
    "total": 27
  },
  "BS": {
    "countryCode": "BS",
    "label": "distritos",
    "singular": "distrito",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/bs.json",
    "total": 30
  },
  "BT": {
    "countryCode": "BT",
    "label": "distritos",
    "singular": "distrito",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/bt.json",
    "total": 20
  },
  "BW": {
    "countryCode": "BW",
    "label": "distritos",
    "singular": "distrito",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/bw.json",
    "total": 15
  },
  "BY": {
    "countryCode": "BY",
    "label": "regiones",
    "singular": "región",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/by.json",
    "total": 7
  },
  "BZ": {
    "countryCode": "BZ",
    "label": "distritos",
    "singular": "distrito",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/bz.json",
    "total": 6
  },
  "CA": {
    "countryCode": "CA",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ca.json",
    "total": 13
  },
  "CD": {
    "countryCode": "CD",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/cd.json",
    "total": 11
  },
  "CF": {
    "countryCode": "CF",
    "label": "prefecturas",
    "singular": "prefectura",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/cf.json",
    "total": 17
  },
  "CG": {
    "countryCode": "CG",
    "label": "regiones",
    "singular": "región",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/cg.json",
    "total": 12
  },
  "CH": {
    "countryCode": "CH",
    "label": "cantones",
    "singular": "cantón",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ch.json",
    "total": 26
  },
  "CI": {
    "countryCode": "CI",
    "label": "departamentos",
    "singular": "departamento",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ci.json",
    "total": 19
  },
  "CK": {
    "countryCode": "CK",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ck.json",
    "total": 11
  },
  "CL": {
    "countryCode": "CL",
    "label": "regiones",
    "singular": "región",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/cl.json",
    "total": 15
  },
  "CM": {
    "countryCode": "CM",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/cm.json",
    "total": 10
  },
  "CN": {
    "countryCode": "CN",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/cn.json",
    "total": 32
  },
  "CO": {
    "countryCode": "CO",
    "label": "departamentos",
    "singular": "departamento",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/co.json",
    "total": 33
  },
  "CR": {
    "countryCode": "CR",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/cr.json",
    "total": 7
  },
  "CU": {
    "countryCode": "CU",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/cu.json",
    "total": 16
  },
  "CV": {
    "countryCode": "CV",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/cv.json",
    "total": 22
  },
  "CY": {
    "countryCode": "CY",
    "label": "distritos",
    "singular": "distrito",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/cy.json",
    "total": 5
  },
  "CZ": {
    "countryCode": "CZ",
    "label": "regiones",
    "singular": "región",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/cz.json",
    "total": 14
  },
  "DE": {
    "countryCode": "DE",
    "label": "estados",
    "singular": "estado",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/de.json",
    "total": 16
  },
  "DJ": {
    "countryCode": "DJ",
    "label": "regiones",
    "singular": "región",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/dj.json",
    "total": 6
  },
  "DK": {
    "countryCode": "DK",
    "label": "regiones",
    "singular": "región",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/dk.json",
    "total": 5
  },
  "DM": {
    "countryCode": "DM",
    "label": "parroquias",
    "singular": "parroquia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/dm.json",
    "total": 10
  },
  "DO": {
    "countryCode": "DO",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/do.json",
    "total": 32
  },
  "DZ": {
    "countryCode": "DZ",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/dz.json",
    "total": 48
  },
  "EC": {
    "countryCode": "EC",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ec.json",
    "total": 24
  },
  "EE": {
    "countryCode": "EE",
    "label": "condados",
    "singular": "condado",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ee.json",
    "total": 15
  },
  "EG": {
    "countryCode": "EG",
    "label": "gobernaciones",
    "singular": "gobernación",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/eg.json",
    "total": 27
  },
  "ER": {
    "countryCode": "ER",
    "label": "regiones",
    "singular": "región",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/er.json",
    "total": 6
  },
  "ES": {
    "countryCode": "ES",
    "label": "comunidades",
    "singular": "comunidad",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/es.json",
    "total": 52
  },
  "ET": {
    "countryCode": "ET",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/et.json",
    "total": 11
  },
  "FI": {
    "countryCode": "FI",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/fi.json",
    "total": 18
  },
  "FJ": {
    "countryCode": "FJ",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/fj.json",
    "total": 5
  },
  "FM": {
    "countryCode": "FM",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/fm.json",
    "total": 4
  },
  "FR": {
    "countryCode": "FR",
    "label": "departamentos",
    "singular": "departamento",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/fr.json",
    "total": 101
  },
  "GA": {
    "countryCode": "GA",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ga.json",
    "total": 9
  },
  "GB": {
    "countryCode": "GB",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/gb.json",
    "total": 232
  },
  "GD": {
    "countryCode": "GD",
    "label": "parroquias",
    "singular": "parroquia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/gd.json",
    "total": 7
  },
  "GE": {
    "countryCode": "GE",
    "label": "regiones",
    "singular": "región",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ge.json",
    "total": 12
  },
  "GH": {
    "countryCode": "GH",
    "label": "regiones",
    "singular": "región",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/gh.json",
    "total": 10
  },
  "GL": {
    "countryCode": "GL",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/gl.json",
    "total": 5
  },
  "GM": {
    "countryCode": "GM",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/gm.json",
    "total": 6
  },
  "GN": {
    "countryCode": "GN",
    "label": "prefecturas",
    "singular": "prefectura",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/gn.json",
    "total": 34
  },
  "GQ": {
    "countryCode": "GQ",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/gq.json",
    "total": 7
  },
  "GR": {
    "countryCode": "GR",
    "label": "regiones",
    "singular": "región",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/gr.json",
    "total": 14
  },
  "GT": {
    "countryCode": "GT",
    "label": "departamentos",
    "singular": "departamento",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/gt.json",
    "total": 22
  },
  "GW": {
    "countryCode": "GW",
    "label": "regiones",
    "singular": "región",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/gw.json",
    "total": 9
  },
  "GY": {
    "countryCode": "GY",
    "label": "regiones",
    "singular": "región",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/gy.json",
    "total": 10
  },
  "HK": {
    "countryCode": "HK",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/hk.json",
    "total": 18
  },
  "HN": {
    "countryCode": "HN",
    "label": "departamentos",
    "singular": "departamento",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/hn.json",
    "total": 18
  },
  "HR": {
    "countryCode": "HR",
    "label": "condados",
    "singular": "condado",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/hr.json",
    "total": 20
  },
  "HT": {
    "countryCode": "HT",
    "label": "departamentos",
    "singular": "departamento",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ht.json",
    "total": 10
  },
  "HU": {
    "countryCode": "HU",
    "label": "condados",
    "singular": "condado",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/hu.json",
    "total": 43
  },
  "ID": {
    "countryCode": "ID",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/id.json",
    "total": 33
  },
  "IE": {
    "countryCode": "IE",
    "label": "condados",
    "singular": "condado",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ie.json",
    "total": 26
  },
  "IL": {
    "countryCode": "IL",
    "label": "distritos",
    "singular": "distrito",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/il.json",
    "total": 6
  },
  "IN": {
    "countryCode": "IN",
    "label": "estados",
    "singular": "estado",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/in.json",
    "total": 35
  },
  "IQ": {
    "countryCode": "IQ",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/iq.json",
    "total": 18
  },
  "IR": {
    "countryCode": "IR",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ir.json",
    "total": 30
  },
  "IS": {
    "countryCode": "IS",
    "label": "regiones",
    "singular": "región",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/is.json",
    "total": 9
  },
  "IT": {
    "countryCode": "IT",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/it.json",
    "total": 110
  },
  "JM": {
    "countryCode": "JM",
    "label": "parroquias",
    "singular": "parroquia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/jm.json",
    "total": 14
  },
  "JO": {
    "countryCode": "JO",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/jo.json",
    "total": 12
  },
  "JP": {
    "countryCode": "JP",
    "label": "prefecturas",
    "singular": "prefectura",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/jp.json",
    "total": 47
  },
  "KE": {
    "countryCode": "KE",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ke.json",
    "total": 8
  },
  "KG": {
    "countryCode": "KG",
    "label": "regiones",
    "singular": "región",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/kg.json",
    "total": 8
  },
  "KH": {
    "countryCode": "KH",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/kh.json",
    "total": 24
  },
  "KI": {
    "countryCode": "KI",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ki.json",
    "total": 2
  },
  "KM": {
    "countryCode": "KM",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/km.json",
    "total": 3
  },
  "KN": {
    "countryCode": "KN",
    "label": "parroquias",
    "singular": "parroquia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/kn.json",
    "total": 14
  },
  "KP": {
    "countryCode": "KP",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/kp.json",
    "total": 11
  },
  "KR": {
    "countryCode": "KR",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/kr.json",
    "total": 17
  },
  "KW": {
    "countryCode": "KW",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/kw.json",
    "total": 6
  },
  "KZ": {
    "countryCode": "KZ",
    "label": "regiones",
    "singular": "región",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/kz.json",
    "total": 15
  },
  "LA": {
    "countryCode": "LA",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/la.json",
    "total": 16
  },
  "LB": {
    "countryCode": "LB",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/lb.json",
    "total": 6
  },
  "LC": {
    "countryCode": "LC",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/lc.json",
    "total": 11
  },
  "LI": {
    "countryCode": "LI",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/li.json",
    "total": 11
  },
  "LK": {
    "countryCode": "LK",
    "label": "distritos",
    "singular": "distrito",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/lk.json",
    "total": 25
  },
  "LR": {
    "countryCode": "LR",
    "label": "condados",
    "singular": "condado",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/lr.json",
    "total": 15
  },
  "LS": {
    "countryCode": "LS",
    "label": "distritos",
    "singular": "distrito",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ls.json",
    "total": 10
  },
  "LT": {
    "countryCode": "LT",
    "label": "condados",
    "singular": "condado",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/lt.json",
    "total": 10
  },
  "LU": {
    "countryCode": "LU",
    "label": "distritos",
    "singular": "distrito",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/lu.json",
    "total": 3
  },
  "LV": {
    "countryCode": "LV",
    "label": "municipios",
    "singular": "municipio",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/lv.json",
    "total": 114
  },
  "LY": {
    "countryCode": "LY",
    "label": "gobernaciones",
    "singular": "gobernación",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ly.json",
    "total": 22
  },
  "MA": {
    "countryCode": "MA",
    "label": "regiones",
    "singular": "región",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ma.json",
    "total": 16
  },
  "MD": {
    "countryCode": "MD",
    "label": "distritos",
    "singular": "distrito",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/md.json",
    "total": 38
  },
  "ME": {
    "countryCode": "ME",
    "label": "municipios",
    "singular": "municipio",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/me.json",
    "total": 21
  },
  "MG": {
    "countryCode": "MG",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/mg.json",
    "total": 6
  },
  "MH": {
    "countryCode": "MH",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/mh.json",
    "total": 2
  },
  "MK": {
    "countryCode": "MK",
    "label": "regiones",
    "singular": "región",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/mk.json",
    "total": 84
  },
  "ML": {
    "countryCode": "ML",
    "label": "regiones",
    "singular": "región",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ml.json",
    "total": 9
  },
  "MM": {
    "countryCode": "MM",
    "label": "estados",
    "singular": "estado",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/mm.json",
    "total": 14
  },
  "MN": {
    "countryCode": "MN",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/mn.json",
    "total": 22
  },
  "MP": {
    "countryCode": "MP",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/mp.json",
    "total": 4
  },
  "MR": {
    "countryCode": "MR",
    "label": "regiones",
    "singular": "región",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/mr.json",
    "total": 13
  },
  "MS": {
    "countryCode": "MS",
    "label": "parroquias",
    "singular": "parroquia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ms.json",
    "total": 3
  },
  "MT": {
    "countryCode": "MT",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/mt.json",
    "total": 68
  },
  "MU": {
    "countryCode": "MU",
    "label": "distritos",
    "singular": "distrito",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/mu.json",
    "total": 15
  },
  "MV": {
    "countryCode": "MV",
    "label": "atolones",
    "singular": "atolón",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/mv.json",
    "total": 20
  },
  "MW": {
    "countryCode": "MW",
    "label": "distritos",
    "singular": "distrito",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/mw.json",
    "total": 27
  },
  "MX": {
    "countryCode": "MX",
    "label": "estados",
    "singular": "estado",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/mx.json",
    "total": 33
  },
  "MY": {
    "countryCode": "MY",
    "label": "estados",
    "singular": "estado",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/my.json",
    "total": 16
  },
  "MZ": {
    "countryCode": "MZ",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/mz.json",
    "total": 10
  },
  "NA": {
    "countryCode": "NA",
    "label": "regiones",
    "singular": "región",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/na.json",
    "total": 13
  },
  "NC": {
    "countryCode": "NC",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/nc.json",
    "total": 3
  },
  "NE": {
    "countryCode": "NE",
    "label": "departamentos",
    "singular": "departamento",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ne.json",
    "total": 8
  },
  "NG": {
    "countryCode": "NG",
    "label": "estados",
    "singular": "estado",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ng.json",
    "total": 37
  },
  "NI": {
    "countryCode": "NI",
    "label": "departamentos",
    "singular": "departamento",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ni.json",
    "total": 17
  },
  "NL": {
    "countryCode": "NL",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/nl.json",
    "total": 15
  },
  "NO": {
    "countryCode": "NO",
    "label": "condados",
    "singular": "condado",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/no.json",
    "total": 21
  },
  "NP": {
    "countryCode": "NP",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/np.json",
    "total": 14
  },
  "NR": {
    "countryCode": "NR",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/nr.json",
    "total": 14
  },
  "NZ": {
    "countryCode": "NZ",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/nz.json",
    "total": 23
  },
  "OM": {
    "countryCode": "OM",
    "label": "regiones",
    "singular": "región",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/om.json",
    "total": 11
  },
  "PA": {
    "countryCode": "PA",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/pa.json",
    "total": 12
  },
  "PE": {
    "countryCode": "PE",
    "label": "departamentos",
    "singular": "departamento",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/pe.json",
    "total": 25
  },
  "PF": {
    "countryCode": "PF",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/pf.json",
    "total": 5
  },
  "PG": {
    "countryCode": "PG",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/pg.json",
    "total": 20
  },
  "PH": {
    "countryCode": "PH",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ph.json",
    "total": 83
  },
  "PK": {
    "countryCode": "PK",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/pk.json",
    "total": 8
  },
  "PL": {
    "countryCode": "PL",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/pl.json",
    "total": 16
  },
  "PM": {
    "countryCode": "PM",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/pm.json",
    "total": 2
  },
  "PS": {
    "countryCode": "PS",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ps.json",
    "total": 2
  },
  "PT": {
    "countryCode": "PT",
    "label": "distritos",
    "singular": "distrito",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/pt.json",
    "total": 20
  },
  "PW": {
    "countryCode": "PW",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/pw.json",
    "total": 16
  },
  "PY": {
    "countryCode": "PY",
    "label": "departamentos",
    "singular": "departamento",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/py.json",
    "total": 18
  },
  "QA": {
    "countryCode": "QA",
    "label": "municipios",
    "singular": "municipio",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/qa.json",
    "total": 7
  },
  "RO": {
    "countryCode": "RO",
    "label": "condados",
    "singular": "condado",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ro.json",
    "total": 42
  },
  "RS": {
    "countryCode": "RS",
    "label": "distritos",
    "singular": "distrito",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/rs.json",
    "total": 25
  },
  "RU": {
    "countryCode": "RU",
    "label": "regiones",
    "singular": "región",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ru.json",
    "total": 86
  },
  "RW": {
    "countryCode": "RW",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/rw.json",
    "total": 5
  },
  "SA": {
    "countryCode": "SA",
    "label": "regiones",
    "singular": "región",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/sa.json",
    "total": 13
  },
  "SB": {
    "countryCode": "SB",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/sb.json",
    "total": 9
  },
  "SC": {
    "countryCode": "SC",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/sc.json",
    "total": 26
  },
  "SD": {
    "countryCode": "SD",
    "label": "estados",
    "singular": "estado",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/sd.json",
    "total": 16
  },
  "SE": {
    "countryCode": "SE",
    "label": "condados",
    "singular": "condado",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/se.json",
    "total": 21
  },
  "SG": {
    "countryCode": "SG",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/sg.json",
    "total": 5
  },
  "SH": {
    "countryCode": "SH",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/sh.json",
    "total": 3
  },
  "SI": {
    "countryCode": "SI",
    "label": "municipios",
    "singular": "municipio",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/si.json",
    "total": 192
  },
  "SK": {
    "countryCode": "SK",
    "label": "regiones",
    "singular": "región",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/sk.json",
    "total": 8
  },
  "SL": {
    "countryCode": "SL",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/sl.json",
    "total": 4
  },
  "SM": {
    "countryCode": "SM",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/sm.json",
    "total": 9
  },
  "SN": {
    "countryCode": "SN",
    "label": "regiones",
    "singular": "región",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/sn.json",
    "total": 14
  },
  "SO": {
    "countryCode": "SO",
    "label": "regiones",
    "singular": "región",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/so.json",
    "total": 13
  },
  "SR": {
    "countryCode": "SR",
    "label": "distritos",
    "singular": "distrito",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/sr.json",
    "total": 10
  },
  "SS": {
    "countryCode": "SS",
    "label": "estados",
    "singular": "estado",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ss.json",
    "total": 10
  },
  "ST": {
    "countryCode": "ST",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/st.json",
    "total": 2
  },
  "SV": {
    "countryCode": "SV",
    "label": "departamentos",
    "singular": "departamento",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/sv.json",
    "total": 14
  },
  "SY": {
    "countryCode": "SY",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/sy.json",
    "total": 15
  },
  "SZ": {
    "countryCode": "SZ",
    "label": "distritos",
    "singular": "distrito",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/sz.json",
    "total": 4
  },
  "TC": {
    "countryCode": "TC",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/tc.json",
    "total": 6
  },
  "TD": {
    "countryCode": "TD",
    "label": "prefecturas",
    "singular": "prefectura",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/td.json",
    "total": 22
  },
  "TF": {
    "countryCode": "TF",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/tf.json",
    "total": 4
  },
  "TG": {
    "countryCode": "TG",
    "label": "regiones",
    "singular": "región",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/tg.json",
    "total": 5
  },
  "TH": {
    "countryCode": "TH",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/th.json",
    "total": 77
  },
  "TJ": {
    "countryCode": "TJ",
    "label": "regiones",
    "singular": "región",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/tj.json",
    "total": 5
  },
  "TL": {
    "countryCode": "TL",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/tl.json",
    "total": 13
  },
  "TM": {
    "countryCode": "TM",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/tm.json",
    "total": 5
  },
  "TN": {
    "countryCode": "TN",
    "label": "gobernaciones",
    "singular": "gobernación",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/tn.json",
    "total": 23
  },
  "TO": {
    "countryCode": "TO",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/to.json",
    "total": 5
  },
  "TR": {
    "countryCode": "TR",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/tr.json",
    "total": 81
  },
  "TT": {
    "countryCode": "TT",
    "label": "regiones",
    "singular": "región",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/tt.json",
    "total": 16
  },
  "TW": {
    "countryCode": "TW",
    "label": "condados",
    "singular": "condado",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/tw.json",
    "total": 21
  },
  "TZ": {
    "countryCode": "TZ",
    "label": "regiones",
    "singular": "región",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/tz.json",
    "total": 30
  },
  "UA": {
    "countryCode": "UA",
    "label": "regiones",
    "singular": "región",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ua.json",
    "total": 25
  },
  "UG": {
    "countryCode": "UG",
    "label": "distritos",
    "singular": "distrito",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ug.json",
    "total": 111
  },
  "UM": {
    "countryCode": "UM",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/um.json",
    "total": 8
  },
  "US": {
    "countryCode": "US",
    "label": "estados",
    "singular": "estado",
    "article": "Los",
    "projection": "albersUsa",
    "objectKey": "units",
    "file": "/geo/subdivisions/us.json",
    "total": 51
  },
  "UY": {
    "countryCode": "UY",
    "label": "departamentos",
    "singular": "departamento",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/uy.json",
    "total": 19
  },
  "UZ": {
    "countryCode": "UZ",
    "label": "regiones",
    "singular": "región",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/uz.json",
    "total": 14
  },
  "VC": {
    "countryCode": "VC",
    "label": "parroquias",
    "singular": "parroquia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/vc.json",
    "total": 6
  },
  "VE": {
    "countryCode": "VE",
    "label": "estados",
    "singular": "estado",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ve.json",
    "total": 26
  },
  "VI": {
    "countryCode": "VI",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/vi.json",
    "total": 3
  },
  "VN": {
    "countryCode": "VN",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/vn.json",
    "total": 63
  },
  "VU": {
    "countryCode": "VU",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/vu.json",
    "total": 6
  },
  "WF": {
    "countryCode": "WF",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/wf.json",
    "total": 3
  },
  "WS": {
    "countryCode": "WS",
    "label": "divisiones",
    "singular": "división",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ws.json",
    "total": 11
  },
  "XK": {
    "countryCode": "XK",
    "label": "distritos",
    "singular": "distrito",
    "article": "Los",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/xk.json",
    "total": 30
  },
  "YE": {
    "countryCode": "YE",
    "label": "gobernaciones",
    "singular": "gobernación",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/ye.json",
    "total": 21
  },
  "ZA": {
    "countryCode": "ZA",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/za.json",
    "total": 9
  },
  "ZM": {
    "countryCode": "ZM",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/zm.json",
    "total": 10
  },
  "ZW": {
    "countryCode": "ZW",
    "label": "provincias",
    "singular": "provincia",
    "article": "Las",
    "projection": "mercator",
    "objectKey": "units",
    "file": "/geo/subdivisions/zw.json",
    "total": 10
  }
};

export function getSubdivisionSet(countryCode: string): SubdivisionSet | null {
  return SUBDIVISION_SETS[countryCode] ?? null;
}

/** Países que tienen drill-down disponible. */
export const SUBDIVISION_COUNTRY_CODES: string[] = Object.keys(SUBDIVISION_SETS);

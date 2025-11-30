
import { COUNTRY_ALIASES, CountryDefinition } from '../data/countryAliases';

// 1. Build lookup tables once
const NUMERIC_TO_ISO2: Record<string, string> = {};
const ALIAS_TO_ISO2: Record<string, string> = {};

COUNTRY_ALIASES.forEach((country) => {
  // Map numeric ID (from TopoJSON) to ISO2
  NUMERIC_TO_ISO2[country.numeric] = country.iso2;
  // Also handle numeric strings with/without leading zeros just in case
  NUMERIC_TO_ISO2[String(Number(country.numeric))] = country.iso2;

  // Map all known aliases to ISO2
  const lowerIso2 = country.iso2.toLowerCase();
  const lowerIso3 = country.iso3.toLowerCase();
  
  ALIAS_TO_ISO2[lowerIso2] = country.iso2;
  ALIAS_TO_ISO2[lowerIso3] = country.iso2;
  
  country.aliases.forEach((alias) => {
    ALIAS_TO_ISO2[alias.toLowerCase()] = country.iso2;
  });
});

/**
 * Resolves a single user input token (e.g. "usa", "India", "AE") to a valid ISO2 code.
 */
export const resolveCountryToken = (token: string): string | null => {
  const key = token.trim().toLowerCase();
  if (!key) return null;
  return ALIAS_TO_ISO2[key] || null;
};

/**
 * Maps a TopoJSON numeric ID (string or number) to an ISO Alpha-2 code.
 */
export const getIso2FromNumeric = (numericId: string | number): string | null => {
  const idStr = String(numericId);
  // Try direct lookup first
  if (NUMERIC_TO_ISO2[idStr]) return NUMERIC_TO_ISO2[idStr];
  
  // Try padding with zeros to length 3 (standard ISO numeric format)
  const padded = idStr.padStart(3, '0');
  return NUMERIC_TO_ISO2[padded] || null;
};

/**
 * Parses raw input text into resolved ISO2 codes and unknown tokens.
 */
export const parseCountryInput = (text: string) => {
  const rawTokens = text.split(/[\n,]+/).map(t => t.trim()).filter(Boolean);
  const matchedIso2 = new Set<string>();
  const unknownTerms: string[] = [];

  rawTokens.forEach(token => {
    const iso2 = resolveCountryToken(token);
    if (iso2) {
      matchedIso2.add(iso2);
    } else {
      unknownTerms.push(token);
    }
  });

  return { matchedIds: matchedIso2, unknownTerms };
};

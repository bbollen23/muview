// Check if we are running in the browser
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

const stripVar = (_string: string): string => {
    const result = _string.replace(/^var\((.*)\)$/, '$1');
    return result;
}

// HSL to RGB conversion function
const hslToRgb = (hsl: string): string | null => {
    // let tempHsl = hsl;


    const hslRegex = /hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)/; // Regex for hsl() format
    const plainHslRegex = /^\s*([\d.]+)\s*,?\s*([\d.]+)%\s*,?\s*([\d.]+)%?\s*$/; // Regex for plain HSL (with/without commas)


    let result = hslRegex.exec(hsl) || plainHslRegex.exec(hsl);

    if (!result) {
        return null;
    }

    let h = Number(result[1]);
    let s = Number(result[2]) / 100;
    let l = Number(result[3]) / 100;

    let c = (1 - Math.abs(2 * l - 1)) * s;
    let x = c * (1 - Math.abs((h / 60) % 2 - 1));
    let m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) {
        r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
        r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
        r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
        r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
        r = x; g = 0; b = c;
    } else if (h >= 300 && h < 360) {
        r = c; g = 0; b = x;
    }

    // Convert RGB values to the 0-255 range
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `rgb(${r}, ${g}, ${b})`;
};

// Function to safely get a CSS variable value and convert it to RGB
export const getCSSVariableValue = (variableName: string, theme: string): string | null => {
    if (isBrowser) {
        let hslValue = getComputedStyle(document.documentElement).getPropertyValue(`${variableName}-${theme}`).trim();

        return hslToRgb(hslValue); // Convert HSL to RGB
    }
    return null;  // Return null or fallback if not in the browser
}

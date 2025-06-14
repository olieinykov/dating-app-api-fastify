export const getModelAgeRange = (paramsAge: string): [number, number] => {
    switch (paramsAge) {
        case '18-24': return [18, 24];
        case '25-34': return [25, 34];
        case '35-44': return [35, 44];
        case '45+': return [45, 99];
        default: return [18, 99];
    }
}
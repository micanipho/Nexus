/**
 * Standardizes currency formatting to Rands (ZAR)
 * @param value The numeric value to format
 * @param includeSymbol Whether to prefix with 'R' (default: true)
 * @returns Formatted string, e.g., "R1,250,000" or "R0"
 */
export const formatCurrency = (value: number | undefined | null, includeSymbol: boolean = true): string => {
    if (value === undefined || value === null) return includeSymbol ? 'R0' : '0';
    
    // Use South African English locale for standard million separators
    const formatted = Math.round(value).toLocaleString();
    
    return includeSymbol ? `R${formatted}` : formatted;
};

/**
 * Formats currency with cents for detailed views
 */
export const formatCurrencyDetailed = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return 'R0.00';
    return `R${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

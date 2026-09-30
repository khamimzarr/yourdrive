export function parseCaptionToPath(caption: string) {
    const match = caption.match(/\[YourDrive-Meta:\s*(\{.*\})\s*\]/);
    if (!match) return null;
    try {
        return JSON.parse(match[1]);
    } catch {
        return null;
    }
}

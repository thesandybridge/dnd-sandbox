export function extractUUID(id: string, pattern: string = '^(before|after|into)-'): string {
    const regex = new RegExp(pattern);
    return id.replace(regex, '');
}

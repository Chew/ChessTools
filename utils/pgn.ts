// PGN Creation Utils

export function buildDate() {
    // date is formatted as YYYY.MM.DD
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1 // month is 0-indexed
    const day = date.getDate()
    return `${year}.${month}.${day}`
}
